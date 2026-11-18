import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { SPORTS } from '../../config/sports';
import { getAllRSSNews } from '../../services/rssServices';
import { NewsItem } from '../../types/types';
import '../home.css';

interface SportDetailProps {
    search: string;
    onArticleClick: (article: NewsItem) => void;
}

function formatDate(date: string | null) {
    if (!date) return 'Vừa xong';
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return 'Mới cập nhật';
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')} - ${d.toLocaleDateString('vi-VN')}`;
}

const SportDetail: React.FC<SportDetailProps> = ({ search, onArticleClick }) => {
    const { slug } = useParams<{ slug: string }>();
    const sport = SPORTS.find((s) => s.slug === slug);

    const [news, setNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [visibleCount, setVisibleCount] = useState<number>(10);

    useEffect(() => {
        if (!sport) return;
        let cancelled = false;
        setLoading(true);
        setVisibleCount(10);
        getAllRSSNews([sport]).then((items) => {
            if (!cancelled) {
                setNews(items);
                setLoading(false);
            }
        });
        return () => { cancelled = true; };
    }, [sport]);

    const filtered = useMemo(() => {
        const q = search.toLowerCase().trim();
        return news.filter(
            (i) => !q || i.title?.toLowerCase().includes(q) || i.description?.toLowerCase().includes(q)
        );
    }, [news, search]);

    // Bài nổi bật: 4 bài mới nhất có ảnh (news đã sort mới nhất)
    const featured = useMemo(() => filtered.filter((i) => i.image).slice(0, 4), [filtered]);
    const featuredIds = new Set(featured.map((i) => i.id));
    const rest = filtered.filter((i) => !featuredIds.has(i.id));

    if (!sport) {
        return (
            <div className="main-wrapper">
                <p>Không tìm thấy môn thể thao này.</p>
                <Link to="/the-thao">← Về trang các môn thể thao</Link>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Đang tải tin {sport.name}...</p>
            </div>
        );
    }

    const [mainHero, ...subHero] = featured;

    return (
        <div className="main-wrapper">
            <div className="breadcrumb" style={{ marginBottom: 12 }}>
                <Link to="/the-thao" style={{ color: '#c8102e', fontWeight: 700 }}>Các môn thể thao</Link>
                <span> / {sport.name}</span>
            </div>

            <div className="block-heading">
                <h2 className="block-title">{sport.name}</h2>
                <span className="block-meta">{filtered.length} bài viết</span>
            </div>

            {mainHero && (
                <section className="hero-grid">
                    <article className="hero-main" style={{ cursor: 'pointer' }} onClick={() => onArticleClick(mainHero)}>
                        <img src={mainHero.image} alt={mainHero.title} referrerPolicy="no-referrer" />
                        <div className="hero-overlay">
                            <span className="hero-tag">{sport.name}</span>
                            <h1>{mainHero.title}</h1>
                            <p className="hero-desc">{mainHero.description}</p>
                            <span className="hero-time">⏱ {formatDate(mainHero.pubDate)}</span>
                        </div>
                    </article>
                    <div className="hero-sub-list">
                        {subHero.slice(0, 2).map((item) => (
                            <article className="hero-sub" key={item.id} style={{ cursor: 'pointer' }} onClick={() => onArticleClick(item)}>
                                <img src={item.image} alt={item.title} referrerPolicy="no-referrer" />
                                <div className="hero-sub-overlay">
                                    <span className="hero-tag">{sport.name}</span>
                                    <h3>{item.title}</h3>
                                    <span className="hero-time">⏱ {formatDate(item.pubDate)}</span>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>
            )}

            <div className="news-feed">
                <div className="news-feed-list">
                    {[...subHero.slice(2), ...rest].slice(0, visibleCount).map((item, idx) => (
                        <article
                            className="news-article-row"
                            key={item.id || idx}
                            style={{ cursor: 'pointer' }}
                            onClick={() => onArticleClick(item)}
                        >
                            <div className="news-article-thumb">
                                {item.image ? (
                                    <img src={item.image} alt={item.title} loading="lazy" referrerPolicy="no-referrer" />
                                ) : (
                                    <div className="no-image">THỂ THAO 247</div>
                                )}
                            </div>
                            <div className="news-article-body">
                                <span className="news-badge">{sport.name}</span>
                                <h3 className="news-article-title">{item.title}</h3>
                                <p className="news-article-desc">{item.description}</p>
                                <div className="news-article-meta">
                                    <span>⏱ {formatDate(item.pubDate)}</span>
                                </div>
                            </div>
                        </article>
                    ))}

                    {filtered.length === 0 && (
                        <div className="no-news-box">
                            <p>Không có bài viết nào (feed trống hoặc không khớp từ khóa).</p>
                        </div>
                    )}
                </div>

                {filtered.length > visibleCount + featured.length && (
                    <div className="load-more-box">
                        <button type="button" className="btn-load-more" onClick={() => setVisibleCount((p) => p + 10)}>
                            Xem thêm tin tức ▾
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SportDetail;