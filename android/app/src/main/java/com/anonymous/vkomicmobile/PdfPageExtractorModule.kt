package com.anonymous.vkomicmobile

import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.pdf.PdfRenderer
import android.net.Uri
import android.os.ParcelFileDescriptor
import android.os.SystemClock
import android.provider.OpenableColumns
import android.util.Log
import android.view.WindowManager
import com.facebook.react.bridge.*
import kotlinx.coroutines.*
import java.io.File
import java.io.FileNotFoundException
import java.io.FileOutputStream
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.ConcurrentLinkedQueue

class PdfPageExtractorModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    companion object {
        const val TAG = "PdfPageExtractor"
        const val CACHE_SUBDIR = "pdf_pages_cache"
    }

    private val scope = CoroutineScope(Dispatchers.IO + SupervisorJob())
    private var currentDocId: String? = null
    private var currentRenderer: PdfRenderer? = null
    private var currentPfd: ParcelFileDescriptor? = null
    private var currentPageCount: Int = 0

    // JAVASCRIPT: Object Pooling pour éviter la surcharge du Garbage Collector
    private val bitmapPool: ConcurrentHashMap<String, ConcurrentLinkedQueue<Bitmap>> = ConcurrentHashMap()
    private val scopeExtract = CoroutineScope(Dispatchers.IO + SupervisorJob())
    private var currentRegionJob: Job? = null

    private fun getBitmapFromPool(width: Int, height: Int): Bitmap {
        val key = "${width}x${height}"
        val queue = bitmapPool.getOrPut(key) { ConcurrentLinkedQueue() }
        
        var bitmap = queue.poll()
        if (bitmap == null || bitmap.isRecycled) {
            // Création si le pool est vide
            Log.d(TAG, "Creating new Bitmap: $width x $height")
            bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
        } else {
            Log.d(TAG, "Reusing Bitmap from pool: $width x $height")
        }
        
        // Réinitialiser la couleur (nécessaire surtout pour le WebP/PDF)
        bitmap.eraseColor(Color.WHITE)
        return bitmap
    }

    private fun releaseBitmapToPool(bitmap: Bitmap) {
        if (!bitmap.isRecycled) {
            val key = "${bitmap.width}x${bitmap.height}"
            val queue = bitmapPool.getOrPut(key) { ConcurrentLinkedQueue() }
            // Garder seulement 1 seul bitmap en mémoire par taille pour les gigantesques résolutions x3
            if (queue.size < 1) {
                queue.offer(bitmap)
            } else {
                bitmap.recycle() // On recycle l'excédent immédiat pour sauver la RAM
            }
        }
    }
    
    // Nettoyer tous les bitmaps quand le document se ferme
    private fun clearBitmapPool() {
        Log.i(TAG, "Clearing Bitmap pool")
        for ((_, queue) in bitmapPool) {
            var bitmap = queue.poll()
            while (bitmap != null) {
                if (!bitmap.isRecycled) {
                    bitmap.recycle()
                }
                bitmap = queue.poll()
            }
        }
        bitmapPool.clear()
    }

    override fun getName(): String = "PdfPageExtractor"

    override fun onCatalystInstanceDestroy() {
        super.onCatalystInstanceDestroy()
        closeDocument()
        scope.cancel()
        scopeExtract.cancel()
    }

    private fun getCacheDir(): File {
        val dir = File(reactContext.cacheDir, CACHE_SUBDIR)
        if (!dir.exists()) dir.mkdirs()
        return dir
    }

    private fun openRendererFor(pfd: ParcelFileDescriptor): PdfRenderer {
        try {
            return PdfRenderer(pfd)
        } catch (e: Exception) {
            pfd.close()
            throw e
        }
    }

    /**
     * Opens the PDF where it is. Documents from the storage access framework used
     * to be copied whole into the cache before the first page could show (160 MB
     * for a large album); their descriptor is seekable, so PdfRenderer reads them
     * directly. Copying stays as the fallback for providers that only give pipes.
     */
    private fun openPdf(uri: String): Pair<ParcelFileDescriptor, PdfRenderer> {
        if (!uri.startsWith("content://")) {
            val file = if (uri.startsWith("file://")) File(uri.substring(7)) else File(uri)
            if (!file.exists()) throw FileNotFoundException("PDF file not found: $uri")
            val pfd = ParcelFileDescriptor.open(file, ParcelFileDescriptor.MODE_READ_ONLY)
            return Pair(pfd, openRendererFor(pfd))
        }

        val contentUri = Uri.parse(uri)
        val copy = File(getCacheDir(), "temp_source_${uri.hashCode()}.pdf")
        try {
            val pfd = reactContext.contentResolver.openFileDescriptor(contentUri, "r")
                ?: throw FileNotFoundException("PDF file not found: $uri")
            val renderer = openRendererFor(pfd)
            copy.delete() // Left over from versions that always copied.
            return Pair(pfd, renderer)
        } catch (e: FileNotFoundException) {
            throw e
        } catch (e: Exception) {
            Log.w(TAG, "Cannot read $uri in place, copying it", e)
        }

        reactContext.contentResolver.openInputStream(contentUri)?.use { input ->
            FileOutputStream(copy).use { output -> input.copyTo(output) }
        } ?: throw FileNotFoundException("PDF file not found: $uri")
        val pfd = ParcelFileDescriptor.open(copy, ParcelFileDescriptor.MODE_READ_ONLY)
        return Pair(pfd, openRendererFor(pfd))
    }

    /**
     * The document's size. Descriptors from the storage access framework report
     * -1, so the provider is asked instead.
     */
    private fun documentSize(uri: String, pfd: ParcelFileDescriptor): Long {
        if (pfd.statSize >= 0 || !uri.startsWith("content://")) return pfd.statSize
        return try {
            reactContext.contentResolver
                .query(Uri.parse(uri), arrayOf(OpenableColumns.SIZE), null, null, null)
                ?.use { cursor -> if (cursor.moveToFirst() && !cursor.isNull(0)) cursor.getLong(0) else null }
                ?: -1L
        } catch (e: Exception) {
            Log.w(TAG, "Cannot read the size of $uri", e)
            -1L
        }
    }

    @ReactMethod
    fun openDocument(uri: String, promise: Promise) {
        scope.launch {
            try {
                closeDocumentInternal()

                Log.i(TAG, "Opening PDF: $uri")
                val (pfd, renderer) = openPdf(uri)
                // Rendered pages are cached per document. The size keeps a file
                // downloaded again under the same URI from reusing stale pages.
                val docId = "${uri.hashCode()}_${documentSize(uri, pfd)}"

                currentDocId = docId
                currentPfd = pfd
                currentRenderer = renderer
                currentPageCount = renderer.pageCount

                Log.i(TAG, "PDF opened: $currentPageCount pages")

                val result = Arguments.createMap().apply {
                    putInt("pageCount", currentPageCount)
                    putString("docId", docId)
                }

                withContext(Dispatchers.Main) {
                    promise.resolve(result)
                }
            } catch (e: Exception) {
                Log.e(TAG, "Failed to open document", e)
                withContext(Dispatchers.Main) {
                    promise.reject("OPEN_ERROR", e.message)
                }
            }
        }
    }

    @ReactMethod
    fun extractPage(pageNum: Int, width: Int, promise: Promise) {
        // Use a standard Dispatchers.IO scope but isolate extract scope
        scopeExtract.launch {
            try {
                val renderer = currentRenderer
                    ?: throw IllegalStateException("Document not opened")

                if (pageNum < 0 || pageNum >= currentPageCount) {
                    throw IllegalArgumentException("Page index out of bounds: $pageNum")
                }

                // Pages rendered earlier for this document and width are read back
                // from disk: going back a page or reopening an album no longer
                // renders everything again.
                val cached = File(getCacheDir(), "${currentDocId ?: "unknown"}_page_${pageNum}_w${width}.jpg")
                if (cached.length() > 0) {
                    withContext(Dispatchers.Main) { promise.resolve(cached.absolutePath) }
                    return@launch
                }

                // SYNCHRONIZED BLOCK:
                // PdfRenderer is NOT thread-safe. We must ensure only ONE page is rendered at a time per document
                val (absolutePath, success) = synchronized(renderer) {
                    // Check again inside block in case closed while waiting
                    if (currentRenderer == null) {
                        Pair("", false)
                    } else {
                        val startedAt = SystemClock.elapsedRealtime()
                        val page = renderer.openPage(pageNum)
                        val aspectRatio = page.height.toDouble() / page.width.toDouble()
                        val height = (width * aspectRatio).toInt()

                        val bitmap = getBitmapFromPool(width, height)

                        page.render(bitmap, null, null, PdfRenderer.Page.RENDER_MODE_FOR_DISPLAY)
                        page.close()
                        val renderedAt = SystemClock.elapsedRealtime()

                        // JPEG: lossy WebP took several times longer to encode, and the
                        // encode sits between rendering and showing the page. Written
                        // under a temporary name so a killed app never leaves a
                        // truncated page that the disk cache would serve.
                        val partial = File(cached.path + ".part")
                        FileOutputStream(partial).use { output ->
                            bitmap.compress(Bitmap.CompressFormat.JPEG, 90, output)
                        }
                        partial.renameTo(cached)

                        releaseBitmapToPool(bitmap)

                        Log.i(TAG, "Page $pageNum ${width}x$height: render ${renderedAt - startedAt} ms, encode ${SystemClock.elapsedRealtime() - renderedAt} ms")
                        Pair(cached.absolutePath, true)
                    }
                }
                
                if (success) {
                    withContext(Dispatchers.Main) {
                        promise.resolve(absolutePath)
                    }
                } else {
                   withContext(Dispatchers.Main) {
                        promise.reject("RENDER_ERROR", "Document closed before rendering")
                   }
                }
                
            } catch (e: Exception) {
                Log.e(TAG, "Failed to extract page $pageNum", e)
                withContext(Dispatchers.Main) {
                    promise.reject("EXTRACT_ERROR", e.message)
                }
            }
        }
    }

    /**
     * Extrait une REGION spécifique d'une page à haute résolution (pour le zoom par tuiles).
     * cropX, cropY, cropW, cropH sont en coordonnées normalisées [0..1] du PDF (peuvent déborder pour le letterboxing).
     * outputWidth, outputHeight = taille du bitmap de sortie (= taille écran en pixels physiques).
     */
    @ReactMethod
    fun extractPageRegion(
        pageNum: Int,
        cropX: Double, cropY: Double,
        cropW: Double, cropH: Double,
        outputWidth: Int, outputHeight: Int,
        promise: Promise
    ) {
        // Annuler la demande de patch précédente si elle est encore en cours de création.
        // Ça libère instantanément le GPU/CPU pour le patch le plus récent !
        currentRegionJob?.cancel()
        currentRegionJob = scopeExtract.launch {
            try {
                val renderer = currentRenderer
                    ?: throw IllegalStateException("Document not opened")

                if (pageNum < 0 || pageNum >= currentPageCount) {
                    throw IllegalArgumentException("Page index out of bounds: $pageNum")
                }

                val (absolutePath, success) = synchronized(renderer) {
                    if (currentRenderer == null) {
                        Pair("", false)
                    } else {
                        val page = renderer.openPage(pageNum)
                        val pageW = page.width.toFloat()
                        val pageH = page.height.toFloat()

                        // Scale: combien de pixels de sortie par unité normalisée de page
                        val sx = outputWidth.toFloat() / (cropW.toFloat() * pageW)
                        val sy = outputHeight.toFloat() / (cropH.toFloat() * pageH)

                        // Translation: le point (cropX*pageW, cropY*pageH) doit arriver en (0,0) du bitmap
                        val tx = -cropX.toFloat() * pageW * sx
                        val ty = -cropY.toFloat() * pageH * sy

                        val matrix = android.graphics.Matrix()
                        matrix.setScale(sx, sy)
                        matrix.postTranslate(tx, ty)

                        // Si on a été annulé en attendant le lock, on arrête les frais avant de calculer
                        if (!isActive) {
                            page.close()
                            return@synchronized Pair("", false)
                        }

                        val bitmap = Bitmap.createBitmap(outputWidth, outputHeight, Bitmap.Config.ARGB_8888)
                        bitmap.eraseColor(Color.BLACK)

                        page.render(bitmap, null, matrix, PdfRenderer.Page.RENDER_MODE_FOR_DISPLAY)
                        page.close()

                        // Vérifier encore une fois avant l'écriture de l'image
                        if (!isActive) {
                            releaseBitmapToPool(bitmap)
                            return@synchronized Pair("", false)
                        }

                        val docId = currentDocId ?: "unknown"
                        val cacheFile = File(getCacheDir(), "${docId}_region_${pageNum}.jpg")

                        // JPEG for the same reason as whole pages: much faster to encode.
                        FileOutputStream(cacheFile).use { output ->
                            bitmap.compress(Bitmap.CompressFormat.JPEG, 92, output)
                        }

                        releaseBitmapToPool(bitmap)

                        Log.d(TAG, "Region extracted: page=$pageNum crop=($cropX,$cropY,$cropW,$cropH) -> ${cacheFile.absolutePath}")
                        Pair(cacheFile.absolutePath, true)
                    }
                }

                if (success) {
                    withContext(Dispatchers.Main) { promise.resolve(absolutePath) }
                } else {
                    withContext(Dispatchers.Main) { promise.reject("RENDER_ERROR", "Document closed before rendering") }
                }
            } catch (e: Exception) {
                Log.e(TAG, "extractPageRegion failed page $pageNum", e)
                withContext(Dispatchers.Main) { promise.reject("EXTRACT_REGION_ERROR", e.message) }
            }
        }
    }

    /** Keeps the screen on while the reader is open. */
    @ReactMethod
    fun setKeepScreenOn(enabled: Boolean) {
        val activity = getCurrentActivity() ?: return
        activity.runOnUiThread {
            if (enabled) {
                activity.window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
            } else {
                activity.window.clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
            }
        }
    }

    @ReactMethod
    fun getPageCount(promise: Promise) {
        promise.resolve(currentPageCount)
    }

    @ReactMethod
    fun closeDocument() {
        scope.launch {
            closeDocumentInternal()
        }
    }

    private suspend fun closeDocumentInternal() {
        withContext(Dispatchers.IO) {
            try {
                clearBitmapPool()
                // Wait/sync before closing to avoid crashing active renders
                currentRenderer?.let {
                    synchronized(it) {
                        it.close()
                    }
                }
                currentPfd?.close()
                Log.i(TAG, "Document closed")
            } catch (e: Exception) {
                Log.w(TAG, "Error closing document", e)
            }
            currentRenderer = null
            currentPfd = null
            currentDocId = null
            currentPageCount = 0
        }
    }

    @ReactMethod
    fun clearCache(promise: Promise) {
        scope.launch {
            try {
                val cacheDir = getCacheDir()
                if (cacheDir.exists()) {
                    cacheDir.listFiles()?.forEach { it.deleteRecursively() }
                }
                withContext(Dispatchers.Main) {
                    promise.resolve(true)
                }
            } catch (e: Exception) {
                Log.e(TAG, "Failed to clear cache", e)
                withContext(Dispatchers.Main) {
                    promise.reject("CLEAR_ERROR", e.message)
                }
            }
        }
    }

    @ReactMethod
    fun getCacheSize(promise: Promise) {
        scope.launch {
            try {
                val cacheDir = getCacheDir()
                var totalSize = 0L
                if (cacheDir.exists()) {
                    cacheDir.walkTopDown().forEach {
                        if (it.isFile) totalSize += it.length()
                    }
                }
                withContext(Dispatchers.Main) {
                    promise.resolve(totalSize.toDouble())
                }
            } catch (e: Exception) {
                promise.reject("ERROR", e.message)
            }
        }
    }
}
