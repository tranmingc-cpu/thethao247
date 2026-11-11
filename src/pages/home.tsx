import React, { useMemo, useState } from "react";
import { NewsItem } from "../types/types";
import { FootBall } from "../config/football";
import "./home.css";

interface HomeProps {
    news: NewsItem[];
    selectedCategory: string;
    onSelectCategory: (category: string) => void;
    search: string;
    onArticleClick: (article: NewsItem) => void;
}
const Home: React.FC<HomeProps> = ({
    news,
    selectedCategory,
    onSelectCategory,
    search,
    onArticleClick
}) => {
    const [visibleCount, setVisibleCount] = useState<number>(10);
    const [sortBy, setSortBy] = useState<'latest' | 'oldest'>('latest');

    const filteredNews = useMemo(() => {
        let result = news.filter((item) => {
            let matchCategory = selectedCategory === "Tất cả";

            if (!matchCategory) {
                if (item.category === selectedCategory) {
                    matchCategory = true;
                } else if (selectedCategory === "Bóng đá Việt Nam") {
                    const text = `${item.title} ${item.description} ${item.link}`.toLowerCase();
                    matchCategory = text.includes('việt nam') || text.includes('-c1-') || text.includes('v-league') || text.includes('vff');
                } else if (selectedCategory === "Ngoại hạng Anh") {
                    const text = `${item.title} ${item.description} ${item.link}`.toLowerCase();
                    matchCategory = text.includes('ngoại hạng anh') || text.includes('premier league') || text.includes('mu ') || text.includes('chelsea') || text.includes('arsenal') || text.includes('liverpool') || text.includes('man city') || text.includes('tottenham');
                } else if (selectedCategory === "La Liga") {
                    const text = `${item.title} ${item.description} ${item.link}`.toLowerCase();
                    matchCategory = text.includes('la liga') || text.includes('real madrid') || text.includes('barcelona') || text.includes('barca');
                } else if (selectedCategory === "Cúp C1 (Champions League)") {
                    const text = `${item.title} ${item.description} ${item.link}`.toLowerCase();
                    matchCategory = text.includes('cúp c1') || text.includes('champions league');
                } else if (selectedCategory === "Chuyển nhượng") {
                    const text = `${item.title} ${item.description} ${item.link}`.toLowerCase();
                    matchCategory = text.includes('chuyển nhượng') || text.includes('chiêu mộ') || text.includes('hợp đồng');
                }
            }

            const query = search.toLowerCase().trim();
            const matchSearch =
                !query ||
                item.title?.toLowerCase().includes(query) ||
                item.description?.toLowerCase().includes(query);

            return matchCategory && matchSearch;
        });

        result.sort((a, b) => {
            const timeA = new Date(a.pubDate || 0).getTime();
            const timeB = new Date(b.pubDate || 0).getTime();
            return sortBy === 'latest' ? timeB - timeA : timeA - timeB;
        });

        return result;
    }, [news, selectedCategory, search, sortBy]);

    const mainHero = filteredNews[0];
    const subHero = filteredNews.slice(1, 3);
    const quickStrip = filteredNews.slice(3, 6);
    const streamNews = filteredNews.slice(6, 6 + visibleCount);
    const trendingNews = news.slice(0, 5);

    function formatDate(date: string | null) {
        if (!date) return "Vừa xong";
        try {
            const d = new Date(date);
            return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")} - ${d.toLocaleDateString("vi-VN")}`;
        } catch {
            return "Mới cập nhật";
        }
    }

    return (
        <div>
            <div className="ticker-bar">
                <div className="ticker-content">
                    <div className="ticker-label">
                        <span>⚡ TIÊU ĐIỂM</span>
                    </div>
                    <div className="ticker-scroll">
                        <div className="ticker-track">
                            {news.slice(0, 8).map((item, idx) => (
                                <span key={item.id || idx}
                                    className="ticker-item"
                                    onClick={() => onArticleClick(item)}>
                                      ⚽ {item.title}
                                 </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <main className="main-wrapper">
                <section className="football-filter-section">
                    <div className="football-leagues-bar">
                        <span className="filter-title">⚽ Giải đấu:</span>
                        <div className="football-pills">
                            <button
                                type="button"
                                className={`pill-btn ${selectedCategory === "Tất cả" ? "active" : ""}`}
                                onClick={() => onSelectCategory("Tất cả")}
                            >
                                Tất cả bóng đá
                            </button>
                            {FootBall.filter(c => c.slug !== "trang-chu").map((cat) => (
                                <button
                                    type="button"
                                    key={cat.slug}
                                    className={`pill-btn ${selectedCategory === cat.name ? "active" : ""}`}
                                    onClick={() => onSelectCategory(cat.name)}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="football-sort-bar">
                        <span className="sort-label">Sắp xếp:</span>
                        <div className="sort-buttons">
                            <button
                                type="button"
                                className={`sort-btn ${sortBy === 'latest' ? 'active' : ''}`}
                                onClick={() => setSortBy('latest')}
                            >
                                Mới nhất ⬇
                            </button>
                            <button
                                type="button"
                                className={`sort-btn ${sortBy === 'oldest' ? 'active' : ''}`}
                                onClick={() => setSortBy('oldest')}
                            >
                                Cũ nhất ⬆
                            </button>
                        </div>
                    </div>
                </section>

                {search.trim() && (
                    <div className="search-status-banner">
                        <span>
                            🔍 Kết quả tìm kiếm cho: <strong>"{search}"</strong> (Tìm thấy <strong>{filteredNews.length}</strong> bài viết)
                        </span>
                    </div>
                )}

                {mainHero && (
                    <section className="hero-grid">
                        <article
                            className="hero-main"
                            style={{ cursor: "pointer" }}
                            onClick={() => onArticleClick(mainHero)}
                        >
                            {mainHero.image ? (
                                <img src={mainHero.image} alt={mainHero.title} />
                            ) : (
                                <div className="no-image">THỂ THAO 247</div>
                            )}
                            <div className="hero-overlay">
                                <span className="hero-tag">{mainHero.category || "Tiêu điểm"}</span>
                                <h1>{mainHero.title}</h1>
                                <p className="hero-desc">{mainHero.description}</p>
                                <span className="hero-time">⏱ {formatDate(mainHero.pubDate)}</span>
                            </div>
                        </article>
                        <div className="hero-sub-list">
                            {subHero.map((item, idx) => (
                                <article
                                    className="hero-sub"
                                    key={item.id || idx}
                                    style={{ cursor: "pointer" }}
                                    onClick={() => onArticleClick(item)}
                                >
                                    {item.image ? (
                                        <img src={item.image} alt={item.title} />
                                    ) : (
                                        <div className="no-image">THỂ THAO 247</div>
                                    )}
                                    <div className="hero-sub-overlay">
                                        <span className="hero-tag">{item.category || "Tin nóng"}</span>
                                        <h3>{item.title}</h3>
                                        <span className="hero-time">⏱ {formatDate(item.pubDate)}</span>
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
                                onClick={() => onArticleClick(item)}
                            >
                                <div className="strip-thumb">
                                    {item.image ? (
                                        <img src={item.image} alt={item.title} />
                                    ) : (
                                        <div className="no-image">THỂ THAO 247</div>
                                    )}
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
                                {selectedCategory === "Tất cả" ? "Dòng Sự Kiện Bóng Đá Mới Nhất" : selectedCategory}
                            </h2>
                            <span className="block-meta">{filteredNews.length} bài viết</span>
                        </div>

                        <div className="news-feed-list">
                            {streamNews.map((item, idx) => (
                                <article
                                    className="news-article-row"
                                    key={item.id || idx}
                                    style={{ cursor: "pointer" }}
                                    onClick={() => onArticleClick(item)}
                                >
                                    <div className="news-article-thumb">
                                        {item.image ? (
                                            <img src={item.image} alt={item.title} loading="lazy" />
                                        ) : (
                                            <div className="no-image">THỂ THAO 247</div>
                                        )}
                                    </div>
                                    <div className="news-article-body">
                                        <span className="news-badge">{item.category || "Tin tức"}</span>
                                        <h3 className="news-article-title">{item.title}</h3>
                                        <p className="news-article-desc">{item.description}</p>
                                        <div className="news-article-meta">
                                            <span>⏱ {formatDate(item.pubDate)}</span>
                                        </div>
                                    </div>
                                </article>
                            ))}

                            {streamNews.length === 0 && (
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
                                    onClick={() => setVisibleCount((prev) => prev + 10)}
                                >
                                    Xem thêm tin tức ▾
                                </button>
                            </div>
                        )}
                    </div>

                    <aside className="sidebar-wrapper">
                        <div className="sidebar-card">
                            <h3 className="sidebar-title">🔥 Đọc Nhiều Nhất</h3>
                            <div className="trending-list">
                                {trendingNews.map((item, index) => (
                                    <div
                                        className="trending-item"
                                        key={item.id || index}
                                        style={{ cursor: "pointer" }}
                                        onClick={() => onArticleClick(item)}
                                    >
                                        <span className="trending-rank">0{index + 1}</span>
                                        <div className="trending-content">
                                            <h4>{item.title}</h4>
                                            <span>{item.category} • {formatDate(item.pubDate)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="sidebar-card">
                            <h3 className="sidebar-title">🏆 BXH Ngoại Hạng Anh</h3>
                            <table className="widget-table">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Đội</th>
                                        <th>Trận</th>
                                        <th>Đ</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>1</td>
                                        <td className="team-cell"><span className="team-badge">LIV</span> Liverpool</td>
                                        <td>26</td>
                                        <td><strong>60</strong></td>
                                    </tr>
                                    <tr>
                                        <td>2</td>
                                        <td className="team-cell"><span className="team-badge">ARS</span> Arsenal</td>
                                        <td>26</td>
                                        <td><strong>53</strong></td>
                                    </tr>
                                    <tr>
                                        <td>3</td>
                                        <td className="team-cell"><span className="team-badge">MCI</span> Man City</td>
                                        <td>26</td>
                                        <td><strong>50</strong></td>
                                    </tr>
                                    <tr>
                                        <td>4</td>
                                        <td className="team-cell"><span className="team-badge">CHE</span> Chelsea</td>
                                        <td>26</td>
                                        <td><strong>46</strong></td>
                                    </tr>
                                    <tr>
                                        <td>5</td>
                                        <td className="team-cell"><span className="team-badge">MUN</span> Man United</td>
                                        <td>26</td>
                                        <td><strong>42</strong></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div className="sidebar-card">
                            <h3 className="sidebar-title">⏱ Tâm Điểm Trận Đấu</h3>
                            <div style={{ fontSize: "13px", display: "flex", flexDirection: "column", gap: "10px" }}>
                                <div style={{ background: "#f8fafc", padding: "10px", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
                                    <div style={{ fontSize: "11px", color: "#64748b", marginBottom: "4px" }}>V-League • 19:15</div>
                                    <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "700" }}>
                                        <span>Hà Nội FC</span>
                                        <span style={{ color: "#c8102e" }}>VS</span>
                                        <span>CAHN</span>
                                    </div>
                                </div>
                                <div style={{ background: "#f8fafc", padding: "10px", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
                                    <div style={{ fontSize: "11px", color: "#64748b", marginBottom: "4px" }}>Ngoại Hạng Anh • 23:30</div>
                                    <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "700" }}>
                                        <span>Arsenal</span>
                                        <span style={{ color: "#c8102e" }}>VS</span>
                                        <span>Chelsea</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            </main>
        </div>
    );
};

export default Home;

