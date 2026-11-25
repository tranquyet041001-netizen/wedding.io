use askama::Template;
use axum::{
    extract::{Query, State},
    http::StatusCode,
    response::{Html, IntoResponse, Response},
    Json,
};
use chrono::{Datelike, Utc};
use serde::Deserialize;
use serde_json::json;

use crate::data::get_wedding_data;
use crate::models::{RsvpSubmission, WeddingData, Wish};
use crate::state::SharedState;

#[derive(Template)]
#[template(path = "index.html")]
pub struct IndexTemplate {
    pub data: WeddingData,
    pub title: String,
    pub events_json: String,
    pub gallery_json: String,
    pub first_map_url: String,
    pub current_year: i32,
}

#[derive(Template)]
#[template(path = "admin.html")]
pub struct AdminTemplate;

fn render_template<T: Template>(tmpl: T) -> Response {
    match tmpl.render() {
        Ok(html) => Html(html).into_response(),
        Err(err) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            format!("Template error: {err}"),
        )
            .into_response(),
    }
}

pub async fn home_page() -> Response {
    let data = get_wedding_data();
    let title = format!("{} & {} | Thep Cuoi", data.bride.short_name, data.groom.short_name);
    let events_json = serde_json::to_string(&data.events).unwrap_or_else(|_| "[]".to_string());
    let gallery_json = serde_json::to_string(&data.gallery).unwrap_or_else(|_| "[]".to_string());
    let first_map_url = data
        .events
        .first()
        .map(|e| e.map_url.to_string())
        .unwrap_or_else(|| "#".to_string());
    let current_year = Utc::now().year();

    render_template(IndexTemplate {
        data,
        title,
        events_json,
        gallery_json,
        first_map_url,
        current_year,
    })
}

pub async fn admin_page() -> Response {
    render_template(AdminTemplate)
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateRsvpRequest {
    pub name: Option<String>,
    pub phone: Option<String>,
    pub guest_count: Option<u32>,
    pub message: Option<String>,
    pub attending: Option<String>,
}

pub async fn get_rsvps(State(state): State<SharedState>) -> impl IntoResponse {
    let store = state.read().await;
    Json(json!({ "submissions": store.submissions }))
}

pub async fn create_rsvp(
    State(state): State<SharedState>,
    Json(payload): Json<CreateRsvpRequest>,
) -> impl IntoResponse {
    let name = payload.name.unwrap_or_default().trim().to_string();
    let phone = payload.phone.unwrap_or_default().trim().to_string();
    let attending_raw = payload.attending.unwrap_or_default().trim().to_string();

    if name.is_empty() || phone.is_empty() || attending_raw.is_empty() {
        return (
            StatusCode::BAD_REQUEST,
            Json(json!({ "error": "Thieu thong tin bat buoc." })),
        );
    }

    let entry = RsvpSubmission {
        name,
        phone,
        guest_count: payload.guest_count.unwrap_or(1).max(1),
        message: payload.message.unwrap_or_default().trim().to_string(),
        attending: if attending_raw == "yes" {
            "yes".to_string()
        } else {
            "no".to_string()
        },
        submitted_at: Utc::now().to_rfc3339(),
    };

    let mut store = state.write().await;
    store.submissions.push(entry);

    (StatusCode::CREATED, Json(json!({ "success": true })))
}

#[derive(Deserialize)]
pub struct WishesQuery {
    pub all: Option<bool>,
}

pub async fn get_wishes(
    State(state): State<SharedState>,
    Query(query): Query<WishesQuery>,
) -> impl IntoResponse {
    let store = state.read().await;
    let wishes: Vec<&Wish> = if query.all.unwrap_or(false) {
        store.wishes.iter().collect()
    } else {
        store.wishes.iter().filter(|w| w.approved).collect()
    };
    Json(json!({ "wishes": wishes }))
}

#[derive(Deserialize)]
pub struct CreateWishRequest {
    pub name: Option<String>,
    pub message: Option<String>,
}

pub async fn create_wish(
    State(state): State<SharedState>,
    Json(payload): Json<CreateWishRequest>,
) -> impl IntoResponse {
    let name = payload.name.unwrap_or_default().trim().to_string();
    let message: String = payload
        .message
        .unwrap_or_default()
        .trim()
        .chars()
        .take(300)
        .collect();

    if name.is_empty() || message.is_empty() {
        return (
            StatusCode::BAD_REQUEST,
            Json(json!({ "error": "Vui long dien day du." })),
        );
    }

    let wish = Wish {
        id: Utc::now().timestamp_millis().to_string(),
        name,
        message,
        created_at: Utc::now().to_rfc3339(),
        approved: false,
    };

    let mut store = state.write().await;
    store.wishes.push(wish);

    (StatusCode::CREATED, Json(json!({ "success": true })))
}

#[derive(Deserialize)]
pub struct ApproveWishRequest {
    pub id: Option<String>,
}

pub async fn approve_wish(
    State(state): State<SharedState>,
    Json(payload): Json<ApproveWishRequest>,
) -> impl IntoResponse {
    let id = payload.id.unwrap_or_default();
    let mut store = state.write().await;

    if let Some(wish) = store.wishes.iter_mut().find(|w| w.id == id) {
        wish.approved = true;
        (StatusCode::OK, Json(json!({ "success": true })))
    } else {
        (
            StatusCode::NOT_FOUND,
            Json(json!({ "error": "Not found." })),
        )
    }
}
