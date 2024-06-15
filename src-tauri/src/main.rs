#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use dotenv::dotenv;
use serde::Serialize;
use serde_json::json;
use sqlx::{sqlite::SqlitePoolOptions, SqliteConnection, SqlitePool};
use tokio;

struct AppState {
    pool: SqlitePool,
}

#[derive(Serialize)]
struct Todo {
    id: i64,
    name: String,
    done: bool,
}

struct DBTodo {
    id: i64,
    name: String,
    done: i64,
}

impl From<DBTodo> for Todo {
    fn from(db_todo: DBTodo) -> Self {
        Todo {
            id: db_todo.id,
            name: db_todo.name,
            done: db_todo.done != 0,
        }
    }
}

#[tauri::command]
async fn get_todos(state: tauri::State<'_, AppState>) -> Result<String, ()> {
    let todos: Vec<Todo> = sqlx::query_as!(DBTodo, "SELECT * FROM todos ORDER BY id")
        .fetch_all(&state.pool)
        .await
        .unwrap()
        .into_iter()
        .map(|todo| todo.into())
        .collect();

    let json = serde_json::to_string(&todos).unwrap();

    Ok(json)
}

#[tauri::command]
async fn add_todo(state: tauri::State<'_, AppState>, name: &str) -> Result<String, ()> {
    let mut conn = state.pool.acquire().await.unwrap();

    let result = sqlx::query!("INSERT INTO todos (name) VALUES (?) ", name)
        .execute(&mut *conn)
        .await
        .unwrap();

    Ok(format!("{}", result.last_insert_rowid()))
}

#[tauri::command]
async fn toggle_todo(state: tauri::State<'_, AppState>, id: i64) -> Result<String, ()> {
    let todo: Todo = sqlx::query_as!(DBTodo, "SELECT * FROM todos WHERE id = ?", id)
        .fetch_one(&state.pool)
        .await
        .unwrap()
        .into();

    let mut conn = state.pool.acquire().await.unwrap();

    let done_val = if todo.done { 0 } else { 1 };
    sqlx::query!("UPDATE todos SET done = ? WHERE id = ?  ", done_val, id)
        .execute(&mut *conn)
        .await
        .unwrap();

    Ok(String::from("Toggled todo"))
}

#[tauri::command]
async fn delete_todo(state: tauri::State<'_, AppState>, id: i64) -> Result<String, ()> {
    let mut conn = state.pool.acquire().await.unwrap();

    sqlx::query!("DELETE FROM todos WHERE id = ?", id)
        .execute(&mut *conn)
        .await
        .unwrap();

    Ok(String::from("Deleted todo"))
}

async fn setup_db_pool() -> SqlitePool {
    dotenv().unwrap();
    SqlitePoolOptions::new()
        .connect(&std::env::var("DATABASE_URL").unwrap())
        .await
        .unwrap()
}

#[tokio::main]
async fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            add_todo,
            get_todos,
            toggle_todo,
            delete_todo
        ])
        .manage(AppState {
            pool: setup_db_pool().await,
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
