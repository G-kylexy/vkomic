use serde::{Deserialize, Serialize};
use std::path::{Path, PathBuf};
use tauri::{AppHandle, Manager};

#[derive(Debug, Serialize, Deserialize, Default, Clone)]
pub struct AppSettings {
    #[serde(default)]
    pub vk_token: String,
    #[serde(default)]
    pub vk_refresh_token: String,
    #[serde(default)]
    pub vk_device_id: String,
    #[serde(default)]
    pub vk_token_expires_at: u64,
    #[serde(default)]
    pub vk_group_id: String,
    #[serde(default)]
    pub vk_topic_id: String,
    #[serde(default)]
    pub vk_download_path: String,
}

fn settings_path(app: &AppHandle) -> Option<PathBuf> {
    // Uses the Tauri app data dir: e.g. %APPDATA%\com.vkomic.app\
    app.path().app_data_dir().ok().map(|d| d.join("settings.json"))
}

pub fn load_settings(app: &AppHandle) -> AppSettings {
    let mut settings: AppSettings = settings_path(app)
        .and_then(|path| std::fs::read_to_string(path).ok())
        .and_then(|content| serde_json::from_str(&content).ok())
        .unwrap_or_default();

    // Tokens left in the file (older versions, or no credential store) win;
    // the next save moves them into the store.
    if settings.vk_token.is_empty() && settings.vk_refresh_token.is_empty() {
        if let Some((token, refresh_token)) = secrets::load() {
            settings.vk_token = token;
            settings.vk_refresh_token = refresh_token;
        }
    }
    settings
}

pub fn save_settings(app: &AppHandle, settings: &AppSettings) -> anyhow::Result<()> {
    let path = settings_path(app).ok_or_else(|| anyhow::anyhow!("Cannot resolve app data dir"))?;

    if let Some(parent) = path.parent() {
        std::fs::create_dir_all(parent)?;
    }

    let mut on_disk = settings.clone();
    if secrets::store(&settings.vk_token, &settings.vk_refresh_token) {
        on_disk.vk_token.clear();
        on_disk.vk_refresh_token.clear();
    }

    let json = serde_json::to_string_pretty(&on_disk)?;
    write_private(&path, &json)?;
    Ok(())
}

#[cfg(unix)]
fn write_private(path: &Path, contents: &str) -> std::io::Result<()> {
    use std::io::Write;
    use std::os::unix::fs::{OpenOptionsExt, PermissionsExt};

    let mut file = std::fs::OpenOptions::new()
        .write(true)
        .create(true)
        .truncate(true)
        .mode(0o600)
        .open(path)?;
    // `mode` only applies on creation; also tighten files written by older versions.
    file.set_permissions(std::fs::Permissions::from_mode(0o600))?;
    file.write_all(contents.as_bytes())
}

#[cfg(not(unix))]
fn write_private(path: &Path, contents: &str) -> std::io::Result<()> {
    std::fs::write(path, contents)
}

/// VK tokens live in the Windows Credential Manager (DPAPI-encrypted, not part
/// of the roaming settings file). macOS keeps the file: with ad-hoc signing the
/// Keychain would prompt again after every update.
#[cfg(windows)]
mod secrets {
    const SERVICE: &str = "com.vkomic.app";
    const ACCESS_TOKEN: &str = "vk_access_token";
    const REFRESH_TOKEN: &str = "vk_refresh_token";

    fn entry(name: &str) -> Option<keyring::Entry> {
        keyring::Entry::new(SERVICE, name).ok()
    }

    pub fn load() -> Option<(String, String)> {
        let token = entry(ACCESS_TOKEN)?.get_password().ok()?;
        let refresh_token = entry(REFRESH_TOKEN)?.get_password().ok()?;
        Some((token, refresh_token))
    }

    /// Returns true when the tokens no longer need to be written to the settings file.
    pub fn store(token: &str, refresh_token: &str) -> bool {
        let (Some(token_entry), Some(refresh_entry)) = (entry(ACCESS_TOKEN), entry(REFRESH_TOKEN))
        else {
            return false;
        };

        if token.is_empty() && refresh_token.is_empty() {
            let _ = token_entry.delete_credential();
            let _ = refresh_entry.delete_credential();
            return true;
        }
        token_entry.set_password(token).is_ok() && refresh_entry.set_password(refresh_token).is_ok()
    }
}

#[cfg(not(windows))]
mod secrets {
    pub fn load() -> Option<(String, String)> {
        None
    }

    pub fn store(_token: &str, _refresh_token: &str) -> bool {
        false
    }
}
