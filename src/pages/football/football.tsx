import React, { useMemo, useState } from "react";
import { NewsItem } from "../../types/types";
import { FootBall } from "../../config/football";
import "./football.css";

interface FootballProps {
    news: NewsItem[];
    selectedCategory: string;
    onSelectCategory: (category: string) => void;
    search: string;
    onArticleClick: (article: NewsItem) => void;
}
const STANDINGS_DATA = {
    epl: [
        { rank: 1, team: "Liverpool", badge: "LIV", played: 28, points: 64 },
        { rank: 2, team: "Arsenal", badge: "ARS", played: 28, points: 58 },
        { rank: 3, team: "Man City", badge: "MCI", played: 28, points: 55 },
        { rank: 4, team: "Chelsea", badge: "CHE", played: 28, points: 49 },
        { rank: 5, team: "Newcastle", badge: "NEW", played: 28, points: 47 }
    ],
    laliga: [
        { rank: 1, team: "Barcelona", badge: "BAR", played: 27, points: 61 },
        { rank: 2, team: "Real Madrid", badge: "RMA", played: 27, points: 58 },
        { rank: 3, team: "Atletico", badge: "ATM", played: 27, points: 54 },
        { rank: 4, team: "Villarreal", badge: "VIL", played: 27, points: 48 },
        { rank: 5, team: "Athletic Club", badge: "ATH", played: 27, points: 46 }
    ],
    vleague: [
        { rank: 1, team: "Thép Xanh Nam Định", badge: "NĐ", played: 15, points: 35 },
        { rank: 2, team: "Hà Nội FC", badge: "HN", played: 15, points: 30 },
        { rank: 3, team: "CAHN", badge: "CA", played: 15, points: 28 },
        { rank: 4, team: "Thể Công Viettel", badge: "TC", played: 15, points: 26 },
        { rank: 5, team: "Bình Dương", badge: "BD", played: 15, points: 24 }
    ]
};

const MATCHES_DATA = {
    today: [
        { league: "V-League", time: "18:00", home: "Hà Nội FC", away: "CAHN", status: "19:15", score: "VS" },
        { league: "Ngoại Hạng Anh", time: "19:30", home: "Arsenal", away: "Chelsea", status: "Sắp đấu", score: "VS" },
        { league: "La Liga", time: "22:15", home: "Real Madrid", away: "Sevilla", status: "Sắp đấu", score: "VS" }
    ],
    tomorrow: [
        { league: "Cúp C1", time: "03:00", home: "Bayern Munich", away: "PSG", status: "Ngày mai", score: "VS" },
        { league: "Ngoại Hạng Anh", time: "21:00", home: "Liverpool", away: "Man City", status: "Ngày mai", score: "VS" }
    ],
    yesterday: [
        { league: "Ngoại Hạng Anh", time: "FT", home: "Man United", away: "Tottenham", status: "Kết thúc", score: "2 - 1" },
        { league: "La Liga", time: "FT", home: "Barcelona", away: "Valencia", status: "Kết thúc", score: "3 - 0" }
    ]
};

const Football: React.FC<FootballProps> = ({
                                               news,
                                               selectedCategory,
                                               onSelectCategory,
                                               search,
                                               onArticleClick
                                           }) => {
    const [visibleCount, setVisibleCount] = useState<number>(10);
    const [sortBy, setSortBy] = useState<'latest' | 'oldest'>('latest');
    const [activeLeagueTab, setActiveLeagueTab] = useState<'epl' | 'laliga' | 'vleague'>('epl');
    const [activeMatchTab, setActiveMatchTab] = useState<'today' | 'tomorrow' | 'yesterday'>('today');
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
            const now = Date.now();
            const past = new Date(date).getTime();
            const diffMs = now - past;
            if (diffMs < 0 || isNaN(diffMs)) return "Vừa xong";

            const diffMins = Math.floor(diffMs / (1000 * 60));
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
            const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

            if (diffMins < 1) return "Vừa xong";
            if (diffMins < 60) return `${diffMins} phút trước`;
            if (diffHours < 24) return `${diffHours} giờ trước`;
            if (diffDays === 1) return "Hôm qua";
            if (diffDays < 7) return `${diffDays} ngày trước`;

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
                        <span> TIÊU ĐIỂM</span>
                    </div>
                    <div className="ticker-scroll">
                        <div className="ticker-track">
                            {news.slice(0, 8).map((item, idx) => (
                                <span key={item.id || idx}
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
                        <span className="filter-title"> Giải đấu:</span>
                        <div className="football-pills">
                            <button
                                type="button"
                                className={`pill-btn ${selectedCategory === "Tất cả" ? "active" : ""}`}
                                onClick={() => onSelectCategory("Tất cả")}>
                                Tất cả bóng đá
                            </button>
                            {FootBall.filter(c => c.slug !== "trang-chu").map((cat) => (
                                <button
                                    type="button"
                                    key={cat.slug}
                                    className={`pill-btn ${selectedCategory === cat.name ? "active" : ""}`}
                                    onClick={() => onSelectCategory(cat.name)}>
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
                                onClick={() => setSortBy('latest')}>
                                Mới nhất ⬇
                            </button>
                            <button
                                type="button"
                                className={`sort-btn ${sortBy === 'oldest' ? 'active' : ''}`}
                                onClick={() => setSortBy('oldest')}>
                                Cũ nhất ⬆
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
                            {mainHero.image ? (
                                <img src={mainHero.image} alt={mainHero.title} />) : (
                                <div className="no-image">THỂ THAO 247</div>)}
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
                                    onClick={() => onArticleClick(item)}>
                                    {item.image ? (
                                        <img src={item.image} alt={item.title} />) : (
                                        <div className="no-image">THỂ THAO 247</div>)}
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
                        <div className="sidebar-card">
                            <div className="widget-header-tabs">
                                <h3 className="sidebar-title">Bảng Xếp Hạng</h3>
                                <div className="widget-tab-buttons">
                                    <button
                                        type="button"
                                        className={`widget-tab-btn ${activeLeagueTab === 'epl' ? 'active' : ''}`}
                                        onClick={() => setActiveLeagueTab('epl')}
                                    >
                                        EPL
                                    </button>
                                    <button
                                        type="button"
                                        className={`widget-tab-btn ${activeLeagueTab === 'laliga' ? 'active' : ''}`}
                                        onClick={() => setActiveLeagueTab('laliga')}
                                    >
                                        La Liga
                                    </button>
                                    <button
                                        type="button"
                                        className={`widget-tab-btn ${activeLeagueTab === 'vleague' ? 'active' : ''}`}
                                        onClick={() => setActiveLeagueTab('vleague')}
                                    >
                                        V-League
                                    </button>
                                </div>
                            </div>
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
                                {STANDINGS_DATA[activeLeagueTab].map((row) => (
                                    <tr key={row.rank}>
                                        <td>{row.rank}</td>
                                        <td className="team-cell">
                                            <span className="team-badge">{row.badge}</span> {row.team}
                                        </td>
                                        <td>{row.played}</td>
                                        <td><strong>{row.points}</strong></td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="sidebar-card">
                            <div className="widget-header-tabs">
                                <h3 className="sidebar-title">Lịch Thi Đấu & Kết Quả</h3>
                                <div className="widget-tab-buttons">
                                    <button
                                        type="button"
                                        className={`widget-tab-btn ${activeMatchTab === 'yesterday' ? 'active' : ''}`}
                                        onClick={() => setActiveMatchTab('yesterday')}
                                    >
                                        Hôm qua
                                    </button>
                                    <button
                                        type="button"
                                        className={`widget-tab-btn ${activeMatchTab === 'today' ? 'active' : ''}`}
                                        onClick={() => setActiveMatchTab('today')}
                                    >
                                        Hôm nay
                                    </button>
                                    <button
                                        type="button"
                                        className={`widget-tab-btn ${activeMatchTab === 'tomorrow' ? 'active' : ''}`}
                                        onClick={() => setActiveMatchTab('tomorrow')}
                                    >
                                        Ngày mai
                                    </button>
                                </div>
                            </div>
                            <div className="matches-list">
                                {MATCHES_DATA[activeMatchTab].map((m, idx) => (
                                    <div key={idx} className="match-item-card">
                                        <div className="match-item-header">
                                            <span>{m.league}</span>
                                            <span>{m.time}</span>
                                        </div>
                                        <div className="match-item-teams">
                                            <span className="match-team home">{m.home}</span>
                                            <span className={`match-score-pill ${m.score !== 'VS' ? 'completed' : ''}`}>
                                                {m.score}
                                            </span>
                                            <span className="match-team away">{m.away}</span>
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

export default Football;