import React, { useMemo, useState } from "react";
import { NewsItem } from "../types";
import "./sea-games.css";

interface SeaGamesProps {
    news: NewsItem[];
    search: string;
    onArticleClick: (article: NewsItem) => void;
}

// Chỉ nhận bài viết từ RSS chính và các RSS con thuộc SEA Games 33.
// Không dùng từ khóa trong mô tả/tiêu đề để tránh nhận nhầm bài chỉ nhắc đến SEA Games.
const SEA_GAMES_RSS_PATHS = new Set([
    "/sea-games-33-c88.rss",
    "/bong-da-sea-games-c129.rss",
    "/tin-ben-le-c131.rss",
    "/cac-mon-khac-c132.rss"
]);

// Chỉ nhận bài đến từ RSS chính thức của SEA Games 33 và các RSS con đã xác định.
// Không dùng tên category/slug hoặc từ khóa trong tiêu đề để tránh nhận nhầm bài.
const isSeaGamesArticle = (item: NewsItem) => {
    if (!item.sourceUrl) return false;

    try {
        const sourcePath = new URL(item.sourceUrl, "https://thethao247.vn").pathname.toLowerCase();
        return SEA_GAMES_RSS_PATHS.has(sourcePath);
    } catch {
        return false;
    }
};

const formatDate = (date: string | null) => {
    if (!date) return "Chưa có ngày đăng";

    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) return "Chưa có ngày đăng";

    return parsedDate.toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
};

const SeaGames: React.FC<SeaGamesProps> = ({ news, search, onArticleClick }) => {
    const [selectedCategory, setSelectedCategory] = useState("Tất cả");
    const [sortMode, setSortMode] = useState("newest");
    const [visibleCount, setVisibleCount] = useState(9);

    // Lọc theo URL nguồn RSS SEA Games, không quét bài từ các RSS khác.
    const seaGamesNews = useMemo(() => {
        return news.filter(isSeaGamesArticle);
    }, [news]);

    const categories = useMemo(() => {
        return ["Tất cả", ...new Set(seaGamesNews.map((item) => item.category).filter(Boolean))];
    }, [seaGamesNews]);

    const filteredNews = useMemo(() => {
        const keyword = search.trim().toLocaleLowerCase("vi-VN");

        const result = seaGamesNews.filter((item) => {
            const matchCategory = selectedCategory === "Tất cả" || item.category === selectedCategory;
            const searchableText = `${item.title} ${item.description}`.toLocaleLowerCase("vi-VN");
            const matchSearch = !keyword || searchableText.includes(keyword);

            return matchCategory && matchSearch;
        });

        // Sắp xếp bài viết (Đã sửa lại lỗi phép trừ dateB - dateA)
        return [...result].sort((a, b) => {
            const dateA = a.pubDate ? new Date(a.pubDate).getTime() : 0;
            const dateB = b.pubDate ? new Date(b.pubDate).getTime() : 0;
            return sortMode === "newest" ? dateB - dateA : dateA - dateB;
        });
    }, [seaGamesNews, selectedCategory, search, sortMode]);

    const featuredNews = filteredNews[0];
    const listNews = filteredNews.slice(1, visibleCount + 1);

    return (
        <main className="sea-games-page">
            <section className="sea-games-heading">
                <div className="sea-games-heading__eyebrow">THỂ THAO 247 / SỰ KIỆN</div>
                <h1>TIN TỨC SEA GAMES</h1>
                <p>
                    Cập nhật các bài viết về SEA Games từ nguồn tin RSS của Thể Thao 247.
                </p>
            </section>

            <section className="sea-games-toolbar" aria-label="Bộ lọc tin SEA Games">
                <div className="sea-games-category-list">
                    {categories.map((category) => (
                        <button
                            type="button"
                            key={category}
                            className={`sea-games-category ${selectedCategory === category ? "is-active" : ""}`}
                            onClick={() => {
                                setSelectedCategory(category);
                                setVisibleCount(9);
                            }}
                        >
                            {category}
                        </button>
                    ))}
                </div>

                <label className="sea-games-sort">
                    <span>Sắp xếp:</span>
                    <select
                        value={sortMode}
                        onChange={(event) => setSortMode(event.target.value)}
                    >
                        <option value="newest">Mới nhất</option>
                        <option value="oldest">Cũ nhất</option>
                    </select>
                </label>
            </section>

            {featuredNews ? (
                <>
                    <section className="sea-games-featured">
                        <button
                            type="button"
                            className="sea-games-featured__image"
                            onClick={() => onArticleClick(featuredNews)}
                            aria-label={`Đọc bài: ${featuredNews.title}`}
                        >
                            {featuredNews.image ? (
                                <img src={featuredNews.image} alt={featuredNews.title} />
                            ) : (
                                <span className="sea-games-image-placeholder">SEA GAMES</span>
                            )}
                        </button>

                        <div className="sea-games-featured__content">
                            <span className="sea-games-label">TIN NỔI BẬT</span>
                            <span className="sea-games-date">{formatDate(featuredNews.pubDate)}</span>

                            <button
                                type="button"
                                className="sea-games-featured__title"
                                onClick={() => onArticleClick(featuredNews)}
                            >
                                {featuredNews.title}
                            </button>

                            <p>{featuredNews.description || "Xem bài viết gốc để đọc thêm thông tin."}</p>

                            <button
                                type="button"
                                className="sea-games-read-more"
                                onClick={() => onArticleClick(featuredNews)}
                            >
                                ĐỌC TIN <span aria-hidden="true">→</span>
                            </button>
                        </div>
                    </section>

                    <section className="sea-games-news-section">
                        <div className="sea-games-section-title">
                            <div>
                                <span className="sea-games-section-title__eyebrow">CẬP NHẬT TỪ RSS</span>
                                <h2>Tin SEA Games mới nhất</h2>
                            </div>
                            <span className="sea-games-news-count">{filteredNews.length} bài viết</span>
                        </div>

                        <div className="sea-games-news-grid">
                            {listNews.map((item) => (
                                <article className="sea-games-card" key={item.id}>
                                    <button
                                        type="button"
                                        className="sea-games-card__image"
                                        onClick={() => onArticleClick(item)}
                                        aria-label={`Đọc bài: ${item.title}`}
                                    >
                                        {item.image ? (
                                            <img src={item.image} alt={item.title} loading="lazy" />
                                        ) : (
                                            <span className="sea-games-image-placeholder">SEA GAMES</span>
                                        )}
                                    </button>

                                    <div className="sea-games-card__body">
                                        <div className="sea-games-card__meta">
                                            <span>{item.category}</span>
                                            <time>{formatDate(item.pubDate)}</time>
                                        </div>

                                        <button
                                            type="button"
                                            className="sea-games-card__title"
                                            onClick={() => onArticleClick(item)}
                                        >
                                            {item.title}
                                        </button>

                                        <p>{item.description}</p>
                                    </div>
                                </article>
                            ))}
                        </div>

                        {filteredNews.length > visibleCount + 1 && (
                            <div className="sea-games-load-more-wrap">
                                <button
                                    type="button"
                                    className="sea-games-load-more"
                                    onClick={() => setVisibleCount((current) => current + 9)}
                                >
                                    Xem thêm tin SEA Games
                                </button>
                            </div>
                        )}
                    </section>
                </>
            ) : (
                <section className="sea-games-empty">
                    <div className="sea-games-empty__icon">🏆</div>
                    <h2>Chưa tìm thấy tin SEA Games phù hợp</h2>
                    <p>
                        {seaGamesNews.length === 0
                            ? "RSS chung hiện chưa có bài viết thuộc danh mục SEA Games."
                            : "Không có bài viết khớp với từ khóa hoặc bộ lọc hiện tại."}
                    </p>
                    {search.trim() !== "" && (
                        <p>Thử xóa từ khóa tìm kiếm trên thanh tìm kiếm của website.</p>
                    )}
                </section>
            )}
        </main>
    );
};

export default SeaGames;