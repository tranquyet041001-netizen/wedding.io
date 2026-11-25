use std::sync::Arc;
use tokio::sync::RwLock;
use chrono::Utc;
use crate::models::{RsvpSubmission, Wish};

pub struct AppDataStore {
    pub submissions: Vec<RsvpSubmission>,
    pub wishes: Vec<Wish>,
}

pub type SharedState = Arc<RwLock<AppDataStore>>;

impl AppDataStore {
    pub fn new() -> Self {
        let now = Utc::now().to_rfc3339();
        Self {
            submissions: Vec::new(),
            wishes: vec![
                Wish {
                    id: "1".to_string(),
                    name: "Gia dinh Nguyen".to_string(),
                    message: "Chuc hai ban tram nam hanh phuc, van su nhu y!".to_string(),
                    created_at: now.clone(),
                    approved: true,
                },
                Wish {
                    id: "2".to_string(),
                    name: "Ban be than thiet".to_string(),
                    message: "Hanh phuc mai mai, tinh yeu vinh cuu!".to_string(),
                    created_at: now,
                    approved: true,
                },
            ],
        }
    }
}
