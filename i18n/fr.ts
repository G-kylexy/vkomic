export const fr = {
  // Common actions
  common: {
    loading: "Chargement…",
    cancel: "Annuler",
    confirm: "Confirmer",
    later: "Plus tard",
  },

  // Navigation
  nav: {
    home: "Accueil",
    downloads: "Téléchargements",
    library: "Bibliothèque",
    settings: "Paramètres",
  },

  // TopBar
  topbar: {
    searchPlaceholder: "Rechercher…",
  },

  // Sidebar status
  sidebar: {
    connected: "Connecté",
    disconnected: "Non connecté",
    lastSync: "Dernière synchronisation",
    connectedToVK: "Connecté à VK",
    signedIn: "Compte VK connecté",
    syncFailed: "Échec de la synchronisation",
    updateAvailable: "Mise à jour disponible",
    checkingUpdates: "Mise à jour du catalogue…",
    syncDone: "Catalogue à jour",
  },

  // Settings
  settings: {
    title: "Paramètres",
    subtitle: "Gérez votre compte VK et vos préférences",

    // VK Connection
    vkConnection: "Connexion VK",
    vkIdConnected: "Connecté à VK",
    vkIdDisconnected: "Non connecté",
    connectVk: "Se connecter avec VK ID",
    reconnectVk: "Se reconnecter",
    disconnectVk: "Se déconnecter",
    vkIdPending:
      "La page de connexion s'est ouverte dans votre navigateur. Vkomic reviendra automatiquement au premier plan.",
    vkIdFinishing: "Connexion en cours…",
    vkIdHelp:
      "La connexion s'ouvre dans votre navigateur via la page officielle VK ID.",
    vkIdPrivacy:
      "Vkomic consulte uniquement le catalogue public : rien n'est publié ni modifié sur votre compte.",
    vkAuthError: "Impossible de se connecter",
    groupId: "ID du groupe",
    topicId: "ID du sujet",
    resetGroupDefaults: "Valeurs par défaut",

    // General Preferences
    generalPreferences: "Préférences générales",
    language: "Langue de l'application",
    downloadFolder: "Dossier de téléchargement",
    browse: "Parcourir",
    folderDialogWarning:
      "Impossible d'ouvrir le sélecteur de dossier. Vous pouvez saisir le chemin manuellement.",

    // Save button
    saveAll: "Enregistrer",
    saved: "Modifications enregistrées",

    // Data Management
    dataManagement: "Données locales",
    resetDatabase: "Réinitialiser le catalogue",
    resetDatabaseDescription:
      "Efface le catalogue enregistré sur cet appareil. Utile si certains dossiers semblent vides ou ne sont plus à jour.",
    resetButton: "Réinitialiser",
    resetWarning:
      "Le catalogue en cache sera effacé (vos fichiers téléchargés seront conservés). Vous devrez relancer une synchronisation.",
  },

  // Library
  library: {
    empty: "Catalogue non synchronisé",
    emptyDescription:
      "Connectez-vous à VK dans les Paramètres, puis lancez une synchronisation pour parcourir les BD.",
    syncButton: "Synchroniser le catalogue",
    syncAllButton: "Tout synchroniser",
    syncAllWarning:
      "Précharge tous les dossiers d'un coup. Évitez de lancer cette action trop souvent pour ne pas dépasser les limites de VK.",
    syncing: "Synchronisation…",
    searching: "Résultats de recherche",
    noResults: "Ce dossier est vide.",
    noSearchResults: "Aucun résultat",
    noSearchResultsDescription:
      "Ce dossier n'a peut-être pas encore été synchronisé. Voulez-vous chercher directement sur VK ?",
    searchOnVk: "Rechercher sur VK",
    localTitle: "Bibliothèque locale",
    noDownloadPath:
      "Choisissez un dossier de téléchargement dans les Paramètres pour retrouver vos fichiers ici.",
    desktopOnly:
      "La bibliothèque locale est disponible uniquement sur l'application de bureau.",
    readError:
      "Impossible d'ouvrir ce dossier. Vérifiez que son emplacement existe toujours.",
    loading: "Chargement de la bibliothèque…",
    back: "Retour",
    refresh: "Actualiser",
    rootLabel: "Téléchargements",
    folderLabel: "Dossier",
    fileLabel: "Fichier",
    filesLabel: "Fichiers",
    activeInQueue: "en cours",
    nodeTypes: {
      category: "Catégorie",
      genre: "Genre",
      series: "Série",
      topic: "Sujet",
    },
    size: "Taille",
    modified: "Modifié le",
    openFolder: "Ouvrir",
    openFolderOnVk: "Voir sur VK",
    openFile: "Ouvrir le fichier",
    downloadFile: "Télécharger",
    downloadAll: "Tout télécharger",
    cancelAll: "Tout annuler",
    emptyFolder: "Ce dossier est vide.",
    configureFolder: "Choisir un dossier",
  },

  // Downloads
  downloads: {
    title: "Téléchargements",
    overviewTitle: "Vue d'ensemble",
    statsIndexed: "SÉRIES AU CATALOGUE",
    statsDownloaded: "TOMES TÉLÉCHARGÉS",
    statsInProgress: "EN COURS",
    tableSeries: "Série",
    tableVolume: "Tome",
    tableStatus: "État",
    tableDate: "Date",
    tableSize: "Taille",
    tableActions: "Actions",
    completed: "Téléchargé",
    canceled: "Annulé",
    redownload: "Retélécharger",
    noDownloads: "Aucun téléchargement",
    noDownloadsDescription:
      "Vos téléchargements en cours et terminés s'afficheront ici.",
    statusDownloading: "Téléchargement…",
    statusPending: "En attente",
    statusPaused: "En pause",
    statusError: "Échec",
    errorVkUnavailable:
      "Ce fichier est temporairement indisponible sur VK. Réessayez plus tard.",
    errorVkDeleted:
      "Ce fichier n'est plus disponible ou a été supprimé sur VK.",
    errorInterrupted: "Téléchargement interrompu.",
    errorNoFolder: "Aucun dossier de téléchargement sélectionné.",
    errorReset: "Impossible de recommencer le téléchargement.",
    noFolderAlert:
      "Veuillez d'abord choisir un dossier de téléchargement dans les Paramètres.",
    retry: "Réessayer",
  },

  // VK errors
  errors: {
    vkNotConnected:
      "Connectez-vous à votre compte VK dans les Paramètres pour synchroniser le catalogue.",
    vkSessionExpired:
      "Votre session VK a expiré. Reconnectez-vous dans les Paramètres.",
    vkRateLimited:
      "Trop de requêtes envoyées à VK. Patientez quelques minutes avant de réessayer.",
    vkAccessDenied: "Votre compte VK n'a pas accès à ce contenu.",
    vkAccountBlocked: "Ce compte VK est bloqué ou désactivé.",
    vkAppNotApproved:
      "Cette fonctionnalité n'est pas encore disponible pour Vkomic sur VK.",
    vkUnavailable:
      "Impossible de joindre VK. Vérifiez votre connexion Internet et réessayez.",
  },

  // Tooltips
  tooltips: {
    home: "Accueil",
    sync: "Synchroniser",
    resetDatabase: "Réinitialiser le catalogue",
    clean: "Vider la liste",
    resume: "Reprendre",
    pause: "Pause",
    cancel: "Annuler",
    resetDownload: "Recommencer",
    openFolder: "Ouvrir le dossier",
  },

  // Update Modal
  update: {
    titleLine1: "Mise à jour",
    titleLine2: "disponible",
    whatsNew: "Nouveautés",
    defaultNotes: "Améliorations de stabilité et corrections de bugs.",
    downloadingProgress: "Téléchargement…",
    restartNow: "Redémarrer maintenant",
    downloadingButton: "Téléchargement en cours…",
    downloadUpdate: "Télécharger la mise à jour",
  },

  // Languages
  languages: {
    fr: "Français",
    en: "English",
  },
};

export type Translations = typeof fr;
