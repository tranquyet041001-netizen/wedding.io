use crate::models::{
    BankAccount, GalleryPhoto, Person, StoryMilestone, WeddingData, WeddingEvent,
};

// ================================================================
// Thay doi noi dung nay de cap nhat thong tin cuoi cua ban.
// ================================================================
pub fn get_wedding_data() -> WeddingData {
    WeddingData {
        bride: Person {
            full_name: "Le Bao Han",
            short_name: "Han",
            parents: "Ai nu cua ong ba Le Quang Duc & Nguyen Thi Hoa",
        },
        groom: Person {
            full_name: "Tran Cong Quyet",
            short_name: "Minh",
            parents: "Quy nam cua ong ba Tran Cong Luan & Nguyen Thi Thom",
        },
        wedding_date: "2027-12-24T10:30:00+07:00",
        quote: "Huu duyen thien ly nang tuong ngo.",
        opening_message: "Tran trong kinh moi quy vi cung chung kien va chung vui ngay trong dai cua chung toi. Su hien dien cua quy vi la niem hanh phuc vo bo voi hai gia dinh.",
        events: vec![
            WeddingEvent {
                title: "Le Thanh Hon",
                date: "Thu sau, 24 thang 12 nam 2027",
                time: "10:30",
                venue: "Tư gia nhà trai",
                address: "Số 165, Khu 5, Xóm 6, Xã Minh Châu, Thành phố Hà Nội",
                map_url: "https://maps.app.goo.gl/nZN3x9fuwDXRKzcP6",
            },
            WeddingEvent {
                title: "Tiec Mung",
                date: "Thu sau, 24 thang 12 nam 2027",
                time: "18:00",
                venue: "Tư gia nhà gái",
                address: "Số 365, Khu 6, Xóm 6, Xã Minh Châu, Thành phố Hà Nội",
                map_url: "https://maps.app.goo.gl/UhDSX3SsTzeBnBsf6",
            },
        ],
        story: vec![
            StoryMilestone {
                year: "2022",
                title: "Lan dau gap go",
                description: "Mot buoi chieu mua thu, chung toi tinh co gap nhau tai mot quan ca phe nho o Hoi An. Cau chuyen bat dau tu mot nu cuoi.",
                emoji: "\u{2615}",
            },
            StoryMilestone {
                year: "2023",
                title: "Bat dau hen ho",
                description: "Sau bao lan tro chuyen, chung toi nhan ra minh thuoc ve nhau. Mua xuan nam ay, tinh yeu chinh thuc nay no.",
                emoji: "\u{1F338}",
            },
            StoryMilestone {
                year: "2026",
                title: "Cau hon",
                description: "Duoi bau troi dem Da Lat day sao, anh quy xuong va trao cho em chiec nhan cung loi hua tron doi.",
                emoji: "\u{1F48D}",
            },
            StoryMilestone {
                year: "2027",
                title: "Ngay trong dai",
                description: "Sau bay nam ben nhau, chung toi chinh thuc nen duyen vo chong, cung nhau viet tiep cau chuyen cua minh.",
                emoji: "\u{1F33A}",
            },
        ],
        gallery: vec![
            GalleryPhoto { src: "/images/gallery/photo-1.jpg", alt: "Anh cap doi 1", width: 800, height: 1000 },
            GalleryPhoto { src: "/images/gallery/photo-2.jpg", alt: "Anh cap doi 2", width: 800, height: 600 },
            GalleryPhoto { src: "/images/gallery/photo-3.jpg", alt: "Anh cap doi 3", width: 800, height: 1000 },
            GalleryPhoto { src: "/images/gallery/photo-4.jpg", alt: "Anh cap doi 4", width: 800, height: 600 },
            GalleryPhoto { src: "/images/gallery/photo-5.jpg", alt: "Anh cap doi 5", width: 800, height: 1000 },
            GalleryPhoto { src: "/images/gallery/photo-6.jpg", alt: "Anh cap doi 6", width: 800, height: 600 },
        ],
        bank_accounts: vec![
            BankAccount {
                owner: "LE BAO HAN",
                bank: "Vietcombank",
                account_number: "1234567890",
                qr_src: "/qr/bride-qr.png",
            },
            BankAccount {
                owner: "TRAN CONG QUYET",
                bank: "Techcombank",
                account_number: "0987654321",
                qr_src: "/qr/groom-qr.png",
            },
        ],
        music_url: "/audio/wedding-song.mp3",
    }
}
