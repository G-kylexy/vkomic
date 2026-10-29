export type Language = "fr" | "en" | "ru";

export type Translations = {
  nav: {
    home: string;
    library: string;
    downloads: string;
    settings: string;
  };
  common: {
    error: string;
    info: string;
    cancel: string;
    delete: string;
    folder: string;
    read: string;
    offline: string;
    fileNotFound: string;
    noPdfApp: string;
    shareTitle: string;
    shareUnavailable: string;
  };
  home: {
    tagline: string;
    connected: string;
    disconnected: string;
    statsIndexed: string;
    statsVolumes: string;
    statsDownloaded: string;
    statsInProgress: string;
    quickTitle: string;
    quickSubtitle: string;
    openLibrary: string;
    openDownloads: string;
    latestTitle: string;
    latestSubtitle: string;
  };
  library: {
    title: string;
    subtitle: string;
    folderTitle: string;
    folderSubtitle: string;
    recentTitle: string;
    recentSubtitle: string;
    refresh: string;
    empty: string;
    errorNoStorage: string;
    errorRead: string;
    errorPermission: string;
    folderNotFound: string;
    pdfOpenError: string;
    deleteError: string;
    sharePrepareError: string;
    shareError: string;
    folderOpenHint: string;
    note: string;
    deleteConfirmTitle: string;
    deleteConfirmMsg: string;
    loading: string;
    statsFiles: string;
    statsTotal: string;
  };
  settings: {
    connectionTitle: string;
    connectionSubtitle: string;
    signIn: string;
    signingIn: string;
    connected: string;
    logout: string;
    signInFailed: string;
    signInIncomplete: string;
    signInUnknownError: string;
    folderPickError: string;
    groupLabel: string;
    topicLabel: string;
    prefsTitle: string;
    prefsSubtitle: string;
    downloadFolderLabel: string;
    languageLabel: string;
    resetGroupDefaults: string;
    autoSyncLabel: string;
    autoSyncHint: string;
    themeLabel: string;
    themeDark: string;
    themeOled: string;
    maintenanceTitle: string;
    maintenanceSubtitle: string;
    resetLibrary: string;
    clearCache: string;
    resetDatabase: string;
    resetDatabaseDescription: string;
    save: string;
    saved: string;
    headerSubtitle: string;
  };
  reader: {
    back: string;
    loading: string;
    unsupported: string;
    return: string;
    openExternal: string;
    externalError: string;
    noAppAvailable: string;
    modePaged: string;
    modeManga: string;
    modeContinuous: string;
    openError: string;
    pageError: string;
    retry: string;
    pageOf: string;
  };
  downloads: {
    title: string;
    subtitle: string;
    historyTitle: string;
    historySubtitle: string;
    statusCompleted: string;
    statusPaused: string;
    statusDownloading: string;
    statusInProgress: string;
    statusCanceled: string;
    statusError: string;
    errorVkUnavailable: string;
    errorVkDeleted: string;
    labelVkUnavailable: string;
    labelVkDeleted: string;
    emptyTitle: string;
    emptySubtitle: string;
    actionPause: string;
    actionCancel: string;
    actionResume: string;
    actionRetry: string;
    clearList: string;
    errorNoFolder: string;
    errorBlockedType: string;
    statusPending: string;
    sizeUnknown: string;
    readerOpenError: string;
    folderOpenError: string;
    removedFromList: string;
    swipeRemove: string;
    downloadAll: string;
    cancelAll: string;
    a11yPause: string;
    a11yResume: string;
    a11yCancel: string;
  };

  browser: {
    searchPlaceholder: string;
    sync: string;
    syncing: string;
    syncAll: string;
    back: string;
    home: string;
    download: string;
    open: string;
    noTokenTitle: string;
    noTokenSubtitle: string;
    emptyTitle: string;
    emptySubtitle: string;
    searchEmptyTitle: string;
    searchEmptySubtitle: string;
    searchIndexHint: string;
    loading: string;
    errorNoToken: string;
    errorSync: string;
    errorLoad: string;
    errorNoUrl: string;
    errorSessionExpired: string;
    errorRateLimited: string;
    errorAccessDenied: string;
    errorAccountBlocked: string;
    errorAppNotApproved: string;
    results: string;
  };
};

const translations: Record<Language, Translations> = {
  fr: {
    nav: {
      home: "Accueil",
      library: "Bibliothèque",
      downloads: "Téléchargements",
      settings: "Paramètres",
    },
    common: {
      error: "Erreur",
      info: "Information",
      cancel: "Annuler",
      delete: "Supprimer",
      folder: "Dossier",
      read: "Lire",
      offline: "Mode hors-ligne",
      fileNotFound: "Fichier introuvable",
      noPdfApp: "Aucune application PDF n'est installée.",
      shareTitle: "Partage",
      shareUnavailable: "Le partage n'est pas disponible sur cet appareil.",
    },
    home: {
      tagline: "Retrouve ta bibliothèque VK dans un format optimisé mobile.",
      connected: "Connecté",
      disconnected: "Déconnecté",
      statsIndexed: "Séries indexées",
      statsVolumes: "Volumes",
      statsDownloaded: "Téléchargés",
      statsInProgress: "En cours",
      quickTitle: "Actions rapides",
      quickSubtitle: "Raccourcis les plus utilisés",
      openLibrary: "Ouvrir la bibliothèque",
      openDownloads: "Voir les téléchargements",
      latestTitle: "Dernières séries",
      latestSubtitle: "Aperçu rapide",
    },
    library: {
      title: "Bibliothèque",
      subtitle: "Affiche ici tes téléchargements locaux.",
      folderTitle: "Fichiers locaux",
      folderSubtitle: "Vos téléchargements",
      recentTitle: "Fichiers récents",
      recentSubtitle: "Placeholder",
      refresh: "Rafraîchir",
      empty: "Aucun fichier pour l'instant.",
      errorNoStorage: "Stockage local non disponible (documentDirectory).",
      errorRead: "Impossible de lire la bibliothèque locale.",
      errorPermission: "Permission perdue. Veuillez reconfigurer le dossier dans les paramètres.",
      folderNotFound: "Dossier introuvable (clé USB débranchée ?)",
      pdfOpenError: "Impossible d'ouvrir le fichier PDF.",
      deleteError: "Impossible de supprimer le fichier.",
      sharePrepareError: "Impossible de préparer le fichier pour le partage.",
      shareError: "Impossible de partager le fichier.",
      folderOpenHint: "Impossible d'ouvrir le dossier directement. Utilise ton gestionnaire de fichiers.",
      note: "Récupération des fichiers locaux…",
      deleteConfirmTitle: "Supprimer le fichier ?",
      deleteConfirmMsg: "Voulez-vous vraiment supprimer {name} ? Cette action est irréversible.",
      loading: "Chargement...",
      statsFiles: "Fichiers",
      statsTotal: "Total",
    },
    reader: {
      back: "Retour",
      loading: "Chargement du lecteur...",
      unsupported: "Le lecteur intégré ne supporte actuellement que les PDFs locaux.",
      return: "Retour",
      openExternal: "Ouvrir avec une app externe",
      externalError: "Erreur",
      noAppAvailable: "Aucune application PDF disponible",
      modePaged: "Page par page",
      modeManga: "Manga (droite à gauche)",
      modeContinuous: "Lecture continue",
      openError: "Impossible de charger le PDF",
      pageError: "Erreur de chargement",
      retry: "Réessayer",
      pageOf: "Page {page} sur {total}",
    },
    downloads: {
      title: "Téléchargements",
      subtitle: "Suivi temps réel",
      historyTitle: "Historique",
      historySubtitle: "3 derniers téléchargements",
      statusCompleted: "Terminé",
      statusPaused: "En pause",
      statusDownloading: "Téléchargement…",
      statusInProgress: "En cours",
      statusCanceled: "Annulé",
      statusError: "Erreur",
      errorVkUnavailable: "VK ne fournit pas ce fichier pour l'instant. Réessaie plus tard.",
      errorVkDeleted: "VK indique que ce fichier n'est plus disponible ou a été supprimé.",
      labelVkUnavailable: "Indisponible sur VK",
      labelVkDeleted: "Supprimé sur VK",
      emptyTitle: "Aucun téléchargement",
      emptySubtitle: "Lance un téléchargement depuis l'onglet Accueil.",
      actionPause: "Pause",
      actionCancel: "Annuler",
      actionResume: "Reprendre",
      actionRetry: "Réessayer",
      clearList: "Vider la liste",
      errorNoFolder: "Configurez un dossier de téléchargement dans les paramètres",
      errorBlockedType: "Type de fichier bloqué : il pourrait installer ou lancer un programme.",
      statusPending: "En attente",
      sizeUnknown: "Taille inconnue",
      readerOpenError: "Impossible d'ouvrir le lecteur interne.",
      folderOpenError: "Impossible d'ouvrir le dossier.",
      removedFromList: "Téléchargement retiré de la liste",
      swipeRemove: "Libérer",
      downloadAll: "Tout télécharger",
      cancelAll: "Tout annuler",
      a11yPause: "Mettre en pause",
      a11yResume: "Reprendre le téléchargement",
      a11yCancel: "Annuler le téléchargement",
    },
    settings: {
      connectionTitle: "Connexion VK",
      connectionSubtitle: "Connexion sécurisée avec VK ID",
      signIn: "Se connecter avec VK",
      signingIn: "Connexion…",
      connected: "Connecté à VK",
      logout: "Déconnexion",
      signInFailed: "Connexion VK impossible",
      signInIncomplete: "La réponse de VK ID est incomplète ou ne correspond pas à la demande.",
      signInUnknownError: "Une erreur inconnue est survenue.",
      folderPickError: "Impossible de sélectionner le dossier",
      groupLabel: "Group ID",
      topicLabel: "Topic ID",
      prefsTitle: "Préférences",
      prefsSubtitle: "Personnalisation",
      downloadFolderLabel: "Dossier de téléchargement",
      languageLabel: "Langue",
      resetGroupDefaults: "Rétablir les valeurs par défaut",
      autoSyncLabel: "Sync automatique",
      autoSyncHint: "Lance la synchro au démarrage",
      themeLabel: "Thème Visuel",
      themeDark: "Sombre",
      themeOled: "Tokyo Night",
      maintenanceTitle: "Maintenance",
      maintenanceSubtitle: "Cache & données",
      resetLibrary: "Réinitialiser la bibliothèque",
      clearCache: "Effacer le cache",
      resetDatabase: "Réinitialiser la base de données",
      resetDatabaseDescription: "Supprime l'index et les fichiers téléchargés",
      save: "Sauvegarder",
      saved: "Enregistré !",
      headerSubtitle: "Configuration de l'application",
    },
    browser: {
      searchPlaceholder: "Rechercher…",
      sync: "Synchroniser",
      syncing: "Synchronisation…",
      syncAll: "Tout synchroniser",
      back: "Retour",
      home: "Accueil",
      download: "Télécharger",
      open: "Ouvrir",
      noTokenTitle: "Connecte-toi à VK",
      noTokenSubtitle: "La page de connexion VK s'ouvre. Si l'app VK te demande de revenir au navigateur, reviens simplement dans Vkomic.",
      emptyTitle: "Bibliothèque vide",
      emptySubtitle: "Synchronise l'index VK pour afficher les dossiers et fichiers.",
      searchEmptyTitle: "Aucun résultat",
      searchEmptySubtitle: "Aucun contenu ne correspond à ta recherche.",
      searchIndexHint: "Index partiel : lance « Tout synchroniser » pour une recherche complète.",
      loading: "Chargement…",
      errorNoToken: "Connecte-toi avec VK pour synchroniser.",
      errorSync: "Impossible de synchroniser (VK API).",
      errorLoad: "Impossible de charger le contenu.",
      errorNoUrl: "Ce fichier n'a pas d'URL de téléchargement.",
      errorSessionExpired: "Ta session VK a expiré. Reconnecte-toi avec VK ID dans Paramètres.",
      errorRateLimited: "VK limite temporairement les requêtes. Réessaie dans quelques minutes.",
      errorAccessDenied: "VK refuse l'accès à ce contenu pour ce compte.",
      errorAccountBlocked: "Ce compte VK a été bloqué ou supprimé par VK.",
      errorAppNotApproved: "VK n'autorise pas encore cette fonction pour l'application Vkomic.",
      results: "résultat(s)",
    },
  },
  en: {
    nav: {
      home: "Home",
      library: "Library",
      downloads: "Downloads",
      settings: "Settings",
    },
    common: {
      error: "Error",
      info: "Information",
      cancel: "Cancel",
      delete: "Delete",
      folder: "Folder",
      read: "Read",
      offline: "Offline mode",
      fileNotFound: "File not found",
      noPdfApp: "No PDF app is installed.",
      shareTitle: "Share",
      shareUnavailable: "Sharing is not available on this device.",
    },
    home: {
      tagline: "Browse your VK library with a mobile-first UI.",
      connected: "Connected",
      disconnected: "Disconnected",
      statsIndexed: "Indexed series",
      statsVolumes: "Volumes",
      statsDownloaded: "Downloaded",
      statsInProgress: "In progress",
      quickTitle: "Quick actions",
      quickSubtitle: "Most used shortcuts",
      openLibrary: "Open library",
      openDownloads: "Open downloads",
      latestTitle: "Latest series",
      latestSubtitle: "Quick preview",
    },
    library: {
      title: "Library",
      subtitle: "Your local downloads.",
      folderTitle: "Local files",
      folderSubtitle: "Your downloads",
      recentTitle: "Recent files",
      recentSubtitle: "Placeholder",
      refresh: "Refresh",
      empty: "No files yet.",
      errorNoStorage: "Local storage unavailable.",
      errorRead: "Unable to read local library.",
      errorPermission: "Permission lost. Please reconfigure the folder in settings.",
      folderNotFound: "Folder not found (USB drive unplugged?)",
      pdfOpenError: "Could not open the PDF file.",
      deleteError: "Could not delete the file.",
      sharePrepareError: "Could not prepare the file for sharing.",
      shareError: "Could not share the file.",
      folderOpenHint: "Could not open the folder directly. Use your file manager.",
      note: "Fetching local files…",
      deleteConfirmTitle: "Delete file?",
      deleteConfirmMsg: "Are you sure you want to delete {name}? This action cannot be undone.",
      loading: "Loading...",
      statsFiles: "Files",
      statsTotal: "Total",
    },
    reader: {
      back: "Back",
      loading: "Loading reader...",
      unsupported: "The integrated reader currently only supports local PDFs.",
      return: "Return",
      openExternal: "Open with external app",
      externalError: "Error",
      noAppAvailable: "No PDF app available",
      modePaged: "Page by page",
      modeManga: "Manga (right to left)",
      modeContinuous: "Continuous scroll",
      openError: "Could not load the PDF",
      pageError: "Could not load this page",
      retry: "Retry",
      pageOf: "Page {page} of {total}",
    },
    downloads: {
      title: "Downloads",
      subtitle: "Live tracking",
      historyTitle: "History",
      historySubtitle: "Last 3 downloads",
      statusCompleted: "Completed",
      statusPaused: "Paused",
      statusDownloading: "Downloading…",
      statusInProgress: "In progress",
      statusCanceled: "Canceled",
      statusError: "Error",
      errorVkUnavailable: "VK is not serving this file right now. Try again later.",
      errorVkDeleted: "VK says this file is no longer available or was deleted.",
      labelVkUnavailable: "Unavailable on VK",
      labelVkDeleted: "Deleted on VK",
      emptyTitle: "No downloads",
      emptySubtitle: "Start a download from the Home tab.",
      actionPause: "Pause",
      actionCancel: "Cancel",
      actionResume: "Resume",
      actionRetry: "Retry",
      clearList: "Clear list",
      errorNoFolder: "Configure a download folder in settings",
      errorBlockedType: "Blocked file type: it could install or run a program.",
      statusPending: "Pending",
      sizeUnknown: "Size unknown",
      readerOpenError: "Could not open the built-in reader.",
      folderOpenError: "Could not open the folder.",
      removedFromList: "Download removed from the list",
      swipeRemove: "Remove",
      downloadAll: "Download all",
      cancelAll: "Cancel all",
      a11yPause: "Pause",
      a11yResume: "Resume download",
      a11yCancel: "Cancel download",
    },
    settings: {
      connectionTitle: "VK connection",
      connectionSubtitle: "Secure sign-in with VK ID",
      signIn: "Sign in with VK",
      signingIn: "Signing in…",
      connected: "Connected to VK",
      logout: "Sign out",
      signInFailed: "VK sign-in failed",
      signInIncomplete: "VK ID returned an incomplete or mismatched response.",
      signInUnknownError: "An unknown error occurred.",
      folderPickError: "Could not select the folder",
      groupLabel: "Group ID",
      topicLabel: "Topic ID",
      prefsTitle: "Preferences",
      prefsSubtitle: "Customization",
      downloadFolderLabel: "Download folder",
      languageLabel: "Language",
      resetGroupDefaults: "Reset default values",
      autoSyncLabel: "Auto sync",
      autoSyncHint: "Sync index on startup",
      themeLabel: "Visual Theme",
      themeDark: "Dark",
      themeOled: "Tokyo Night",
      maintenanceTitle: "Maintenance",
      maintenanceSubtitle: "Cache & data",
      resetLibrary: "Reset local library",
      clearCache: "Clear cache",
      resetDatabase: "Reset database",
      resetDatabaseDescription: "Deletes index and downloaded files",
      save: "Save",
      saved: "Saved!",
      headerSubtitle: "Application settings",
    },
    browser: {
      searchPlaceholder: "Search…",
      sync: "Sync",
      syncing: "Syncing…",
      syncAll: "Sync All",
      back: "Back",
      home: "Home",
      download: "Download",
      open: "Open",
      noTokenTitle: "Sign in to VK",
      noTokenSubtitle: "The VK sign-in page opens. If the VK app asks you to return to the browser, just come back to Vkomic.",
      emptyTitle: "Empty library",
      emptySubtitle: "Sync the VK index to display folders and files.",
      searchEmptyTitle: "No results",
      searchEmptySubtitle: "No content matches your search.",
      searchIndexHint: "Partial index: run “Sync all” for complete search.",
      loading: "Loading…",
      errorNoToken: "Sign in with VK to sync.",
      errorSync: "Sync failed (VK API).",
      errorLoad: "Unable to load content.",
      errorNoUrl: "This file has no download URL.",
      errorSessionExpired: "Your VK session has expired. Sign in again with VK ID in Settings.",
      errorRateLimited: "VK is temporarily limiting requests. Try again in a few minutes.",
      errorAccessDenied: "VK denies this account access to this content.",
      errorAccountBlocked: "This VK account has been blocked or deleted by VK.",
      errorAppNotApproved: "VK does not allow this feature for the Vkomic app yet.",
      results: "results",
    },
  },
  ru: {
    nav: {
      home: "Главная",
      library: "Библиотека",
      downloads: "Загрузки",
      settings: "Настройки",
    },
    common: {
      error: "Ошибка",
      info: "Информация",
      cancel: "Отмена",
      delete: "Удалить",
      folder: "Папка",
      read: "Читать",
      offline: "Офлайн-режим",
      fileNotFound: "Файл не найден",
      noPdfApp: "Не установлено приложение для PDF.",
      shareTitle: "Поделиться",
      shareUnavailable: "На этом устройстве нельзя поделиться файлом.",
    },
    home: {
      tagline: "VK библиотека в удобном мобильном интерфейсе.",
      connected: "Подключено",
      disconnected: "Отключено",
      statsIndexed: "Серии в индексе",
      statsVolumes: "Тома",
      statsDownloaded: "Скачано",
      statsInProgress: "В процессе",
      quickTitle: "Быстрые действия",
      quickSubtitle: "Часто используемые",
      openLibrary: "Открыть библиотеку",
      openDownloads: "Открыть загрузки",
      latestTitle: "Последние серии",
      latestSubtitle: "Быстрый просмотр",
    },
    library: {
      title: "Библиотека",
      subtitle: "Локальные загрузки.",
      folderTitle: "Локальные файлы",
      folderSubtitle: "Ваши загрузки",
      recentTitle: "Последние файлы",
      recentSubtitle: "Заглушка",
      refresh: "Обновить",
      empty: "Файлов пока нет.",
      errorNoStorage: "Локальное хранилище недоступно.",
      errorRead: "Не удалось прочитать локальную библиотеку.",
      errorPermission: "Разрешение утрачено. Пожалуйста, перенастройте папку в настройках.",
      folderNotFound: "Папка не найдена (флешка отключена?)",
      pdfOpenError: "Не удалось открыть PDF.",
      deleteError: "Не удалось удалить файл.",
      sharePrepareError: "Не удалось подготовить файл для отправки.",
      shareError: "Не удалось поделиться файлом.",
      folderOpenHint: "Не удалось открыть папку напрямую. Воспользуйся файловым менеджером.",
      note: "Получение локальных файлов…",
      deleteConfirmTitle: "Удалить файл?",
      deleteConfirmMsg: "Вы уверены, что хотите удалить {name}? Это действие необратимо.",
      loading: "Загрузка...",
      statsFiles: "Файлы",
      statsTotal: "Всего",
    },
    reader: {
      back: "Назад",
      loading: "Загрузка читалки...",
      unsupported: "Встроенный ридер в данный момент поддерживает только локальные PDF.",
      return: "Вернуться",
      openExternal: "Открыть во внешнем приложении",
      externalError: "Ошибка",
      noAppAvailable: "Нет приложения для PDF",
      modePaged: "Постранично",
      modeManga: "Манга (справа налево)",
      modeContinuous: "Непрерывная прокрутка",
      openError: "Не удалось открыть PDF",
      pageError: "Ошибка загрузки",
      retry: "Повторить",
      pageOf: "Страница {page} из {total}",
    },
    downloads: {
      title: "Загрузки",
      subtitle: "Статус в реальном времени",
      historyTitle: "История",
      historySubtitle: "Последние 3 загрузки",
      statusCompleted: "Готово",
      statusPaused: "Пауза",
      statusDownloading: "Скачивание…",
      statusInProgress: "В процессе",
      statusCanceled: "Отменено",
      statusError: "Ошибка",
      errorVkUnavailable: "VK сейчас не отдаёт этот файл. Попробуй позже.",
      errorVkDeleted: "VK сообщает, что файл недоступен или удалён.",
      labelVkUnavailable: "Недоступен в VK",
      labelVkDeleted: "Удалён в VK",
      emptyTitle: "Загрузок нет",
      emptySubtitle: "Запусти загрузку во вкладке Главная.",
      actionPause: "Пауза",
      actionCancel: "Отмена",
      actionResume: "Продолжить",
      actionRetry: "Повторить",
      clearList: "Очистить список",
      errorNoFolder: "Настройте папку загрузок в настройках",
      errorBlockedType: "Этот тип файла заблокирован: он может установить или запустить программу.",
      statusPending: "В очереди",
      sizeUnknown: "Размер неизвестен",
      readerOpenError: "Не удалось открыть встроенную читалку.",
      folderOpenError: "Не удалось открыть папку.",
      removedFromList: "Загрузка убрана из списка",
      swipeRemove: "Убрать",
      downloadAll: "Скачать всё",
      cancelAll: "Отменить всё",
      a11yPause: "Пауза",
      a11yResume: "Продолжить загрузку",
      a11yCancel: "Отменить загрузку",
    },
    settings: {
      connectionTitle: "Подключение VK",
      connectionSubtitle: "Безопасный вход через VK ID",
      signIn: "Войти через VK",
      signingIn: "Вход…",
      connected: "Подключено к VK",
      logout: "Выйти",
      signInFailed: "Не удалось войти через VK",
      signInIncomplete: "Ответ VK ID неполный или не соответствует запросу.",
      signInUnknownError: "Произошла неизвестная ошибка.",
      folderPickError: "Не удалось выбрать папку",
      groupLabel: "Group ID",
      topicLabel: "Topic ID",
      prefsTitle: "Настройки",
      prefsSubtitle: "Персонализация",
      downloadFolderLabel: "Папка загрузок",
      languageLabel: "Язык",
      resetGroupDefaults: "Сбросить значения по умолчанию",
      autoSyncLabel: "Автосинхронизация",
      autoSyncHint: "Синхронизация при старте",
      themeLabel: "Тема оформления",
      themeDark: "Темная",
      themeOled: "Tokyo Night",
      maintenanceTitle: "Обслуживание",
      maintenanceSubtitle: "Кэш и данные",
      resetLibrary: "Сбросить локальную библиотеку",
      clearCache: "Очистить кэш",
      resetDatabase: "Сбросить базу данных",
      resetDatabaseDescription: "Удаляет индекс и загруженные файлы",
      save: "Сохранить",
      saved: "Сохранено!",
      headerSubtitle: "Настройки приложения",
    },
    browser: {
      searchPlaceholder: "Поиск…",
      sync: "Синхронизировать",
      syncing: "Синхронизация…",
      syncAll: "Синхронизировать всё",
      back: "Назад",
      home: "Главная",
      download: "Скачать",
      open: "Открыть",
      noTokenTitle: "Войдите в VK",
      noTokenSubtitle: "Откроется страница входа VK. Если приложение VK попросит вернуться в браузер, просто вернитесь в Vkomic.",
      emptyTitle: "Библиотека пуста",
      emptySubtitle: "Синхронизируйте индекс VK, чтобы увидеть папки и файлы.",
      searchEmptyTitle: "Ничего не найдено",
      searchEmptySubtitle: "По вашему запросу ничего не найдено.",
      searchIndexHint: "Индекс частичный: запусти «Полную синхронизацию» для полного поиска.",
      loading: "Загрузка…",
      errorNoToken: "Войдите через VK, чтобы синхронизировать.",
      errorSync: "Не удалось синхронизировать (VK API).",
      errorLoad: "Не удалось загрузить содержимое.",
      errorNoUrl: "У этого файла нет URL для скачивания.",
      errorSessionExpired: "Сессия VK истекла. Войдите снова через VK ID в настройках.",
      errorRateLimited: "VK временно ограничивает запросы. Повторите через несколько минут.",
      errorAccessDenied: "VK запрещает этому аккаунту доступ к этому контенту.",
      errorAccountBlocked: "Этот аккаунт VK заблокирован или удалён.",
      errorAppNotApproved: "VK пока не разрешает эту функцию для приложения Vkomic.",
      results: "результат(ов)",
    },
  },
};

export const getT = (language: Language): Translations =>
  translations[language] ?? translations.fr;
