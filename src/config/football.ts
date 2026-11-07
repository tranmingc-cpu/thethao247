export interface FootballCategory {
    slug: string;
    name: string;
    rss: string;
    description?: string;
}

export const FootBall: FootballCategory[] = [
    {
        slug: "trang-chu",
        name: "Trang chủ / Tổng hợp",
        rss: "https://thethao247.vn/trang-chu.rss",
        description: "Nguồn tin tổng hợp tất cả các sự kiện thể thao mới nhất"
    },
    {
        slug: "bong-da-viet-nam",
        name: "Bóng đá Việt Nam",
        rss: "https://thethao247.vn/bong-da-viet-nam-c1.rss",
        description: "Tin tức ĐTQG, U23, V-League, giải quốc nội"
    },
    {
        slug: "bong-da-quoc-te",
        name: "Bóng đá quốc tế",
        rss: "https://thethao247.vn/bong-da-quoc-te-c2.rss",
        description: "Tin tức thế giới, các giải đấu hàng đầu"
    },
    {
        slug: "ngoai-hang-anh",
        name: "Ngoại hạng Anh",
        rss: "https://thethao247.vn/ngoai-hang-anh-c7.rss",
        description: "Premier League"
    },
    {
        slug: "la-liga",
        name: "La Liga",
        rss: "https://thethao247.vn/la-liga-c8.rss",
        description: "Giải vô địch quốc gia Tây Ban Nha"
    },
    {
        slug: "cup-c1",
        name: "Cúp C1 (Champions League)",
        rss: "https://thethao247.vn/cup-c1-c11.rss",
        description: "UEFA Champions League"
    },
    {
        slug: "chuyen-nhuong",
        name: "Chuyển nhượng",
        rss: "https://thethao247.vn/tin-chuyen-nhuong-c12.rss",
        description: "Tin tức mua bán, đồn đoán cầu thủ"
    },
];