import { Translations } from "./fr";

export const en: Translations = {
  // Common actions
  common: {
    loading: "Loading…",
    cancel: "Cancel",
    confirm: "Confirm",
    later: "Later",
  },

  // Navigation
  nav: {
    home: "Home",
    downloads: "Downloads",
    library: "Library",
    settings: "Settings",
  },

  // TopBar
  topbar: {
    searchPlaceholder: "Search…",
  },

  // Sidebar status
  sidebar: {
    connected: "Connected",
    disconnected: "Not signed in",
    lastSync: "Last synced",
    connectedToVK: "Connected to VK",
    signedIn: "Signed in to VK",
    syncFailed: "Sync failed",
    updateAvailable: "Update available",
    checkingUpdates: "Updating catalog…",
    syncDone: "Catalog up to date",
  },

  // Settings
  settings: {
    title: "Settings",
    subtitle: "Manage your VK account and app preferences",

    // VK Connection
    vkConnection: "VK Account",
    vkIdConnected: "Signed in to VK",
    vkIdDisconnected: "Not signed in",
    connectVk: "Sign in with VK ID",
    reconnectVk: "Reconnect",
    disconnectVk: "Sign out",
    vkIdPending:
      "The sign-in page opened in your browser. Vkomic will return to the foreground automatically.",
    vkIdFinishing: "Signing in…",
    vkIdHelp: "Opens the official VK ID sign-in page in your browser.",
    vkIdPrivacy:
      "Vkomic only reads the public catalog — nothing is posted or changed on your account.",
    vkAuthError: "Couldn't sign in",
    groupId: "Group ID",
    topicId: "Topic ID",
    resetGroupDefaults: "Restore defaults",

    // General Preferences
    generalPreferences: "General Preferences",
    language: "App language",
    downloadFolder: "Download folder",
    browse: "Browse",
    folderDialogWarning:
      "Couldn't open the folder picker. You can type the path manually.",

    // Save button
    saveAll: "Save",
    saved: "Changes saved",

    // Data Management
    dataManagement: "Local Data",
    resetDatabase: "Reset catalog",
    resetDatabaseDescription:
      "Clears the cached catalog on this device. Useful if folders appear empty or out of sync.",
    resetButton: "Reset",
    resetWarning:
      "This will clear the cached catalog (your downloaded files won't be deleted). You'll need to sync again to browse comics.",
  },

  // Library
  library: {
    empty: "Catalog not synced",
    emptyDescription:
      "Sign in to VK in Settings, then sync to browse comics.",
    syncButton: "Sync catalog",
    syncAllButton: "Sync all",
    syncAllWarning:
      "Preloads all folders at once. Avoid running this too often so you don't hit VK rate limits.",
    syncing: "Syncing…",
    searching: "Search results",
    noResults: "This folder is empty.",
    noSearchResults: "No results found",
    noSearchResultsDescription:
      "This folder might not be synced yet. Would you like to search directly on VK?",
    searchOnVk: "Search on VK",
    localTitle: "Local Library",
    noDownloadPath:
      "Choose a download folder in Settings to find your files here.",
    desktopOnly:
      "The local library is only available in the desktop app.",
    readError:
      "Couldn't open this folder. Make sure the path still exists.",
    loading: "Loading your library…",
    back: "Back",
    refresh: "Refresh",
    rootLabel: "Downloads",
    folderLabel: "Folder",
    fileLabel: "File",
    filesLabel: "Files",
    activeInQueue: "active",
    nodeTypes: {
      category: "Category",
      genre: "Genre",
      series: "Series",
      topic: "Topic",
    },
    size: "Size",
    modified: "Modified",
    openFolder: "Open",
    openFolderOnVk: "View on VK",
    openFile: "Open file",
    downloadFile: "Download",
    downloadAll: "Download all",
    cancelAll: "Cancel all",
    emptyFolder: "This folder is empty.",
    configureFolder: "Choose folder",
  },

  // Downloads
  downloads: {
    title: "Downloads",
    overviewTitle: "Overview",
    statsIndexed: "SERIES IN CATALOG",
    statsDownloaded: "DOWNLOADED VOLUMES",
    statsInProgress: "IN PROGRESS",
    tableSeries: "Series",
    tableVolume: "Volume",
    tableStatus: "Status",
    tableDate: "Date",
    tableSize: "Size",
    tableActions: "Actions",
    completed: "Downloaded",
    canceled: "Canceled",
    redownload: "Download again",
    noDownloads: "No downloads yet",
    noDownloadsDescription:
      "Your active and completed downloads will appear here.",
    statusDownloading: "Downloading…",
    statusPending: "Queued",
    statusPaused: "Paused",
    statusError: "Failed",
    errorVkUnavailable:
      "This file is temporarily unavailable on VK. Try again later.",
    errorVkDeleted:
      "This file is no longer available or has been deleted on VK.",
    errorInterrupted: "Download interrupted.",
    errorNoFolder: "No download folder selected.",
    errorReset: "Couldn't restart the download.",
    noFolderAlert: "Please choose a download folder in Settings first.",
    retry: "Try again",
  },

  // VK errors
  errors: {
    vkNotConnected:
      "Sign in to your VK account in Settings to sync the catalog.",
    vkSessionExpired:
      "Your VK session expired. Please sign in again in Settings.",
    vkRateLimited:
      "Too many requests to VK. Please wait a few minutes and try again.",
    vkAccessDenied: "Your VK account doesn't have access to this content.",
    vkAccountBlocked: "This VK account is blocked or deactivated.",
    vkAppNotApproved:
      "This feature isn't available for Vkomic on VK yet.",
    vkUnavailable:
      "Couldn't reach VK. Check your internet connection and try again.",
  },

  // Tooltips
  tooltips: {
    home: "Home",
    sync: "Sync",
    resetDatabase: "Reset catalog",
    clean: "Clear list",
    resume: "Resume",
    pause: "Pause",
    cancel: "Cancel",
    resetDownload: "Restart",
    openFolder: "Show in folder",
  },

  // Update Modal
  update: {
    titleLine1: "Update",
    titleLine2: "available",
    whatsNew: "What's new",
    defaultNotes: "Stability improvements and bug fixes.",
    downloadingProgress: "Downloading…",
    restartNow: "Restart now",
    downloadingButton: "Downloading…",
    downloadUpdate: "Download update",
  },

  // Languages
  languages: {
    fr: "Français",
    en: "English",
  },
};
