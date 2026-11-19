package com.anonymous.vkomicmobile

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Color
import android.graphics.Matrix
import android.graphics.pdf.PdfRenderer
import android.net.Uri
import android.os.Environment
import android.provider.DocumentsContract
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import java.io.BufferedInputStream
import java.io.BufferedOutputStream
import java.io.File
import java.io.FileInputStream
import java.io.FileOutputStream
import java.io.IOException
import java.io.InputStream
import java.io.OutputStream
import java.net.HttpURLConnection
import java.net.URL
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.Executors
import java.util.concurrent.Future
import java.util.zip.ZipInputStream

class NativeDownloadModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    companion object {
        private const val EVENT_PROGRESS = "NativeDownloadProgress"
        private const val EVENT_COMPLETE = "NativeDownloadComplete"
        private const val EVENT_ERROR = "NativeDownloadError"
        // VK sert la page HTML du document (et non le fichier) aux clients non reconnus.
        // On imite le client Kate Mobile comme dans le backend desktop (download.rs).
        private const val VKOMIC_USER_AGENT =
            "KateMobileAndroid/110.1 lite-x86_64 (Android 11; SDK 30; x86_64; en)"
        private const val RESPONSE_SNIFF_BYTES = 512
        // Matches the 64 KB input buffer: the local file stream is unbuffered, so
        // smaller chunks meant one write syscall per 8 KB.
        private const val COPY_BUFFER_BYTES = 64 * 1024
        private const val HTTP_RANGE_NOT_SATISFIABLE = 416
    }

    private fun looksLikeHtml(buffer: ByteArray, byteCount: Int): Boolean {
        if (byteCount <= 0) return false
        val sample = String(buffer, 0, byteCount, Charsets.UTF_8)
            .trimStart('\uFEFF', ' ', '\t', '\r', '\n')
            .lowercase()
        return sample.startsWith("<!doctype html") ||
            sample.startsWith("<html") ||
            sample.startsWith("<head") ||
            sample.startsWith("<body")
    }

    private fun streamStartsWithHtml(input: InputStream?): Boolean {
        if (input == null) return false
        return input.use {
            val prefix = ByteArray(RESPONSE_SNIFF_BYTES)
            val count = it.read(prefix)
            looksLikeHtml(prefix, count)
        }
    }

    private fun openValidatedInputStream(connection: HttpURLConnection): BufferedInputStream {
        val contentType = connection.contentType?.lowercase().orEmpty()
        if (contentType.contains("text/html") || contentType.contains("application/xhtml")) {
            throw IOException("VK returned an HTML page instead of the requested file")
        }

        val input = BufferedInputStream(connection.inputStream, 64 * 1024)
        input.mark(RESPONSE_SNIFF_BYTES + 1)
        val prefix = ByteArray(RESPONSE_SNIFF_BYTES)
        val count = input.read(prefix)
        input.reset()

        if (count <= 0) {
            input.close()
            throw IOException("The download response is empty")
        }
        if (looksLikeHtml(prefix, count)) {
            input.close()
            throw IOException("VK returned an HTML page instead of the requested file")
        }
        return input
    }

    private fun openDownloadConnection(url: String, startByte: Long): HttpURLConnection {
        return (URL(url).openConnection() as HttpURLConnection).apply {
            connectTimeout = 15000
            readTimeout = 30000
            requestMethod = "GET"
            instanceFollowRedirects = true
            setRequestProperty("User-Agent", VKOMIC_USER_AGENT)
            setRequestProperty("Accept", "*/*")
            // Keep Content-Length and byte ranges consistent for resume validation.
            setRequestProperty("Accept-Encoding", "identity")
            if (startByte > 0) {
                setRequestProperty("Range", "bytes=$startByte-")
            }
            connect()
        }
    }

    private fun rangeTotal(connection: HttpURLConnection): Long? {
        val contentRange = connection.getHeaderField("Content-Range") ?: return null
        return Regex("bytes\\s+\\*/(\\d+)", RegexOption.IGNORE_CASE)
            .find(contentRange)
            ?.groupValues
            ?.getOrNull(1)
            ?.toLongOrNull()
    }

    private fun validatePartialResponse(connection: HttpURLConnection, expectedStart: Long): Long? {
        if (connection.responseCode != HttpURLConnection.HTTP_PARTIAL) return null
        val contentRange = connection.getHeaderField("Content-Range")
            ?: throw IOException("Missing Content-Range on resumed download")
        val rangeMatch = Regex(
            "bytes\\s+(\\d+)-(\\d+)/(\\d+)",
            RegexOption.IGNORE_CASE
        ).find(contentRange) ?: throw IOException("Invalid Content-Range on partial download")
        val actualStart = rangeMatch.groupValues[1].toLongOrNull()
            ?: throw IOException("Invalid start byte in Content-Range")
        val actualEnd = rangeMatch.groupValues[2].toLongOrNull()
            ?: throw IOException("Invalid end byte in Content-Range")
        val total = rangeMatch.groupValues[3].toLongOrNull()
            ?: throw IOException("Invalid total size in Content-Range")
        if (actualStart != expectedStart) {
            throw IOException("Invalid Content-Range for resumed download")
        }
        if (actualEnd < actualStart || actualEnd >= total) {
            throw IOException("Invalid byte bounds in Content-Range")
        }
        val rangeLength = actualEnd - actualStart + 1
        if (connection.contentLengthLong > 0 && connection.contentLengthLong != rangeLength) {
            throw IOException("Content-Length does not match Content-Range")
        }
        return total
    }

    private fun prepareSafFileName(fileName: String, mimeType: String): String {
        // Eviter le bug "manga.pdf (1)" sans extension en laissant le système ajouter l'extension
        if (mimeType == "application/pdf" && fileName.lowercase().endsWith(".pdf")) {
            return fileName.substring(0, fileName.length - 4)
        }
        return fileName
    }

    private val executor = Executors.newFixedThreadPool(3)
    private val activeDownloads = ConcurrentHashMap<String, DownloadTask>()

    /**
     * Document URI of the folder a SAF URI points to. The download folder picked
     * in Settings is a tree root, but a sub-folder ("tree/<root>/document/<root>/truc")
     * must keep its own document ID: getTreeDocumentId would always give the root.
     */
    private fun folderDocumentUri(folderUri: String): Uri {
        val uri = Uri.parse(folderUri)
        val docId = if (DocumentsContract.isDocumentUri(reactApplicationContext, uri)) {
            DocumentsContract.getDocumentId(uri)
        } else {
            DocumentsContract.getTreeDocumentId(uri)
        }
        return DocumentsContract.buildDocumentUriUsingTree(uri, docId)
    }

    /** Finds the child folder [name] in [parent], or creates it. */
    @Synchronized
    private fun findOrCreateSubfolder(parent: Uri, name: String): Uri {
        val resolver = reactApplicationContext.contentResolver
        val parentId = DocumentsContract.getDocumentId(parent)
        val childrenUri = DocumentsContract.buildChildDocumentsUriUsingTree(parent, parentId)
        val projection = arrayOf(
            DocumentsContract.Document.COLUMN_DOCUMENT_ID,
            DocumentsContract.Document.COLUMN_DISPLAY_NAME,
            DocumentsContract.Document.COLUMN_MIME_TYPE
        )
        resolver.query(childrenUri, projection, null, null, null)?.use { cursor ->
            while (cursor.moveToNext()) {
                val childName = cursor.getString(1) ?: continue
                if (cursor.getString(2) == DocumentsContract.Document.MIME_TYPE_DIR &&
                    childName.equals(name, ignoreCase = true)
                ) {
                    return DocumentsContract.buildDocumentUriUsingTree(parent, cursor.getString(0))
                }
            }
        }
        return DocumentsContract.createDocument(
            resolver, parent, DocumentsContract.Document.MIME_TYPE_DIR, name
        ) ?: throw IOException("Failed to create SAF folder: $name")
    }

    /**
     * Returns the document URI of the sub-folder [name] inside [folderUri],
     * creating it when missing (one folder per comic: "truc/truc 01.pdf").
     */
    @ReactMethod
    fun ensureSafSubfolder(folderUri: String, name: String, promise: Promise) {
        executor.submit {
            try {
                promise.resolve(findOrCreateSubfolder(folderDocumentUri(folderUri), name).toString())
            } catch (e: SecurityException) {
                promise.reject("PERMISSION_DENIED", e.message)
            } catch (e: Exception) {
                promise.reject("SAF_FOLDER_ERROR", e.message)
            }
        }
    }

    // Covers are rendered one at a time, away from the download threads.
    private val coverExecutor = Executors.newSingleThreadExecutor()
    private val coverImageExtensions = setOf("jpg", "jpeg", "png", "webp")
    private val MAX_COVER_ENTRY_BYTES = 30 * 1024 * 1024
    private val MAX_COVER_RATIO = 3
    private val FAILED_COVER_TTL_MS = 24L * 60 * 60 * 1000

    /** Sort key so "T2" comes before "T10". */
    private fun naturalKey(name: String): String =
        Regex("\\d+").replace(name.lowercase()) { it.value.padStart(8, '0') }

    private fun saveCover(bitmap: Bitmap, target: File): String {
        val partial = File(target.path + ".part")
        FileOutputStream(partial).use { bitmap.compress(Bitmap.CompressFormat.JPEG, 82, it) }
        bitmap.recycle()
        partial.renameTo(target)
        return "file://${target.absolutePath}"
    }

    private fun renderPdfCover(uri: Uri, width: Int): Bitmap? {
        val pfd = reactApplicationContext.contentResolver.openFileDescriptor(uri, "r") ?: return null
        val renderer = PdfRenderer(pfd) // takes ownership of pfd
        try {
            if (renderer.pageCount == 0) return null
            val page = renderer.openPage(0)
            try {
                if (page.width <= 0 || page.height <= 0) return null
                val scale = width.toFloat() / page.width
                val height = (page.height * scale).toInt().coerceIn(1, width * MAX_COVER_RATIO)
                val bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
                bitmap.eraseColor(Color.WHITE)
                val matrix = Matrix().apply { setScale(scale, scale) }
                page.render(bitmap, null, matrix, PdfRenderer.Page.RENDER_MODE_FOR_DISPLAY)
                return bitmap
            } finally {
                page.close()
            }
        } finally {
            renderer.close()
        }
    }

    private fun readBoundedEntry(zip: ZipInputStream, declaredSize: Long): ByteArray? {
        if (declaredSize in 0..MAX_COVER_ENTRY_BYTES.toLong()) {
            val data = ByteArray(declaredSize.toInt())
            var off = 0
            while (off < data.size) {
                val n = zip.read(data, off, data.size - off)
                if (n < 0) return null
                off += n
            }
            return if (zip.read() < 0) data else null
        }
        val out = java.io.ByteArrayOutputStream()
        val buffer = ByteArray(64 * 1024)
        while (true) {
            val n = zip.read(buffer)
            if (n < 0) break
            if (out.size() + n > MAX_COVER_ENTRY_BYTES) return null
            out.write(buffer, 0, n)
        }
        return out.toByteArray()
    }

    /** First image of a CBZ archive, by natural name order (page 1 is the cover). */
    private fun renderCbzCover(uri: Uri, width: Int): Bitmap? {
        var bestKey: String? = null
        var bytes: ByteArray? = null
        reactApplicationContext.contentResolver.openInputStream(uri)?.use { raw ->
            ZipInputStream(raw.buffered()).use { zip ->
                generateSequence { zip.nextEntry }.forEach { entry ->
                    val ext = entry.name.substringAfterLast('.', "").lowercase()
                    if (entry.isDirectory || ext !in coverImageExtensions ||
                        entry.name.substringAfterLast('/').startsWith(".")
                    ) return@forEach
                    if (entry.size == 0L || entry.size > MAX_COVER_ENTRY_BYTES) return@forEach
                    val key = naturalKey(entry.name)
                    if (bestKey != null && key >= bestKey!!) return@forEach
                    val data = readBoundedEntry(zip, entry.size) ?: return@forEach
                    if (data.isEmpty()) return@forEach
                    bestKey = key
                    bytes = data
                }
            }
        }
        val data = bytes ?: return null

        val bounds = BitmapFactory.Options().apply { inJustDecodeBounds = true }
        BitmapFactory.decodeByteArray(data, 0, data.size, bounds)
        if (bounds.outWidth <= 0 || bounds.outHeight <= 0) return null
        val maxHeight = width * MAX_COVER_RATIO
        var sample = 1
        while (bounds.outWidth / (sample * 2) >= width || bounds.outHeight / (sample * 2) >= maxHeight) {
            sample *= 2
        }
        var decoded = BitmapFactory.decodeByteArray(
            data, 0, data.size, BitmapFactory.Options().apply { inSampleSize = sample }
        ) ?: return null
        if (decoded.height > decoded.width * MAX_COVER_RATIO) {
            val top = Bitmap.createBitmap(decoded, 0, 0, decoded.width, decoded.width * MAX_COVER_RATIO)
            if (top != decoded) decoded.recycle()
            decoded = top
        }
        if (decoded.width <= width) return decoded
        val scaled = Bitmap.createScaledBitmap(
            decoded, width, (width.toDouble() * decoded.height / decoded.width).toInt().coerceAtLeast(1), true
        )
        if (scaled != decoded) decoded.recycle()
        return scaled
    }

    /**
     * Cover of a comic folder: page 1 of its first PDF or CBZ, sorted by name.
     * Resolves a cached JPEG's file:// URI, or null when the folder holds no
     * readable album (CBR archives cannot be opened natively).
     */
    @ReactMethod
    fun getFolderCover(folderUri: String, width: Int, promise: Promise) {
        coverExecutor.submit {
            try {
                val folder = folderDocumentUri(folderUri)
                val resolver = reactApplicationContext.contentResolver
                val childrenUri = DocumentsContract.buildChildDocumentsUriUsingTree(
                    folder, DocumentsContract.getDocumentId(folder)
                )
                data class Album(val id: String, val name: String, val size: Long, val modified: Long)
                val albums = mutableListOf<Album>()
                resolver.query(
                    childrenUri,
                    arrayOf(
                        DocumentsContract.Document.COLUMN_DOCUMENT_ID,
                        DocumentsContract.Document.COLUMN_DISPLAY_NAME,
                        DocumentsContract.Document.COLUMN_SIZE,
                        DocumentsContract.Document.COLUMN_LAST_MODIFIED
                    ),
                    null, null, null
                )?.use { c ->
                    while (c.moveToNext()) {
                        val name = c.getString(1) ?: continue
                        val ext = name.substringAfterLast('.', "").lowercase()
                        if (ext == "pdf" || ext == "cbz") {
                            albums.add(Album(c.getString(0), name, c.getLong(2), c.getLong(3)))
                        }
                    }
                }
                val album = albums.minByOrNull { naturalKey(it.name) }
                if (album == null) {
                    promise.resolve(null)
                    return@submit
                }

                val dir = File(reactApplicationContext.cacheDir, "folder_covers").apply { mkdirs() }
                val target = File(dir, "${album.id.hashCode()}_${album.size}_${album.modified}_w$width.jpg")
                if (target.length() > 0) {
                    promise.resolve("file://${target.absolutePath}")
                    return@submit
                }
                val failed = File(target.path + ".failed")
                if (failed.exists() && System.currentTimeMillis() - failed.lastModified() < FAILED_COVER_TTL_MS) {
                    promise.resolve(null)
                    return@submit
                }

                runCatching {
                    failed.delete()
                    failed.createNewFile()
                }
                val albumUri = DocumentsContract.buildDocumentUriUsingTree(folder, album.id)
                val bitmap = try {
                    if (album.name.lowercase().endsWith(".pdf")) {
                        renderPdfCover(albumUri, width)
                    } else {
                        renderCbzCover(albumUri, width)
                    }
                } catch (e: Throwable) {
                    null
                }
                if (bitmap == null) {
                    promise.resolve(null)
                } else {
                    val saved = saveCover(bitmap, target)
                    failed.delete()
                    promise.resolve(saved)
                }
            } catch (e: Throwable) {
                // A damaged or half-downloaded album just keeps the folder icon.
                promise.resolve(null)
            }
        }
    }

    override fun getName(): String = "NativeDownloadModule"

    private fun sendEvent(eventName: String, params: WritableMap) {
        reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(eventName, params)
    }

    @ReactMethod
    fun addListener(eventName: String) {
        // Required for RN event emitter
    }

    @ReactMethod
    fun removeListeners(count: Int) {
        // Required for RN event emitter
    }

    /**
     * Démarre un téléchargement avec support de reprise
     * @param id Identifiant unique du téléchargement
     * @param url URL du fichier à télécharger
     * @param filePath Chemin complet du fichier destination
     */
    @ReactMethod
    fun startDownload(id: String, url: String, filePath: String, promise: Promise) {
        // Annuler si déjà en cours
        activeDownloads[id]?.cancel()

        val task = DownloadTask(id, url, filePath)
        activeDownloads[id] = task

        val future = executor.submit {
            try {
                task.run()
                promise.resolve(true)
            } catch (e: Exception) {
                if (!task.isCancelled) {
                    promise.reject("DOWNLOAD_ERROR", e.message)
                } else {
                    promise.resolve(false) // Cancelled, not an error
                }
            } finally {
                activeDownloads.remove(id)
            }
        }
        task.future = future
    }

    /**
     * Met en pause un téléchargement (le fichier partiel est conservé)
     */
    @ReactMethod
    fun pauseDownload(id: String, promise: Promise) {
        val task = activeDownloads[id]
        if (task != null) {
            task.cancel()
            activeDownloads.remove(id)
            promise.resolve(true)
        } else {
            promise.resolve(false)
        }
    }

    /**
     * Annule un téléchargement et supprime le fichier partiel
     */
    @ReactMethod
    fun cancelDownload(id: String, deleteFile: Boolean, promise: Promise) {
        val task = activeDownloads[id]
        if (task != null) {
            task.cancel()
            task.deleteFileOnCancel = deleteFile
            if (deleteFile) {
                try {
                    File(task.filePath).delete()
                } catch (e: Exception) {
                    // Ignore
                }
            }
            activeDownloads.remove(id)
        }
        promise.resolve(true)
    }

    /**
     * Vérifie si un fichier partiel existe et retourne sa taille
     */
    @ReactMethod
    fun getPartialFileSize(filePath: String, promise: Promise) {
        try {
            val file = File(filePath)
            if (file.exists()) {
                promise.resolve(file.length().toDouble())
            } else {
                promise.resolve(0.0)
            }
        } catch (e: Exception) {
            promise.resolve(0.0)
        }
    }

    /**
     * Vérifie si un téléchargement est actif
     */
    @ReactMethod
    fun isDownloading(id: String, promise: Promise) {
        promise.resolve(activeDownloads.containsKey(id))
    }

    /**
     * Liste le contenu d'un dossier SAF avec métadonnées (taille, date) en une seule requete.
     * Beaucoup plus rapide que la boucle getInfoAsync coté JS.
     */
    @ReactMethod
    fun listSafDirectory(folderUri: String, promise: Promise) {
        executor.submit {
            try {
                val context = reactApplicationContext.applicationContext
                val treeUri = folderDocumentUri(folderUri)
                val docId = DocumentsContract.getDocumentId(treeUri)

                // Construire l'URI des enfants
                val childrenUri = DocumentsContract.buildChildDocumentsUriUsingTree(treeUri, docId)

                // Projection demandée
                val projection = arrayOf(
                    DocumentsContract.Document.COLUMN_DOCUMENT_ID,
                    DocumentsContract.Document.COLUMN_DISPLAY_NAME,
                    DocumentsContract.Document.COLUMN_SIZE,
                    DocumentsContract.Document.COLUMN_LAST_MODIFIED,
                    DocumentsContract.Document.COLUMN_MIME_TYPE
                )

                // Trier par nom par défaut
                val sortOrder = "${DocumentsContract.Document.COLUMN_DISPLAY_NAME} ASC"

                val cursor = context.contentResolver.query(childrenUri, projection, null, null, sortOrder)
                val resultArray = Arguments.createArray()

                cursor?.use {
                    val idCol = it.getColumnIndex(DocumentsContract.Document.COLUMN_DOCUMENT_ID)
                    val nameCol = it.getColumnIndex(DocumentsContract.Document.COLUMN_DISPLAY_NAME)
                    val sizeCol = it.getColumnIndex(DocumentsContract.Document.COLUMN_SIZE)
                    val modCol = it.getColumnIndex(DocumentsContract.Document.COLUMN_LAST_MODIFIED)
                    val mimeCol = it.getColumnIndex(DocumentsContract.Document.COLUMN_MIME_TYPE)

                    while (it.moveToNext()) {
                        val childDocId = it.getString(idCol)
                        val name = it.getString(nameCol) ?: "Unknown"
                        val size = if (!it.isNull(sizeCol)) it.getLong(sizeCol) else 0L
                        val modified = if (!it.isNull(modCol)) it.getLong(modCol) else 0L
                        val mime = it.getString(mimeCol)
                        val isDir = mime == DocumentsContract.Document.MIME_TYPE_DIR

                        // Reconstruire l'URI complète du fichier enfant
                        val fileUri = DocumentsContract.buildDocumentUriUsingTree(treeUri, childDocId).toString()

                        val map = Arguments.createMap()
                        map.putString("uri", fileUri)
                        map.putString("name", name)
                        map.putDouble("size", size.toDouble())
                        map.putDouble("lastModified", modified.toDouble())
                        map.putBoolean("isDirectory", isDir)
                        
                        resultArray.pushMap(map)
                    }
                }

                promise.resolve(resultArray)
            } catch (e: Exception) {
                // Fallback ou erreur
                promise.reject("SAF_LIST_ERROR", e.message)
            }
        }
    }

    /**
     * Copie un fichier local vers un dossier SAF de manière optimisée (Stream native)
     */
    @ReactMethod
    fun finalizeDownload(tempPath: String, folderUri: String, fileName: String, mimeType: String, promise: Promise) {
        executor.submit {
            try {
                val sourceFile = File(tempPath)
                if (!sourceFile.exists()) {
                    promise.reject("FILE_NOT_FOUND", "Source file not found: $tempPath")
                    return@submit
                }

                val context = reactApplicationContext.applicationContext
                val resolver = context.contentResolver
                val dirUri = folderDocumentUri(folderUri)

                // 2. Create the file
                // Note: Generic "createDocument" might duplicate filenames (file(1).pdf).
                // If we want overwrite, we must find and delete first.
                // For speed, let's assume we want to create a new one or let system handle it.
                // Ideally we check existence first but that's slow. 
                // Let's implement smart overwrite check locally.
                
                var targetUri: Uri? = null
                
                // Fast listing to check existence (optional optimization, skip if too complex/slow)
                // For now, let's just create. If user wants overwrite, we rely on previous logic or accept duplication.
                // Actually, DocumentFile API is slow. Let's try direct creation.
                
                // Try create
                try {
                    val safeName = prepareSafFileName(fileName, mimeType)
                    targetUri = DocumentsContract.createDocument(resolver, dirUri, mimeType, safeName)
                } catch (e: Exception) {
                    // Fallback or permission issue
                    promise.reject("CREATE_ERROR", "Failed to create document: ${e.message}")
                    return@submit
                }

                if (targetUri == null) {
                    promise.reject("CREATE_ERROR", "Failed to create document (null uri)")
                    return@submit
                }

                // 3. Native Stream Copy with buffered I/O
                val rawOutputStream = resolver.openOutputStream(targetUri)
                if (rawOutputStream == null) {
                    promise.reject("STREAM_ERROR", "Failed to open output stream")
                    return@submit
                }

                val inputStream = BufferedInputStream(FileInputStream(sourceFile), 512 * 1024)
                val outputStream = BufferedOutputStream(rawOutputStream, 512 * 1024)

                val buffer = ByteArray(512 * 1024) // 512KB buffer
                var bytesRead: Int
                while (inputStream.read(buffer).also { bytesRead = it } != -1) {
                    outputStream.write(buffer, 0, bytesRead)
                }

                outputStream.flush()
                outputStream.close()
                inputStream.close()

                // 4. Delete temp file on success
                sourceFile.delete()

                promise.resolve(targetUri.toString())

            } catch (e: Exception) {
                promise.reject("COPY_ERROR", e.message)
            }
        }
    }


    /**
     * Démarre un téléchargement directement vers un dossier SAF (sans fichier temp intermédiaire)
     * @param id Identifiant unique du téléchargement
     * @param url URL du fichier à télécharger
     * @param safFolderUri URI du dossier SAF destination (content://...)
     * @param fileName Nom du fichier destination
     * @param mimeType Type MIME du fichier
     */
    @ReactMethod
    fun startDownloadToSaf(id: String, url: String, safFolderUri: String, fileName: String, mimeType: String, existingUri: String?, promise: Promise) {
        // Annuler si déjà en cours
        activeDownloads[id]?.cancel()

        val task = SafDownloadTask(id, url, safFolderUri, fileName, mimeType, existingUri)
        activeDownloads[id] = task

        val future = executor.submit {
            try {
                task.run()
                promise.resolve(true)
            } catch (e: Exception) {
                if (!task.isCancelled) {
                    promise.reject("DOWNLOAD_ERROR", e.message)
                } else {
                    promise.resolve(false)
                }
            } finally {
                activeDownloads.remove(id)
            }
        }
        task.future = future
    }

    private open inner class DownloadTask(
        val id: String,
        private val url: String,
        val filePath: String
    ) {
        @Volatile
        var isCancelled = false
        @Volatile
        var deleteFileOnCancel = false
        var future: Future<*>? = null

        fun cancel() {
            isCancelled = true
            future?.cancel(true)
        }

        open fun run() {
            var connection: HttpURLConnection? = null
            var outputStream: FileOutputStream? = null

            try {
                val file = File(filePath)
                val parentDir = file.parentFile
                if (parentDir != null && !parentDir.exists()) {
                    parentDir.mkdirs()
                }

                // Vérifier si un fichier partiel existe. Une ancienne réponse HTML ne doit
                // jamais être reprise comme si elle faisait partie du document.
                var startByte: Long = 0
                if (file.exists()) {
                    if (streamStartsWithHtml(FileInputStream(file))) {
                        file.delete()
                    } else {
                        startByte = file.length()
                    }
                }

                connection = openDownloadConnection(url, startByte)
                var responseCode = connection.responseCode

                // Gérer les différents codes de réponse
                if (responseCode == HTTP_RANGE_NOT_SATISFIABLE) {
                    val remoteTotal = rangeTotal(connection)
                    if (startByte > 0 && remoteTotal == startByte) {
                        val params = Arguments.createMap().apply {
                            putString("id", id)
                            putDouble("receivedBytes", startByte.toDouble())
                            putDouble("totalBytes", startByte.toDouble())
                            putInt("progress", 100)
                            putString("path", filePath)
                        }
                        sendEvent(EVENT_COMPLETE, params)
                        return
                    }

                    // Le fichier partiel ne correspond pas à la ressource distante : repartir
                    // de zéro plutôt que de déclarer un fichier potentiellement corrompu fini.
                    connection.disconnect()
                    file.delete()
                    startByte = 0
                    connection = openDownloadConnection(url, 0)
                    responseCode = connection.responseCode
                }

                if (responseCode != HttpURLConnection.HTTP_OK &&
                    responseCode != HttpURLConnection.HTTP_PARTIAL
                ) {
                    throw IOException("HTTP Error: $responseCode")
                }
                if (responseCode == HttpURLConnection.HTTP_OK) {
                    // Serveur ne supporte pas Range, recommencer depuis le début.
                    startByte = 0
                }

                val activeConnection = connection
                val partialTotal = validatePartialResponse(activeConnection, startByte)

                // Calculer la taille totale
                val contentLength = activeConnection.contentLengthLong
                val totalBytes = partialTotal
                    ?: if (contentLength > 0) startByte + contentLength else -1L

                // Ouvrir le fichier en mode append si on reprend, sinon en mode write
                val append = startByte > 0 && responseCode == 206
                outputStream = FileOutputStream(file, append)

                val inputStream = openValidatedInputStream(activeConnection)
                val buffer = ByteArray(COPY_BUFFER_BYTES)
                var receivedBytes = startByte
                var bytesRead = 0
                var lastProgressTime = System.currentTimeMillis()
                var lastReceivedBytes = startByte
                val startTime = System.currentTimeMillis()

                // Envoyer la progression initiale si on reprend
                if (startByte > 0 && totalBytes > 0) {
                    val initialProgress = ((startByte.toDouble() / totalBytes) * 100).toInt()
                    val params = Arguments.createMap().apply {
                        putString("id", id)
                        putDouble("receivedBytes", startByte.toDouble())
                        putDouble("totalBytes", totalBytes.toDouble())
                        putInt("progress", initialProgress)
                        putDouble("speed", 0.0)
                    }
                    sendEvent(EVENT_PROGRESS, params)
                }

                while (!isCancelled && inputStream.read(buffer).also { bytesRead = it } != -1) {
                    outputStream.write(buffer, 0, bytesRead)
                    receivedBytes += bytesRead

                    // Émettre la progression toutes les 250ms
                    val now = System.currentTimeMillis()
                    if (now - lastProgressTime >= 250) {
                        val progress = if (totalBytes > 0) {
                            ((receivedBytes.toDouble() / totalBytes) * 100).toInt().coerceIn(0, 99)
                        } else {
                            -1 // Indéterminé
                        }

                        // Calculer la vitesse
                        val elapsed = (now - lastProgressTime) / 1000.0
                        val speed = if (elapsed > 0) {
                            ((receivedBytes - lastReceivedBytes) / elapsed).coerceAtMost(1_000_000_000.0)
                        } else {
                            0.0
                        }

                        val params = Arguments.createMap().apply {
                            putString("id", id)
                            putDouble("receivedBytes", receivedBytes.toDouble())
                            putDouble("totalBytes", totalBytes.toDouble())
                            putInt("progress", progress)
                            putDouble("speed", speed)
                        }
                        sendEvent(EVENT_PROGRESS, params)

                        lastProgressTime = now
                        lastReceivedBytes = receivedBytes
                    }
                }

                inputStream.close()
                outputStream.flush()
                outputStream.close()
                outputStream = null

                if (!isCancelled) {
                    if (totalBytes > 0 && receivedBytes != totalBytes) {
                        throw IOException("Incomplete download: received $receivedBytes of $totalBytes bytes")
                    }
                    if (file.length() != receivedBytes) {
                        throw IOException("Downloaded file size does not match received bytes")
                    }
                    // Téléchargement terminé
                    val params = Arguments.createMap().apply {
                        putString("id", id)
                        putDouble("receivedBytes", receivedBytes.toDouble())
                        putDouble("totalBytes", if (totalBytes > 0) totalBytes.toDouble() else receivedBytes.toDouble())
                        putInt("progress", 100)
                        putString("path", filePath)
                    }
                    sendEvent(EVENT_COMPLETE, params)
                }

            } catch (e: Exception) {
                if (!isCancelled) {
                    val params = Arguments.createMap().apply {
                        putString("id", id)
                        putString("error", e.message ?: "Unknown error")
                    }
                    sendEvent(EVENT_ERROR, params)
                    throw e
                }
            } finally {
                try {
                    outputStream?.close()
                    connection?.disconnect()
                } catch (e: Exception) {
                    // Ignore cleanup errors
                }
            }
        }
    }

    /**
     * Téléchargement direct vers SAF (pas de fichier temp, pas de copie)
     */
    private inner class SafDownloadTask(
        id: String,
        private val url: String,
        private val safFolderUri: String,
        private val fileName: String,
        private val mimeType: String,
        private val existingUri: String?
    ) : DownloadTask(id, url, "") {

        override fun run() {
            var connection: HttpURLConnection? = null
            var outputStream: OutputStream? = null
            var createdUri: Uri? = if (existingUri != null) Uri.parse(existingUri) else null

            try {
                val context = reactApplicationContext.applicationContext
                val resolver = context.contentResolver
                
                var startByte: Long = 0
                
                if (createdUri == null) {
                    val dirUri = folderDocumentUri(safFolderUri)
                    
                    val safeName = prepareSafFileName(fileName, mimeType)
                    createdUri = DocumentsContract.createDocument(resolver, dirUri, mimeType, safeName)
                        ?: throw IOException("Failed to create SAF document: $fileName")
                } else {
                    // Vérifier la taille existante pour la reprise
                    try {
                        resolver.query(createdUri, arrayOf(DocumentsContract.Document.COLUMN_SIZE), null, null, null)?.use { cursor ->
                            if (cursor.moveToFirst()) {
                                startByte = cursor.getLong(0)
                            }
                        }
                        if (startByte > 0 && streamStartsWithHtml(resolver.openInputStream(createdUri))) {
                            startByte = 0
                        }
                    } catch (e: Exception) {
                        // Si l'URI n'existe plus ou erreur, repartir de zéro
                        val dirUri = folderDocumentUri(safFolderUri)
                        createdUri = DocumentsContract.createDocument(resolver, dirUri, mimeType, prepareSafFileName(fileName, mimeType))
                            ?: throw IOException("Failed to recreate SAF document: $fileName")
                        startByte = 0
                    }
                }

                connection = openDownloadConnection(url, startByte)
                var responseCode = connection.responseCode

                if (responseCode == HTTP_RANGE_NOT_SATISFIABLE) {
                    val remoteTotal = rangeTotal(connection)
                    if (startByte > 0 && remoteTotal == startByte) {
                        val params = Arguments.createMap().apply {
                            putString("id", id)
                            putDouble("receivedBytes", startByte.toDouble())
                            putDouble("totalBytes", startByte.toDouble())
                            putInt("progress", 100)
                            putString("path", createdUri!!.toString())
                        }
                        sendEvent(EVENT_COMPLETE, params)
                        return
                    }

                    connection.disconnect()
                    startByte = 0
                    connection = openDownloadConnection(url, 0)
                    responseCode = connection.responseCode
                }

                if (responseCode != HttpURLConnection.HTTP_OK &&
                    responseCode != HttpURLConnection.HTTP_PARTIAL
                ) {
                    throw IOException("HTTP Error: $responseCode")
                }

                val effectiveStartByte = if (responseCode == HttpURLConnection.HTTP_PARTIAL) startByte else 0L
                val activeConnection = connection
                val partialTotal = validatePartialResponse(activeConnection, effectiveStartByte)

                val contentLength = activeConnection.contentLengthLong
                val totalBytes = partialTotal
                    ?: if (contentLength > 0) effectiveStartByte + contentLength else -1L

                // Ouvrir directement le stream SAF (mode "wa" pour write-append si reprise)
                // "rwt" forces truncation. Some SAF providers do not reliably truncate
                // an existing document when opened with the looser "w" mode.
                val openMode = if (effectiveStartByte > 0) "wa" else "rwt"
                val rawStream = resolver.openOutputStream(createdUri!!, openMode)
                    ?: throw IOException("Failed to open SAF output stream")
                outputStream = BufferedOutputStream(rawStream, 256 * 1024)

                val inputStream = openValidatedInputStream(activeConnection)
                val buffer = ByteArray(COPY_BUFFER_BYTES)
                var receivedBytes = effectiveStartByte
                var bytesRead = 0
                var lastProgressTime = System.currentTimeMillis()
                var lastReceivedBytes = effectiveStartByte

                // Envoyer URI initialement dans le premier événement
                val initialParams = Arguments.createMap().apply {
                    putString("id", id)
                    putDouble("receivedBytes", receivedBytes.toDouble())
                    putDouble("totalBytes", totalBytes.toDouble())
                    putInt("progress", if (totalBytes > 0) ((receivedBytes.toDouble() / totalBytes) * 100).toInt() else 0)
                    putString("path", createdUri.toString())
                }
                sendEvent(EVENT_PROGRESS, initialParams)

                while (!isCancelled && inputStream.read(buffer).also { bytesRead = it } != -1) {
                    outputStream.write(buffer, 0, bytesRead)
                    receivedBytes += bytesRead

                    val now = System.currentTimeMillis()
                    if (now - lastProgressTime >= 250) {
                        val progress = if (totalBytes > 0) {
                            ((receivedBytes.toDouble() / totalBytes) * 100).toInt().coerceIn(0, 99)
                        } else -1

                        val elapsed = (now - lastProgressTime) / 1000.0
                        val speed = if (elapsed > 0) {
                            ((receivedBytes - lastReceivedBytes) / elapsed).coerceAtMost(1_000_000_000.0)
                        } else 0.0

                        val params = Arguments.createMap().apply {
                            putString("id", id)
                            putDouble("receivedBytes", receivedBytes.toDouble())
                            putDouble("totalBytes", totalBytes.toDouble())
                            putInt("progress", progress)
                            putDouble("speed", speed)
                        }
                        sendEvent(EVENT_PROGRESS, params)

                        lastProgressTime = now
                        lastReceivedBytes = receivedBytes
                    }
                }

                inputStream.close()
                outputStream.flush()
                outputStream.close()
                outputStream = null

                if (!isCancelled) {
                    if (totalBytes > 0 && receivedBytes != totalBytes) {
                        throw IOException("Incomplete download: received $receivedBytes of $totalBytes bytes")
                    }
                    val storedSize = resolver.query(
                        createdUri,
                        arrayOf(DocumentsContract.Document.COLUMN_SIZE),
                        null,
                        null,
                        null
                    )?.use { cursor ->
                        if (cursor.moveToFirst() && !cursor.isNull(0)) cursor.getLong(0) else null
                    }
                    if (storedSize != null && storedSize != receivedBytes) {
                        throw IOException("Downloaded SAF file size does not match received bytes")
                    }
                    val params = Arguments.createMap().apply {
                        putString("id", id)
                        putDouble("receivedBytes", receivedBytes.toDouble())
                        putDouble("totalBytes", if (totalBytes > 0) totalBytes.toDouble() else receivedBytes.toDouble())
                        putInt("progress", 100)
                        putString("path", createdUri.toString())
                    }
                    sendEvent(EVENT_COMPLETE, params)
                } else if (deleteFileOnCancel) {
                    // Si annulé ET qu'on doit supprimer
                    try {
                        DocumentsContract.deleteDocument(resolver, createdUri)
                    } catch (_: Exception) {}
                }

            } catch (e: Exception) {
                // En cas d'erreur, supprimer le fichier SAF partiel
                if (createdUri != null) {
                    try {
                        val resolver = reactApplicationContext.applicationContext.contentResolver
                        DocumentsContract.deleteDocument(resolver, createdUri)
                    } catch (_: Exception) {}
                }

                if (!isCancelled) {
                    val params = Arguments.createMap().apply {
                        putString("id", id)
                        putString("error", e.message ?: "Unknown error")
                    }
                    sendEvent(EVENT_ERROR, params)
                    throw e
                }
            } finally {
                try {
                    outputStream?.close()
                    connection?.disconnect()
                } catch (_: Exception) {}
            }
        }
    }
}
