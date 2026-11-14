import React, { useEffect, useState, useMemo } from "react";
import { getAllRSSNews } from "../services/rssServices";
import { ALL_CATEGORIES } from "../config/categories";
import { NewsItem } from "../types/types";
import "./home.css";
interface HomeProps {
    search: string;
    onArticleClick: (article: NewsItem) => void;}
const Home: React.FC<HomeProps> = ({ search, onArticleClick }) => {
    const [allNews, setAllNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [selectedGroup, setSelectedGroup] = useState<string>("Tất cả");
    const [visibleCount, setVisibleCount] = useState<number>(10);
    const [sortBy, setSortBy] = useState<"latest" | "oldest">("latest");
    useEffect(() => {
        setLoading(true);
        getAllRSSNews(ALL_CATEGORIES).then((items) => {
            setAllNews(items);
            setLoading(false);
        });
    }, []);
    const filteredNews = useMemo(() => {
        let result = allNews.filter((item) => {
            let matchGroup = true;
            if (selectedGroup === "Bóng đá") {
                const text = `${item.title} ${item.description} ${item.category}`.toLowerCase();
                matchGroup =
                    text.includes("bóng đá") ||
                    text.includes("ngoại hạng anh") ||
                    text.includes("v-league") ||
                    text.includes("la liga") ||
                    text.includes("cúp c1") ||
                    text.includes("mu ") ||
                    text.includes("chelsea") ||
                    text.includes("arsenal") ||
                    text.includes("liverpool") ||
                    text.includes("chuyển nhượng");
            }
            const query = search.toLowerCase().trim();
            const matchSearch =
                !query ||
                item.title?.toLowerCase().includes(query) ||
                item.description?.toLowerCase().includes(query);
            return matchGroup && matchSearch;
        });
        result.sort((a, b) => {
            const timeA = new Date(a.pubDate || 0).getTime();
            const timeB = new Date(b.pubDate || 0).getTime();
            return sortBy === "latest" ? timeB - timeA : timeA - timeB;
        });
        return result;
    }, [allNews, selectedGroup, search, sortBy]);
    const mainHero = filteredNews[0];
    const subHero = filteredNews.slice(1, 3);
    const quickStrip = filteredNews.slice(3, 6);
    const streamNews = filteredNews.slice(6, 6 + visibleCount);
    const trendingNews = allNews.slice(0, 5);
    function formatDate(date: string | null) {
        if (!date) return "Vừa xong";
        try {
            const d = new Date(date);
            return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")} - ${d.toLocaleDateString("vi-VN")}`;
        } catch {
            return "Mới cập nhật";
        }
    }
    if (loading && allNews.length === 0) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Đang tải dòng tin tổng hợp Thể Thao 247...</p>
            </div>
        );
    }
    return (
        <div>
            <div className="ticker-bar">
                <div className="ticker-content">
                    <div className="ticker-label">
                        <span>TIÊU ĐIỂM 24/7</span>
                    </div>
                    <div className="ticker-scroll">
                        <div className="ticker-track">
                            {allNews.slice(0, 8).map((item, idx) => (
                                <span
                                    key={item.id || idx}
                                    className="ticker-item"
                                    onClick={() => onArticleClick(item)}>
                                    {item.title}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            <main className="main-wrapper">
                <section className="football-filter-section">
                    <div className="football-leagues-bar">
                        <span className="filter-title">Chủ đề:</span>
                        <div className="football-pills">
                            {["Tất cả", "Bóng đá", "Các môn thể thao", "Sự kiện & Công nghệ"].map((group) => (
                                <button
                                    type="button"
                                    key={group}
                                    className={`pill-btn ${selectedGroup === group ? "active" : ""}`}
                                    onClick={() => setSelectedGroup(group)}>
                                    {group}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="football-sort-bar">
                        <span className="sort-label">Sắp xếp:</span>
                        <div className="sort-buttons">
                            <button
                                type="button"
                                className={`sort-btn ${sortBy === "latest" ? "active" : ""}`}
                                onClick={() => setSortBy("latest")}>
                                Mới nhất
                            </button>
                            <button
                                type="button"
                                className={`sort-btn ${sortBy === "oldest" ? "active" : ""}`}
                                onClick={() => setSortBy("oldest")}>
                                Cũ nhất
                            </button>
                        </div>
                    </div>
                </section>
                {search.trim() && (
                    <div className="search-status-banner">
                        <span>
                            Kết quả tìm kiếm cho: <strong>"{search}"</strong> (Tìm thấy <strong>{filteredNews.length}</strong> bài viết)
                        </span>
                    </div>
                )}
                {mainHero && (
                    <section className="hero-grid">
                        <article
                            className="hero-main"
                            style={{ cursor: "pointer" }}
                            onClick={() => onArticleClick(mainHero)}>
                            {mainHero.image ? (<img src={mainHero.image} alt={mainHero.title} />
                            ) : (
                                <div className="no-image">THỂ THAO 247</div>)}
                            <div className="hero-overlay">
                                <span className="hero-tag">{mainHero.category || "Tiêu điểm"}</span>
                                <h1>{mainHero.title}</h1>
                                <p className="hero-desc">{mainHero.description}</p>
                                <span className="hero-time">{formatDate(mainHero.pubDate)}</span>
                            </div>
                        </article>
                        <div className="hero-sub-list">
                            {subHero.map((item, idx) => (
                                <article
                                    className="hero-sub"
                                    key={item.id || idx}
                                    style={{ cursor: "pointer" }}
                                    onClick={() => onArticleClick(item)}>
                                    {item.image ? (
                                        <img src={item.image} alt={item.title} />) : (
                                        <div className="no-image">THỂ THAO 247</div>)}
                                    <div className="hero-sub-overlay">
                                        <span className="hero-tag">{item.category || "Tin nóng"}</span>
                                        <h3>{item.title}</h3>
                                        <span className="hero-time">{formatDate(item.pubDate)}</span>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </section>
                )}
                {quickStrip.length > 0 && (
                    <section className="quick-strip">
                        {quickStrip.map((item, idx) => (
                            <article
                                className="strip-card"
                                key={item.id || idx}
                                style={{ cursor: "pointer" }}
                                onClick={() => onArticleClick(item)}>
                                <div className="strip-thumb">
                                    {item.image ? (
                                        <img src={item.image} alt={item.title} />) : (
                                        <div className="no-image">THỂ THAO 247</div>)}
                                </div>
                                <div className="strip-info">
                                    <span className="strip-category">{item.category}</span>
                                    <h4>{item.title}</h4>
                                    <span className="strip-date">{formatDate(item.pubDate)}</span>
                                </div>
                            </article>
                        ))}
                    </section>
                )}
                <div className="layout-columns">
                    <div className="news-feed">
                        <div className="block-heading">
                            <h2 className="block-title">
                                {selectedGroup === "Tất cả" ? "Dòng Sự Kiện Thể Thao Tổng Hợp 247" : selectedGroup}
                            </h2>
                            <span className="block-meta">{filteredNews.length} bài viết</span>
                        </div>
                        <div className="news-feed-list">
                            {streamNews.map((item, idx) => (
                                <article
                                    className="news-article-row"
                                    key={item.id || idx}
                                    style={{ cursor: "pointer" }}
                                    onClick={() => onArticleClick(item)}>
                                    <div className="news-article-thumb">
                                        {item.image ? (
                                            <img src={item.image} alt={item.title} loading="lazy" />) : (
                                            <div className="no-image">THỂ THAO 247</div>)}
                                    </div>
                                    <div className="news-article-body">
                                        <span className="news-badge">{item.category || "Tin tức"}</span>
                                        <h3 className="news-article-title">{item.title}</h3>
                                        <p className="news-article-desc">{item.description}</p>
                                        <div className="news-article-meta">
                                            <span>{formatDate(item.pubDate)}</span>
                                        </div>
                                    </div>
                                </article>
                            ))}
                            {filteredNews.length === 0 && (
                                <p style={{ padding: "30px", textAlign: "center", color: "#9ca3af" }}>
                                    Không có bài viết nào phù hợp.
                                </p>
                            )}
                        </div>
                        {filteredNews.length > 6 + visibleCount && (
                            <div className="load-more-box">
                                <button
                                    type="button"
                                    className="btn-load-more"
                                    onClick={() => setVisibleCount((prev) => prev + 10)}>
                                    Xem thêm tin tức ▾
                                </button>
                            </div>
                        )}
                    </div>
                    <aside className="sidebar-wrapper">
                        <div className="sidebar-card">
                            <h3 className="sidebar-title">Đọc Nhiều Nhất</h3>
                            <div className="trending-list">
                                {trendingNews.map((item, index) => (
                                    <div
                                        className="trending-item"
                                        key={item.id || index}
                                        style={{ cursor: "pointer" }}
                                        onClick={() => onArticleClick(item)}>
                                        <span className="trending-rank">0{index + 1}</span>
                                        <div className="trending-content">
                                            <h4>{item.title}</h4>
                                            <span>{item.category} • {formatDate(item.pubDate)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </aside>
                </div>
            </main>
        </div>
    );
};
export default Home;
