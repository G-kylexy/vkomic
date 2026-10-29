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
    confirm: string;
    undo: string;
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
    emptySubtitle: string;
    errorNoStorage: string;
    errorRead: string;
    errorPermission: string;
    folderNotFound: string;
    pdfOpenError: string;
    noAppForFileTitle: string;
    noAppForFileMsg: string;
    openDialogTitle: string;
    shareDialogTitle: string;
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
    tapToChoose: string;
    changeFolderTitle: string;
    changeFolderMsg: string;
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
    resetConfirmTitle: string;
    resetConfirmMsg: string;
    resetConfirmAction: string;
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
    allCompleted: string;
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
    clearConfirmTitle: string;
    clearConfirmMsg: string;
    clearConfirmAction: string;
    errorNoFolder: string;
    errorBlockedType: string;
    statusPending: string;
    sizeUnknown: string;
    readerOpenError: string;
    folderOpenError: string;
    iosDocumentsInfo: string;
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
      confirm: "Confirmer",
      undo: "ANNULER",
      delete: "Supprimer",
      folder: "Dossier",
      read: "Lire",
      offline: "Hors connexion",
      fileNotFound: "Fichier introuvable.",
      noPdfApp: "Aucune application capable d'ouvrir un PDF n'est installée.",
      shareTitle: "Partager",
      shareUnavailable: "Le partage n'est pas disponible sur cet appareil.",
    },
    home: {
      tagline: "Retrouvez votre catalogue VK dans une interface pensée pour mobile.",
      connected: "Connecté",
      disconnected: "Non connecté",
      statsIndexed: "Séries au catalogue",
      statsVolumes: "Tomes",
      statsDownloaded: "Téléchargés",
      statsInProgress: "En cours",
      quickTitle: "Actions rapides",
      quickSubtitle: "Accès direct",
      openLibrary: "Ouvrir la bibliothèque",
      openDownloads: "Voir les téléchargements",
      latestTitle: "Dernières séries",
      latestSubtitle: "Aperçu rapide",
    },
    library: {
      title: "Bibliothèque",
      subtitle: "Retrouvez ici vos fichiers téléchargés.",
      folderTitle: "Fichiers téléchargés",
      folderSubtitle: "Sur cet appareil",
      recentTitle: "Ajouts récents",
      recentSubtitle: "Derniers fichiers enregistrés",
      refresh: "Actualiser",
      empty: "Aucun fichier pour le moment",
      emptySubtitle: "Vos fichiers PDF, CBZ et CBR téléchargés apparaîtront ici.",
      errorNoStorage: "L'espace de stockage de l'appareil est indisponible.",
      errorRead: "Impossible d'ouvrir le dossier de téléchargement.",
      errorPermission:
        "L'accès au dossier a expiré. Sélectionnez-le à nouveau dans les Paramètres.",
      folderNotFound: "Ce dossier est introuvable ou inaccessible.",
      pdfOpenError: "Impossible d'ouvrir ce fichier PDF.",
      noAppForFileTitle: "Aucune application compatible",
      noAppForFileMsg:
        "Aucune application installée ne permet d'ouvrir ce type de fichier.",
      openDialogTitle: "Ouvrir {name}",
      shareDialogTitle: "Partager {name}",
      deleteError: "Impossible de supprimer ce fichier.",
      sharePrepareError: "Impossible de préparer le fichier pour le partage.",
      shareError: "Impossible de partager ce fichier.",
      folderOpenHint:
        "Impossible d'ouvrir ce dossier directement. Vous pouvez y accéder depuis votre gestionnaire de fichiers.",
      note: "Chargement des fichiers…",
      deleteConfirmTitle: "Supprimer ce fichier ?",
      deleteConfirmMsg:
        "Voulez-vous vraiment supprimer {name} ? Cette action est définitive.",
      loading: "Chargement…",
      statsFiles: "Fichiers",
      statsTotal: "Taille totale",
    },
    reader: {
      back: "Retour",
      loading: "Ouverture du document…",
      unsupported:
        "Le lecteur intégré ouvre uniquement les fichiers PDF enregistrés sur l'appareil.",
      return: "Retour",
      openExternal: "Ouvrir dans une autre application",
      externalError: "Erreur",
      noAppAvailable: "Aucune application PDF installée",
      modePaged: "Page par page",
      modeManga: "Manga (droite à gauche)",
      modeContinuous: "Lecture continue",
      openError: "Impossible d'ouvrir ce PDF",
      pageError: "Impossible de charger cette page",
      retry: "Réessayer",
      pageOf: "Page {page} sur {total}",
    },
    downloads: {
      title: "Téléchargements",
      subtitle: "Suivi en direct",
      historyTitle: "Historique",
      historySubtitle: "Derniers téléchargements",
      statusCompleted: "Terminé",
      allCompleted: "Tous les téléchargements sont terminés",
      statusPaused: "En pause",
      statusDownloading: "Téléchargement…",
      statusInProgress: "En cours",
      statusCanceled: "Annulé",
      statusError: "Échec",
      errorVkUnavailable:
        "Ce fichier est temporairement indisponible sur VK. Réessayez plus tard.",
      errorVkDeleted:
        "Ce fichier n'est plus disponible ou a été supprimé sur VK.",
      labelVkUnavailable: "Indisponible sur VK",
      labelVkDeleted: "Supprimé sur VK",
      emptyTitle: "Aucun téléchargement",
      emptySubtitle: "Lancez un téléchargement depuis l'onglet Accueil.",
      actionPause: "Pause",
      actionCancel: "Annuler",
      actionResume: "Reprendre",
      actionRetry: "Réessayer",
      clearList: "Vider la liste",
      clearConfirmTitle: "Vider l'historique ?",
      clearConfirmMsg:
        "Voulez-vous retirer tous les téléchargements de cette liste ?",
      clearConfirmAction: "Vider",
      errorNoFolder:
        "Choisissez d'abord un dossier de téléchargement dans les Paramètres.",
      errorBlockedType:
        "Ce type de fichier est bloqué pour des raisons de sécurité.",
      statusPending: "En attente",
      sizeUnknown: "Taille inconnue",
      readerOpenError: "Impossible d'ouvrir ce fichier dans le lecteur.",
      folderOpenError: "Impossible d'ouvrir le dossier contenant ce fichier.",
      iosDocumentsInfo:
        "Vos fichiers sont enregistrés dans le dossier Documents de l'application.",
      removedFromList: "Retiré de la liste",
      swipeRemove: "Retirer",
      downloadAll: "Tout télécharger",
      cancelAll: "Tout annuler",
      a11yPause: "Mettre en pause",
      a11yResume: "Reprendre le téléchargement",
      a11yCancel: "Annuler le téléchargement",
    },
    settings: {
      connectionTitle: "Compte VK",
      connectionSubtitle: "Connexion via VK ID",
      signIn: "Se connecter avec VK",
      signingIn: "Connexion en cours…",
      connected: "Connecté à VK",
      logout: "Se déconnecter",
      signInFailed: "Impossible de se connecter à VK",
      signInIncomplete:
        "La connexion n'a pas pu être finalisée. Veuillez réessayer.",
      signInUnknownError: "Une erreur inattendue s'est produite.",
      folderPickError: "Impossible de sélectionner ce dossier.",
      tapToChoose: "Appuyez pour choisir un dossier…",
      changeFolderTitle: "Changer de dossier ?",
      changeFolderMsg:
        "Les prochains téléchargements seront enregistrés dans :\n\n{folder}",
      groupLabel: "ID du groupe",
      topicLabel: "ID du sujet",
      prefsTitle: "Préférences",
      prefsSubtitle: "Personnalisation",
      downloadFolderLabel: "Dossier de téléchargement",
      languageLabel: "Langue",
      resetGroupDefaults: "Rétablir les valeurs par défaut",
      autoSyncLabel: "Synchronisation automatique",
      autoSyncHint: "Synchroniser au lancement de l'application",
      themeLabel: "Thème",
      themeDark: "Sombre",
      themeOled: "Tokyo Night",
      maintenanceTitle: "Données locales",
      maintenanceSubtitle: "Cache et stockage",
      resetLibrary: "Réinitialiser la bibliothèque",
      clearCache: "Vider le cache",
      resetDatabase: "Réinitialiser l'application",
      resetDatabaseDescription:
        "Efface le catalogue en cache et les téléchargements locaux",
      resetConfirmTitle: "Tout réinitialiser ?",
      resetConfirmMsg:
        "Le catalogue en cache et les fichiers téléchargés dans l'application seront supprimés. Vous devrez relancer une synchronisation.",
      resetConfirmAction: "Réinitialiser",
      save: "Enregistrer",
      saved: "Modifications enregistrées",
      headerSubtitle: "Compte VK et préférences",
    },
    browser: {
      searchPlaceholder: "Rechercher une série, un tome…",
      sync: "Synchroniser",
      syncing: "Synchronisation…",
      syncAll: "Tout synchroniser",
      back: "Retour",
      home: "Accueil",
      download: "Télécharger",
      open: "Ouvrir",
      noTokenTitle: "Connectez-vous à VK",
      noTokenSubtitle:
        "Connectez votre compte VK pour parcourir le catalogue. Si l'application VK vous invite ensuite à retourner au navigateur, revenez simplement dans Vkomic.",
      emptyTitle: "Catalogue non synchronisé",
      emptySubtitle:
        "Lancez une synchronisation pour charger les dossiers et les BD.",
      searchEmptyTitle: "Aucun résultat",
      searchEmptySubtitle: "Aucun contenu ne correspond à votre recherche.",
      searchIndexHint:
        "Recherche limitée aux dossiers déjà ouverts. Appuyez sur le bouton de synchronisation en haut à droite pour charger tout le catalogue.",
      loading: "Chargement…",
      errorNoToken: "Connectez-vous à votre compte VK pour synchroniser.",
      errorSync: "La synchronisation avec VK a échoué. Réessayez dans un instant.",
      errorLoad: "Impossible de charger ce dossier.",
      errorNoUrl: "Aucun lien de téléchargement disponible pour ce fichier.",
      errorSessionExpired:
        "Votre session VK a expiré. Reconnectez-vous dans les Paramètres.",
      errorRateLimited:
        "Trop de requêtes envoyées à VK. Patientez quelques minutes avant de réessayer.",
      errorAccessDenied: "Votre compte VK n'a pas accès à ce contenu.",
      errorAccountBlocked: "Ce compte VK est bloqué ou désactivé.",
      errorAppNotApproved:
        "Cette fonctionnalité n'est pas encore disponible pour Vkomic sur VK.",
      results: "résultats",
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
      info: "Info",
      cancel: "Cancel",
      confirm: "Confirm",
      undo: "UNDO",
      delete: "Delete",
      folder: "Folder",
      read: "Read",
      offline: "Offline",
      fileNotFound: "File not found.",
      noPdfApp: "No app capable of opening PDFs is installed.",
      shareTitle: "Share",
      shareUnavailable: "Sharing isn't available on this device.",
    },
    home: {
      tagline: "Browse your VK catalog in a mobile-friendly interface.",
      connected: "Connected",
      disconnected: "Not signed in",
      statsIndexed: "Series in catalog",
      statsVolumes: "Volumes",
      statsDownloaded: "Downloaded",
      statsInProgress: "In progress",
      quickTitle: "Quick actions",
      quickSubtitle: "Shortcuts",
      openLibrary: "Open library",
      openDownloads: "View downloads",
      latestTitle: "Latest series",
      latestSubtitle: "Quick preview",
    },
    library: {
      title: "Library",
      subtitle: "Find your downloaded files here.",
      folderTitle: "Downloaded files",
      folderSubtitle: "On this device",
      recentTitle: "Recently added",
      recentSubtitle: "Latest saved files",
      refresh: "Refresh",
      empty: "No files yet",
      emptySubtitle: "Your downloaded PDF, CBZ, and CBR files will appear here.",
      errorNoStorage: "Device storage is unavailable.",
      errorRead: "Couldn't open the download folder.",
      errorPermission:
        "Folder access expired. Please select the folder again in Settings.",
      folderNotFound: "This folder could not be found or accessed.",
      pdfOpenError: "Couldn't open this PDF file.",
      noAppForFileTitle: "No compatible app",
      noAppForFileMsg: "No installed app can open this type of file.",
      openDialogTitle: "Open {name}",
      shareDialogTitle: "Share {name}",
      deleteError: "Couldn't delete this file.",
      sharePrepareError: "Couldn't prepare the file for sharing.",
      shareError: "Couldn't share this file.",
      folderOpenHint:
        "Couldn't open this folder directly. You can browse it from your file manager.",
      note: "Loading files…",
      deleteConfirmTitle: "Delete this file?",
      deleteConfirmMsg:
        "Are you sure you want to delete {name}? This cannot be undone.",
      loading: "Loading…",
      statsFiles: "Files",
      statsTotal: "Total size",
    },
    reader: {
      back: "Back",
      loading: "Opening document…",
      unsupported:
        "The built-in reader only opens PDF files saved on your device.",
      return: "Back",
      openExternal: "Open in another app",
      externalError: "Error",
      noAppAvailable: "No PDF app installed",
      modePaged: "Page by page",
      modeManga: "Manga (right to left)",
      modeContinuous: "Continuous scroll",
      openError: "Couldn't open this PDF",
      pageError: "Couldn't load this page",
      retry: "Try again",
      pageOf: "Page {page} of {total}",
    },
    downloads: {
      title: "Downloads",
      subtitle: "Live progress",
      historyTitle: "History",
      historySubtitle: "Recent downloads",
      statusCompleted: "Completed",
      allCompleted: "All downloads completed",
      statusPaused: "Paused",
      statusDownloading: "Downloading…",
      statusInProgress: "In progress",
      statusCanceled: "Canceled",
      statusError: "Failed",
      errorVkUnavailable:
        "This file is temporarily unavailable on VK. Try again later.",
      errorVkDeleted:
        "This file is no longer available or has been deleted on VK.",
      labelVkUnavailable: "Unavailable on VK",
      labelVkDeleted: "Deleted on VK",
      emptyTitle: "No downloads yet",
      emptySubtitle: "Start a download from the Home tab.",
      actionPause: "Pause",
      actionCancel: "Cancel",
      actionResume: "Resume",
      actionRetry: "Try again",
      clearList: "Clear list",
      clearConfirmTitle: "Clear history?",
      clearConfirmMsg: "Remove all downloads from this list?",
      clearConfirmAction: "Clear",
      errorNoFolder: "Please choose a download folder in Settings first.",
      errorBlockedType:
        "This file type is blocked for security reasons.",
      statusPending: "Queued",
      sizeUnknown: "Unknown size",
      readerOpenError: "Couldn't open this file in the reader.",
      folderOpenError: "Couldn't open the folder containing this file.",
      iosDocumentsInfo:
        "Your files are saved in the app's Documents folder.",
      removedFromList: "Removed from list",
      swipeRemove: "Remove",
      downloadAll: "Download all",
      cancelAll: "Cancel all",
      a11yPause: "Pause download",
      a11yResume: "Resume download",
      a11yCancel: "Cancel download",
    },
    settings: {
      connectionTitle: "VK Account",
      connectionSubtitle: "Sign in with VK ID",
      signIn: "Sign in with VK",
      signingIn: "Signing in…",
      connected: "Connected to VK",
      logout: "Sign out",
      signInFailed: "Couldn't sign in to VK",
      signInIncomplete: "Sign-in couldn't be completed. Please try again.",
      signInUnknownError: "An unexpected error occurred.",
      folderPickError: "Couldn't select this folder.",
      tapToChoose: "Tap to choose a folder…",
      changeFolderTitle: "Change download folder?",
      changeFolderMsg: "Future downloads will be saved to:\n\n{folder}",
      groupLabel: "Group ID",
      topicLabel: "Topic ID",
      prefsTitle: "Preferences",
      prefsSubtitle: "Customization",
      downloadFolderLabel: "Download folder",
      languageLabel: "Language",
      resetGroupDefaults: "Restore defaults",
      autoSyncLabel: "Auto-sync",
      autoSyncHint: "Sync catalog on startup",
      themeLabel: "Theme",
      themeDark: "Dark",
      themeOled: "Tokyo Night",
      maintenanceTitle: "Local Data",
      maintenanceSubtitle: "Cache & storage",
      resetLibrary: "Reset local library",
      clearCache: "Clear cache",
      resetDatabase: "Reset app data",
      resetDatabaseDescription:
        "Clears the cached catalog and local downloads",
      resetConfirmTitle: "Reset app data?",
      resetConfirmMsg:
        "The cached catalog and files downloaded inside the app will be deleted. You'll need to sync again.",
      resetConfirmAction: "Reset",
      save: "Save",
      saved: "Changes saved",
      headerSubtitle: "VK account and preferences",
    },
    browser: {
      searchPlaceholder: "Search series, volumes…",
      sync: "Sync",
      syncing: "Syncing…",
      syncAll: "Sync all",
      back: "Back",
      home: "Home",
      download: "Download",
      open: "Open",
      noTokenTitle: "Sign in to VK",
      noTokenSubtitle:
        "Sign in with your VK account to browse the catalog. If the VK app asks you to return to the browser, simply switch back to Vkomic.",
      emptyTitle: "Catalog not synced",
      emptySubtitle: "Sync with VK to load folders and comics.",
      searchEmptyTitle: "No results found",
      searchEmptySubtitle: "Nothing matches your search.",
      searchIndexHint:
        "Search only covers folders opened so far. Tap the sync button at the top right to load the full catalog.",
      loading: "Loading…",
      errorNoToken: "Sign in to your VK account to sync.",
      errorSync: "Couldn't sync with VK. Please try again in a moment.",
      errorLoad: "Couldn't load this folder.",
      errorNoUrl: "No download link is available for this file.",
      errorSessionExpired:
        "Your VK session expired. Please sign in again in Settings.",
      errorRateLimited:
        "Too many requests to VK. Please wait a few minutes and try again.",
      errorAccessDenied: "Your VK account doesn't have access to this content.",
      errorAccountBlocked: "This VK account is blocked or deactivated.",
      errorAppNotApproved:
        "This feature isn't available for Vkomic on VK yet.",
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
      confirm: "Подтвердить",
      undo: "ВЕРНУТЬ",
      delete: "Удалить",
      folder: "Папка",
      read: "Читать",
      offline: "Нет подключения",
      fileNotFound: "Файл не найден.",
      noPdfApp: "Не установлено приложение для открытия PDF.",
      shareTitle: "Поделиться",
      shareUnavailable: "Отправка файлов недоступна на этом устройстве.",
    },
    home: {
      tagline: "Ваш каталог VK в удобном мобильном интерфейсе.",
      connected: "Подключено",
      disconnected: "Не подключено",
      statsIndexed: "Серий в каталоге",
      statsVolumes: "Тома",
      statsDownloaded: "Скачано",
      statsInProgress: "В процессе",
      quickTitle: "Быстрые действия",
      quickSubtitle: "Быстрый доступ",
      openLibrary: "Открыть библиотеку",
      openDownloads: "Открыть загрузки",
      latestTitle: "Последние серии",
      latestSubtitle: "Быстрый просмотр",
    },
    library: {
      title: "Библиотека",
      subtitle: "Здесь хранятся скачанные вами файлы.",
      folderTitle: "Скачанные файлы",
      folderSubtitle: "На этом устройстве",
      recentTitle: "Недавно добавленные",
      recentSubtitle: "Последние сохранённые файлы",
      refresh: "Обновить",
      empty: "Файлов пока нет",
      emptySubtitle: "Скачанные файлы PDF, CBZ и CBR появятся здесь.",
      errorNoStorage: "Хранилище устройства недоступно.",
      errorRead: "Не удалось открыть папку загрузок.",
      errorPermission:
        "Доступ к папке утрачен. Выберите папку заново в настройках.",
      folderNotFound: "Папка не найдена или недоступна.",
      pdfOpenError: "Не удалось открыть PDF-файл.",
      noAppForFileTitle: "Нет подходящего приложения",
      noAppForFileMsg:
        "На устройстве нет приложения для открытия файлов этого типа.",
      openDialogTitle: "Открыть {name}",
      shareDialogTitle: "Поделиться {name}",
      deleteError: "Не удалось удалить файл.",
      sharePrepareError: "Не удалось подготовить файл к отправке.",
      shareError: "Не удалось поделиться файлом.",
      folderOpenHint:
        "Не удалось открыть папку напрямую. Откройте её через файловый менеджер.",
      note: "Загрузка файлов…",
      deleteConfirmTitle: "Удалить этот файл?",
      deleteConfirmMsg:
        "Вы уверены, что хотите удалить {name}? Это действие нельзя отменить.",
      loading: "Загрузка…",
      statsFiles: "Файлы",
      statsTotal: "Общий размер",
    },
    reader: {
      back: "Назад",
      loading: "Открытие документа…",
      unsupported:
        "Встроенная читалка открывает только PDF-файлы, сохранённые на устройстве.",
      return: "Назад",
      openExternal: "Открыть в другом приложении",
      externalError: "Ошибка",
      noAppAvailable: "Нет приложения для PDF",
      modePaged: "Постранично",
      modeManga: "Манга (справа налево)",
      modeContinuous: "Непрерывная прокрутка",
      openError: "Не удалось открыть PDF",
      pageError: "Не удалось загрузить страницу",
      retry: "Повторить",
      pageOf: "Страница {page} из {total}",
    },
    downloads: {
      title: "Загрузки",
      subtitle: "Статус в реальном времени",
      historyTitle: "История",
      historySubtitle: "Последние загрузки",
      statusCompleted: "Готово",
      allCompleted: "Все загрузки завершены",
      statusPaused: "На паузе",
      statusDownloading: "Скачивание…",
      statusInProgress: "В процессе",
      statusCanceled: "Отменено",
      statusError: "Ошибка",
      errorVkUnavailable:
        "Этот файл временно недоступен в VK. Попробуйте позже.",
      errorVkDeleted:
        "Этот файл больше недоступен или был удалён в VK.",
      labelVkUnavailable: "Недоступен в VK",
      labelVkDeleted: "Удалён в VK",
      emptyTitle: "Загрузок пока нет",
      emptySubtitle: "Запустите загрузку на вкладке «Главная».",
      actionPause: "Пауза",
      actionCancel: "Отмена",
      actionResume: "Продолжить",
      actionRetry: "Повторить",
      clearList: "Очистить список",
      clearConfirmTitle: "Очистить историю?",
      clearConfirmMsg: "Убрать все загрузки из этого списка?",
      clearConfirmAction: "Очистить",
      errorNoFolder: "Сначала выберите папку для загрузок в настройках.",
      errorBlockedType:
        "Этот тип файла заблокирован в целях безопасности.",
      statusPending: "В очереди",
      sizeUnknown: "Размер неизвестен",
      readerOpenError: "Не удалось открыть файл во встроенной читалке.",
      folderOpenError: "Не удалось открыть папку с файлом.",
      iosDocumentsInfo:
        "Файлы сохраняются в папке «Документы» приложения.",
      removedFromList: "Убрано из списка",
      swipeRemove: "Убрать",
      downloadAll: "Скачать всё",
      cancelAll: "Отменить всё",
      a11yPause: "Поставить на паузу",
      a11yResume: "Продолжить загрузку",
      a11yCancel: "Отменить загрузку",
    },
    settings: {
      connectionTitle: "Аккаунт VK",
      connectionSubtitle: "Вход через VK ID",
      signIn: "Войти через VK",
      signingIn: "Вход…",
      connected: "Подключено к VK",
      logout: "Выйти",
      signInFailed: "Не удалось войти в VK",
      signInIncomplete: "Не удалось завершить вход. Попробуйте ещё раз.",
      signInUnknownError: "Произошла непредвиденная ошибка.",
      folderPickError: "Не удалось выбрать папку.",
      tapToChoose: "Нажмите, чтобы выбрать папку…",
      changeFolderTitle: "Изменить папку?",
      changeFolderMsg: "Следующие загрузки будут сохраняться в:\n\n{folder}",
      groupLabel: "ID группы",
      topicLabel: "ID обсуждения",
      prefsTitle: "Предпочтения",
      prefsSubtitle: "Оформление и язык",
      downloadFolderLabel: "Папка загрузок",
      languageLabel: "Язык",
      resetGroupDefaults: "Восстановить по умолчанию",
      autoSyncLabel: "Автосинхронизация",
      autoSyncHint: "Синхронизировать при запуске",
      themeLabel: "Тема",
      themeDark: "Тёмная",
      themeOled: "Tokyo Night",
      maintenanceTitle: "Данные приложения",
      maintenanceSubtitle: "Кэш и хранилище",
      resetLibrary: "Сбросить библиотеку",
      clearCache: "Очистить кэш",
      resetDatabase: "Сбросить данные приложения",
      resetDatabaseDescription:
        "Удаляет кэш каталога и локальные загрузки",
      resetConfirmTitle: "Сбросить все данные?",
      resetConfirmMsg:
        "Кэш каталога и скачанные в приложение файлы будут удалены. Потребуется новая синхронизация.",
      resetConfirmAction: "Сбросить",
      save: "Сохранить",
      saved: "Изменения сохранены",
      headerSubtitle: "Аккаунт VK и предпочтения",
    },
    browser: {
      searchPlaceholder: "Поиск серий, томов…",
      sync: "Синхронизировать",
      syncing: "Синхронизация…",
      syncAll: "Синхронизировать всё",
      back: "Назад",
      home: "Главная",
      download: "Скачать",
      open: "Открыть",
      noTokenTitle: "Войдите в VK",
      noTokenSubtitle:
        "Войдите в аккаунт VK, чтобы просматривать каталог. Если приложение VK попросит вернуться в браузер, просто вернитесь в Vkomic.",
      emptyTitle: "Каталог не синхронизирован",
      emptySubtitle:
        "Запустите синхронизацию, чтобы загрузить папки и комиксы.",
      searchEmptyTitle: "Ничего не найдено",
      searchEmptySubtitle: "По вашему запросу ничего не найдено.",
      searchIndexHint:
        "Поиск выполняется только по уже открытым папкам. Нажмите кнопку синхронизации справа вверху, чтобы загрузить весь каталог.",
      loading: "Загрузка…",
      errorNoToken: "Войдите в аккаунт VK, чтобы синхронизировать каталог.",
      errorSync: "Не удалось синхронизировать с VK. Попробуйте чуть позже.",
      errorLoad: "Не удалось открыть эту папку.",
      errorNoUrl: "Для этого файла нет ссылки на скачивание.",
      errorSessionExpired:
        "Сессия VK истекла. Войдите заново в настройках.",
      errorRateLimited:
        "Слишком много запросов к VK. Подождите несколько минут и попробуйте снова.",
      errorAccessDenied: "У вашего аккаунта VK нет доступа к этому содержимому.",
      errorAccountBlocked: "Этот аккаунт VK заблокирован или деактивирован.",
      errorAppNotApproved:
        "Эта функция пока недоступна для Vkomic на стороне VK.",
      results: "результатов",
    },
  },
};

const ruPlural = (n: number, one: string, few: string, many: string): string => {
  const abs = Math.abs(n);
  const mod100 = abs % 100;
  const mod10 = abs % 10;
  if (mod100 >= 11 && mod100 <= 14) return many;
  if (mod10 === 1) return one;
  if (mod10 >= 2 && mod10 <= 4) return few;
  return many;
};

export const formatFilesCount = (count: number, language: Language): string => {
  if (language === "en") return `${count} ${count === 1 ? "file" : "files"}`;
  if (language === "ru") return `${count} ${ruPlural(count, "файл", "файла", "файлов")}`;
  return `${count} ${count > 1 ? "fichiers" : "fichier"}`;
};

export const formatResultsCount = (count: number, language: Language): string => {
  if (language === "en") return `${count} ${count === 1 ? "result" : "results"}`;
  if (language === "ru") return `${count} ${ruPlural(count, "результат", "результата", "результатов")}`;
  return `${count} ${count > 1 ? "résultats" : "résultat"}`;
};

export const formatDownloadsCount = (count: number, language: Language): string => {
  if (language === "en") return `${count} ${count === 1 ? "download" : "downloads"}`;
  if (language === "ru") return `${count} ${ruPlural(count, "загрузка", "загрузки", "загрузок")}`;
  return `${count} ${count > 1 ? "téléchargements" : "téléchargement"}`;
};

export const getT = (language: Language): Translations =>
  translations[language] ?? translations.fr;
