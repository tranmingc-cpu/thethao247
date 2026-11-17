import React, { useEffect, useState, useMemo } from 'react';
import { SPORTS } from '../../config/sports';
import { getAllRSSNews } from '../../services/rssServices';
import { NewsItem } from '../../types/types';
import '../home.css';

interface SportsProps {
    search: string;
    onArticleClick: (article: NewsItem) => void;
}

const Sports: React.FC<SportsProps> = ({ search, onArticleClick }) => {
    const [news, setNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [selectedSport, setSelectedSport] = useState<string>('Tất cả');
    const [sortBy, setSortBy] = useState<'latest' | 'oldest'>('latest');

    useEffect(() => {
        setLoading(true);
        getAllRSSNews(SPORTS).then(items => {
            setNews(items);
            setLoading(false);
        });
    }, []);

    const filteredNews = useMemo(() => {
        let result = news.filter(item => {
            const matchSport = selectedSport === 'Tất cả' || item.category === selectedSport;
            const query = search.toLowerCase().trim();
            const matchSearch =
                !query ||
                item.title?.toLowerCase().includes(query) ||
                item.description?.toLowerCase().includes(query);
            return matchSport && matchSearch;
        });

        result.sort((a, b) => {
            const timeA = new Date(a.pubDate || 0).getTime();
            const timeB = new Date(b.pubDate || 0).getTime();
            return sortBy === 'latest' ? timeB - timeA : timeA - timeB;
        });

        return result;
    }, [news, selectedSport, search, sortBy]);

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
                <p>Đang tải tin tức các môn thể thao...</p>
            </div>
        );
    }

    return (
        <div className="main-wrapper">
            <section className="football-filter-section">
                <div className="football-leagues-bar">
                    <span className="filter-title">Môn thể thao:</span>
                    <div className="football-pills">
                        <button
                            type="button"
                            className={`pill-btn ${selectedSport === 'Tất cả' ? 'active' : ''}`}
                            onClick={() => setSelectedSport('Tất cả')}
                        >
                            Tất cả các môn
                        </button>
                        {SPORTS.map(cat => (
                            <button
                                type="button"
                                key={cat.slug}
                                className={`pill-btn ${selectedSport === cat.name ? 'active' : ''}`}
                                onClick={() => setSelectedSport(cat.name)}
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
                            Mới nhất
                        </button>
                        <button
                            type="button"
                            className={`sort-btn ${sortBy === 'oldest' ? 'active' : ''}`}
                            onClick={() => setSortBy('oldest')}
                        >
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

            <div className="layout-columns">
                <div className="news-feed">
                    <div className="block-heading">
                        <h2 className="block-title">
                            {selectedSport === 'Tất cả' ? 'Tin Thể Thao Tổng Hợp & Các Bộ Môn' : selectedSport}
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
                                    <span className="news-badge">{item.category || 'Thể thao'}</span>
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

export default Sports;

