export interface Sport {
    slug: string;
    name: string;
    rss: string;
}

export const SPORTS: Sport[] = [
    { slug: "tong-hop", name: "Thể thao tổng hợp", rss: "https://thethao247.vn/the-thao-c5.rss" },
    { slug: "tennis", name: "Tennis", rss: "https://thethao247.vn/quan-vot-tennis-c4.rss" },
    { slug: "golf", name: "Golf", rss: "https://thethao247.vn/golf-c42.rss" },
    { slug: "bong-ro", name: "Bóng rổ", rss: "https://thethao247.vn/bong-ro-c43.rss" },
    { slug: "cau-long", name: "Cầu lông", rss: "https://thethao247.vn/cau-long-c44.rss" },
    { slug: "bong-chuyen", name: "Bóng chuyền", rss: "https://thethao247.vn/bong-chuyen-c45.rss" },
    { slug: "vo-thuat", name: "Võ thuật", rss: "https://thethao247.vn/vo-thuat-c228.rss" },
    { slug: "pickleball", name: "Pickleball", rss: "https://thethao247.vn/pickleball-c342.rss" },
];