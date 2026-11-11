import React, { useEffect, useState, useMemo } from 'react';
import { EVENTS } from '../../config/events';
import { getAllRSSNews } from '../../services/rssServices';
import { NewsItem } from '../../types/types';
import '../home.css';

interface EventsProps {
    search: string;
    onArticleClick: (article: NewsItem) => void;
}

const Events: React.FC<EventsProps> = ({ search, onArticleClick }) => {
    const [news, setNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [selectedEvent, setSelectedEvent] = useState<string>('Tất cả');
    const [sortBy, setSortBy] = useState<'latest' | 'oldest'>('latest');

    useEffect(() => {
        setLoading(true);
        getAllRSSNews(EVENTS).then(items => {
            setNews(items);
            setLoading(false);
        });
    }, []);

    const filteredNews = useMemo(() => {
        let result = news.filter(item => {
            const matchEvent = selectedEvent === 'Tất cả' || item.category === selectedEvent;
            const query = search.toLowerCase().trim();
            const matchSearch =
                !query ||
                item.title?.toLowerCase().includes(query) ||
                item.description?.toLowerCase().includes(query);
            return matchEvent && matchSearch;
        });

        result.sort((a, b) => {
            const timeA = new Date(a.pubDate || 0).getTime();
            const timeB = new Date(b.pubDate || 0).getTime();
            return sortBy === 'latest' ? timeB - timeA : timeA - timeB;
        });

        return result;
    }, [news, selectedEvent, search, sortBy]);

    function formatDate(date: string | null) {
        if (!date) return 'Vừa xong';
        try {
            const d = new Date(date);
            return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')} - ${d.toLocaleDateString('vi-VN')}`;
        } catch {
            return 'Mới cập nhật';
        }
    }

    if (loading && news.length === 0) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Đang tải tin tức sự kiện & công nghệ...</p>
            </div>
        );
    }

    return (
        <div className="main-wrapper">
            <section className="football-filter-section">
                <div className="football-leagues-bar">
                    <span className="filter-title">⚡ Sự kiện & Công nghệ:</span>
                    <div className="football-pills">
                        <button
                            type="button"
                            className={`pill-btn ${selectedEvent === 'Tất cả' ? 'active' : ''}`}
                            onClick={() => setSelectedEvent('Tất cả')}
                        >
                            Tất cả sự kiện
                        </button>
                        {EVENTS.map(cat => (
                            <button
                                type="button"
                                key={cat.slug}
                                className={`pill-btn ${selectedEvent === cat.name ? 'active' : ''}`}
                                onClick={() => setSelectedEvent(cat.name)}
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
                        🔍 Tìm kiếm sự kiện/công nghệ cho: <strong>"{search}"</strong> (Tìm thấy <strong>{filteredNews.length}</strong> bài viết)
                    </span>
                </div>
            )}

            <div className="layout-columns">
                <div className="news-feed">
                    <div className="block-heading">
                        <h2 className="block-title">
                            {selectedEvent === 'Tất cả' ? 'Tin Sự Kiện Thể Thao, Esports, Xe & Công Nghệ' : selectedEvent}
                        </h2>
                        <span className="block-meta">{filteredNews.length} bài viết</span>
                    </div>

                    <div className="news-feed-list">
                        {filteredNews.map((item, idx) => (
                            <article
                                className="news-article-row"
                                key={item.id || idx}
                                style={{ cursor: 'pointer' }}
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
                                    <span className="news-badge">{item.category || 'Sự kiện'}</span>
                                    <h3 className="news-article-title">{item.title}</h3>
                                    <p className="news-article-desc">{item.description}</p>
                                    <div className="news-article-meta">
                                        <span>⏱ {formatDate(item.pubDate)}</span>
                                    </div>
                                </div>
                            </article>
                        ))}

                        {filteredNews.length === 0 && (
                            <div className="no-news-box">
                                <p>Không có bài viết nào phù hợp.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Events;

