use std::sync::Mutex;

use tauri::Manager;
use tauri_plugin_shell::process::CommandChild;
use tauri_plugin_shell::ShellExt;

#[derive(Default)]
struct ScreenpipeState {
    child: Mutex<Option<CommandChild>>,
}

#[tauri::command]
fn is_screenpipe_running(state: tauri::State<'_, ScreenpipeState>) -> bool {
    state.child.lock().is_ok_and(|child| child.is_some())
}

#[tauri::command]
fn start_screenpipe(
    app: tauri::AppHandle,
    state: tauri::State<'_, ScreenpipeState>,
) -> Result<(), String> {
    let mut child = state.child.lock().map_err(|error| error.to_string())?;

    if child.is_some() {
        return Ok(());
    }

    let command = app
        .shell()
        .sidecar("screenpipe")
        .map_err(|error| error.to_string())?
        .args(["record"]);

    let (_events, screenpipe_child) = command.spawn().map_err(|error| error.to_string())?;
    *child = Some(screenpipe_child);

    Ok(())
}

#[tauri::command]
fn stop_screenpipe(state: tauri::State<'_, ScreenpipeState>) -> Result<(), String> {
    let Some(child) = state
        .child
        .lock()
        .map_err(|error| error.to_string())?
        .take()
    else {
        return Ok(());
    };

    child.kill().map_err(|error| error.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let builder = tauri::Builder::default().manage(ScreenpipeState::default());

    #[cfg(desktop)]
    let builder = builder.plugin(tauri_plugin_single_instance::init(|_app, argv, _cwd| {
            println!("a new app instance was opened with {argv:?} and the deep link event was already triggered");
        }));

    builder
        .plugin(tauri_plugin_deep_link::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            is_screenpipe_running,
            start_screenpipe,
            stop_screenpipe
        ])
        .on_window_event(|window, event| {
            if matches!(event, tauri::WindowEvent::CloseRequested { .. }) {
                let state = window.state::<ScreenpipeState>();
                if let Ok(mut child) = state.child.lock() {
                    if let Some(child) = child.take() {
                        let _ = child.kill();
                    }
                };
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
