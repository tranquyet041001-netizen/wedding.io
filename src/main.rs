mod data;
mod models;
mod routes;
mod state;

use std::net::SocketAddr;
use std::sync::Arc;
use tokio::sync::RwLock;
use axum::{routing::get, Router};
use tower_http::services::ServeDir;

use crate::state::{AppDataStore, SharedState};

#[tokio::main]
async fn main() {
    let state: SharedState = Arc::new(RwLock::new(AppDataStore::new()));

    let app = Router::new()
        .route("/", get(routes::home_page))
        .route("/admin", get(routes::admin_page))
        .route("/api/rsvp", get(routes::get_rsvps).post(routes::create_rsvp))
        .route(
            "/api/wishes",
            get(routes::get_wishes)
                .post(routes::create_wish)
                .patch(routes::approve_wish),
        )
        .fallback_service(ServeDir::new("public"))
        .with_state(state);

    let port: u16 = std::env::var("PORT")
        .ok()
        .and_then(|p| p.parse().ok())
        .unwrap_or(3000);
    let addr = SocketAddr::from(([0, 0, 0, 0], port));

    println!("Wedding Invitation Rust server listening on http://localhost:{port}");

    let listener = tokio::net::TcpListener::bind(addr)
        .await
        .expect("Failed to bind TCP listener");
    axum::serve(listener, app).await.expect("Server error");
}
