use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Person {
    pub full_name: &'static str,
    pub short_name: &'static str,
    pub parents: &'static str,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct WeddingEvent {
    pub title: &'static str,
    pub date: &'static str,
    pub time: &'static str,
    pub venue: &'static str,
    pub address: &'static str,
    pub map_url: &'static str,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct StoryMilestone {
    pub year: &'static str,
    pub title: &'static str,
    pub description: &'static str,
    pub emoji: &'static str,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct GalleryPhoto {
    pub src: &'static str,
    pub alt: &'static str,
    pub width: u32,
    pub height: u32,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct BankAccount {
    pub owner: &'static str,
    pub bank: &'static str,
    pub account_number: &'static str,
    pub qr_src: &'static str,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct WeddingData {
    pub bride: Person,
    pub groom: Person,
    pub wedding_date: &'static str,
    pub quote: &'static str,
    pub opening_message: &'static str,
    pub events: Vec<WeddingEvent>,
    pub story: Vec<StoryMilestone>,
    pub gallery: Vec<GalleryPhoto>,
    pub bank_accounts: Vec<BankAccount>,
    pub music_url: &'static str,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RsvpSubmission {
    pub name: String,
    pub phone: String,
    pub guest_count: u32,
    pub message: String,
    pub attending: String,
    pub submitted_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Wish {
    pub id: String,
    pub name: String,
    pub message: String,
    pub created_at: String,
    pub approved: bool,
}
