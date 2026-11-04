import React, { useMemo, useState } from "react";
import "./home.css";

function Home({ news, selectedCategory, onSelectCategory, search, onArticleClick }) {
    const [visibleCount, setVisibleCount] = useState(10);

    const filteredNews = useMemo(() => {
        return news.filter(item => {
            const matchCategory = selectedCategory === "Tất cả" || item.category === selectedCategory;
            const matchSearch = item.title?.toLowerCase().includes(search.toLowerCase());
            return matchCategory && matchSearch;
        });
    }, [news, selectedCategory, search]);

    const mainHero = filteredNews[0];
    const subHero = filteredNews.slice(1, 3);
    const quickStrip = filteredNews.slice(3, 6);
    const streamNews = filteredNews.slice(6, 6 + visibleCount);
    const trendingNews = news.slice(0, 5);

    function formatDate(date) {
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
                        <marquee behavior="scroll" direction="left" scrollamount="6">
                            {news.slice(0, 8).map((item, idx) => (
                                <span
                                    key={item.id || idx}
                                    style={{ marginRight: "35px", cursor: "pointer" }}
                                    onClick={() => onArticleClick(item)}
                                >
                                    ⚽ {item.title}
                                </span>
                            ))}
                        </marquee>
                    </div>
                </div>
            </div>

            <main className="main-wrapper">
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
                                {selectedCategory === "Tất cả" ? "Dòng Sự Kiện Thể Thao Mới Nhất" : selectedCategory}
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
                                    onClick={() => setVisibleCount(prev => prev + 10)}
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
}

export default Home;
