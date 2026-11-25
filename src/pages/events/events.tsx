import React, { useEffect, useMemo, useState } from 'react';
import { EVENTS } from '../../config/events';
import { getAllRSSNews } from '../../services/rssServices';
import { NewsItem } from '../../types/types';
import './events.css';

interface EventsProps {
    search: string;
    onArticleClick: (article: NewsItem) => void;
}

type EventWidget = {
    title: string;
    url: string;
    description: string;
    size?: 'normal' | 'compact';
};

const EVENT_INTRO: Record<string, string> = {
    'Asian Cup': 'Tin tức, lịch thi đấu, kết quả và bảng xếp hạng Vòng chung kết Asian Cup.',
    'World Cup': 'Tin tức, lịch thi đấu, kết quả và bảng xếp hạng vòng loại World Cup 2026.',
    'U23 Châu Á': 'Tin tức, lịch thi đấu, kết quả và bảng xếp hạng giải U23 châu Á.',
    'SEA Games': 'Tin tức và thành tích của các đoàn thể thao tại Đại hội Thể thao Đông Nam Á.',
    'Olympic': 'Tin tức và thành tích thể thao tại Thế vận hội Olympic.',
    'AFF Cup': 'Tin tức mới nhất về bóng đá Đông Nam Á.',
    'Esports': 'Tin tức thể thao điện tử, các tựa game và giải đấu nổi bật.',
    'Xe': 'Tin tức ô tô, xe máy, xe điện và xu hướng ngành xe.',
    'Công nghệ': 'Tin tức công nghệ, thiết bị và những xu hướng mới.'
};

/*
 * Chỉ khai báo widget khi đã xác định được đúng trang dữ liệu của giải trên
 * Thể Thao 247. Không dùng chung URL giữa các giải.
 *
 * Không khai báo widget SEA Games khi chưa có nguồn bảng tổng sắp huy chương
 * có thể nhúng và kiểm chứng trực tiếp. Không tạo dữ liệu huy chương giả.
 */
const EVENT_WIDGETS: Record<string, EventWidget[]> = {
    'Asian Cup': [
        {
            title: 'Lịch thi đấu & kết quả Asian Cup',
            url: 'https://thethao247.vn/livescores/chau-a/asian-cup/?box=&iframe=&limit=10&nocache=1',
            description: 'Lịch thi đấu và kết quả của Asian Cup 2027.'
        },
        {
            title: 'Bảng xếp hạng Asian Cup',
            url: 'https://thethao247.vn/livescores/chau-a/asian-cup/standings/?box=&iframe=&nocache=1&priority_table=F&round=2BlOBHpg',
            description: 'Bảng xếp hạng các bảng đấu Asian Cup.'
        }
    ],
    'World Cup': [
        {
            title: 'Lịch thi đấu & kết quả World Cup',
            url: 'https://thethao247.vn/livescores/the-gioi/world-championship/?box=&iframe=&limit=10&nocache=1',
            description: 'Lịch thi đấu và kết quả vòng loại World Cup 2026.'
        },
        {
            title: 'Bảng xếp hạng World Cup',
            url: 'https://thethao247.vn/livescores/the-gioi/world-championship/standings/?box=&iframe=&nocache=1',
            description: 'Bảng xếp hạng các khu vực vòng loại World Cup.'
        }
    ],
    'U23 Châu Á': [
        {
            title: 'Lịch thi đấu & kết quả U23 Châu Á',
            url: 'https://thethao247.vn/livescores/chau-a/afc-asian-cup-u23/?box=&iframe=&limit=10&nocache=1',
            description: 'Lịch thi đấu và kết quả AFC Asian Cup U23.'
        },
        {
            title: 'Bảng xếp hạng U23 Châu Á',
            url: 'https://thethao247.vn/livescores/chau-a/afc-asian-cup-u23/standings/?box=&iframe=&nocache=1',
            description: 'Bảng xếp hạng các bảng đấu AFC Asian Cup U23.',
            size: 'compact'
        }
    ],
};

const Events: React.FC<EventsProps> = ({ search, onArticleClick }) => {
    const [news, setNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [selectedEvent, setSelectedEvent] = useState('Tất cả');
    const [sortBy, setSortBy] = useState<'latest' | 'oldest'>('latest');
    const [visibleCount, setVisibleCount] = useState(10);

    useEffect(() => {
        let mounted = true;
        getAllRSSNews(EVENTS)
            .then(items => {
                if (mounted) setNews(items);
            })
            .catch(() => {
                if (mounted) setLoadError('Không thể tải dữ liệu tin tức. Vui lòng thử tải lại trang.');
            })
            .finally(() => {
                if (mounted) setLoading(false);
            });
        return () => { mounted = false; };
    }, []);

    // Lọc theo danh mục và từ khóa trước, sau đó tạo một thứ tự nền cố định
    // (mới nhất) để chọn tin nổi bật. Nút Mới nhất/Cũ nhất chỉ tác động danh sách tin.
    const matchedNews = useMemo(() => {
        const query = search.toLocaleLowerCase('vi-VN').trim();
        const result = news.filter(item => {
            // Feed Asian Cup hiện đang trộn bài từ chuyên mục U17 Asian Cup.
            // Chỉ giữ bài có đường dẫn thuộc chuyên mục Asian Cup chính.
            const isWrongU17Article = item.category === 'Asian Cup' &&
                item.link.toLowerCase().includes('/u17-asian-cup/');
            if (isWrongU17Article) return false;

            const matchEvent = selectedEvent === 'Tất cả' || item.category === selectedEvent;
            const searchableText = `${item.title || ''} ${item.description || ''}`.toLocaleLowerCase('vi-VN');
            return matchEvent && (!query || searchableText.includes(query));
        });

        return result.sort((a, b) => {
            const dateA = new Date(a.pubDate || 0).getTime();
            const dateB = new Date(b.pubDate || 0).getTime();
            return dateB - dateA;
        });
    }, [news, selectedEvent, search]);

    const sortedNews = useMemo(() => {
        if (sortBy === 'latest') return matchedNews;
        return [...matchedNews].sort((a, b) => {
            const dateA = new Date(a.pubDate || 0).getTime();
            const dateB = new Date(b.pubDate || 0).getTime();
            return dateA - dateB;
        });
    }, [matchedNews, sortBy]);

    useEffect(() => setVisibleCount(10), [selectedEvent, search, sortBy]);

    // Ba bài đầu tiên theo thứ tự mới nhất được giữ cố định khi đổi cách sắp xếp.
    const featuredNews = matchedNews.slice(0, 3);
    const heroNews = featuredNews[0];
    const secondaryNews = featuredNews.slice(1, 3);
    const featuredLinks = new Set(featuredNews.map(item => item.link));
    const sidebarNews = matchedNews.slice(3, 8);
    const remainingSortedNews = sortedNews.filter(item => !featuredLinks.has(item.link));
    const listNews = remainingSortedNews.slice(0, visibleCount);
    const activeWidgets = selectedEvent === 'Tất cả'
        ? []
        : (EVENT_WIDGETS[selectedEvent] || []);

    const formatDate = (date: string | null) => {
        if (!date) return 'Vừa cập nhật';
        const value = new Date(date);
        if (Number.isNaN(value.getTime())) return 'Vừa cập nhật';
        return `${value.getHours().toString().padStart(2, '0')}:${value.getMinutes().toString().padStart(2, '0')} - ${value.toLocaleDateString('vi-VN')}`;
    };

    const renderArticleCard = (item: NewsItem, index: number) => (
        <article className="events-list-item" key={item.id || `${item.link}-${index}`} onClick={() => onArticleClick(item)}>
            <div className="events-list-image">
                {item.image ? <img src={item.image} alt={item.title} loading="lazy" /> : <div className="events-no-image">THỂ THAO 247</div>}
            </div>
            <div className="events-list-content">
                <span className="events-tag">{item.category || 'Tin tức'}</span>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <time>{formatDate(item.pubDate)}</time>
            </div>
        </article>
    );

    if (loading) {
        return <main className="events-page"><div className="events-loading">Đang tải tin tức Sự kiện & Công nghệ...</div></main>;
    }

    return (
        <main className="events-page">
            <section className="events-filter-panel">
                <div className="events-filter-row">
                    <strong>SỰ KIỆN & CÔNG NGHỆ:</strong>
                    <div className="events-pills">
                        <button className={selectedEvent === 'Tất cả' ? 'active' : ''} onClick={() => setSelectedEvent('Tất cả')}>Tất cả sự kiện</button>
                        {EVENTS.map(category => (
                            <button key={category.slug} className={selectedEvent === category.name ? 'active' : ''} onClick={() => setSelectedEvent(category.name)}>{category.name}</button>
                        ))}
                    </div>
                </div>
                <div className="events-sort-row">
                    <span>Sắp xếp:</span>
                    <button className={sortBy === 'latest' ? 'active' : ''} onClick={() => setSortBy('latest')}>Mới nhất</button>
                    <button className={sortBy === 'oldest' ? 'active' : ''} onClick={() => setSortBy('oldest')}>Cũ nhất</button>
                </div>
            </section>

            {search.trim() && <div className="events-search-status">Kết quả tìm kiếm cho <strong>“{search}”</strong>: {matchedNews.length} bài viết</div>}
            {loadError && <div className="events-error">{loadError}</div>}

            <div className="events-columns">
                <section className="events-main-column">
                    <div className="events-section-heading">
                        <h1>{selectedEvent === 'Tất cả' ? 'Tin Sự kiện & Công nghệ' : selectedEvent}</h1>
                        <span>{matchedNews.length} bài viết</span>
                    </div>

                    {heroNews ? (
                        <>
                            <div className="events-hero-grid">
                                <article className="events-hero-main" onClick={() => onArticleClick(heroNews)}>
                                    {heroNews.image ? <img src={heroNews.image} alt={heroNews.title} /> : <div className="events-no-image">THỂ THAO 247</div>}
                                    <div className="events-hero-overlay">
                                        <span className="events-tag">{heroNews.category}</span>
                                        <h2>{heroNews.title}</h2>
                                        <time>{formatDate(heroNews.pubDate)}</time>
                                    </div>
                                </article>
                                <div className="events-hero-side">
                                    {secondaryNews.map((item, index) => (
                                        <article className="events-hero-small" key={item.id || index} onClick={() => onArticleClick(item)}>
                                            {item.image ? <img src={item.image} alt={item.title} /> : <div className="events-no-image">THỂ THAO 247</div>}
                                            <div className="events-small-overlay"><h3>{item.title}</h3><time>{formatDate(item.pubDate)}</time></div>
                                        </article>
                                    ))}
                                </div>
                            </div>

                            {selectedEvent !== 'Tất cả' && (
                                <section className="events-info-panel">
                                    <h2>{selectedEvent}</h2>
                                    <p>{EVENT_INTRO[selectedEvent] || 'Tin tức mới nhất từ Thể Thao 247.'}</p>
                                </section>
                            )}

                            {activeWidgets.length > 0 && (
                                <section className="events-widgets-section">
                                    {activeWidgets.map((widget) => (
                                        <div className="events-widget-card" key={widget.title}>
                                            <div className="events-widget-heading">
                                                <div>
                                                    <h2>{widget.title}</h2>
                                                    <p>{widget.description}</p>
                                                </div>
                                            </div>
                                            <iframe
                                                className={`events-widget-iframe ${widget.size === 'compact' ? 'events-widget-iframe-compact' : ''}`}
                                                title={widget.title}
                                                src={widget.url}
                                                loading="lazy"
                                            />
                                        </div>
                                    ))}
                                </section>
                            )}

                            <div className="events-content-grid">
                                <div className="events-news-list">
                                    <div className="events-subheading"><h2>Tin mới nhất</h2><span>{remainingSortedNews.length} bài</span></div>
                                    {listNews.map(renderArticleCard)}
                                    {remainingSortedNews.length > visibleCount && (
                                        <button className="events-load-more" onClick={() => setVisibleCount(count => count + 10)}>Xem thêm tin tức</button>
                                    )}
                                </div>
                                <aside className="events-sidebar">
                                    <section className="events-sidebar-card">
                                        <h2>Tin nổi bật</h2>
                                        <ol className="events-trending-list">
                                            {sidebarNews.map((item, index) => (
                                                <li key={item.id || index} onClick={() => onArticleClick(item)}>
                                                    <b>{String(index + 1).padStart(2, '0')}</b><span>{item.title}</span>
                                                </li>
                                            ))}
                                        </ol>
                                    </section>
                                </aside>
                            </div>
                        </>
                    ) : (
                        <div className="events-empty">{loadError || 'Không có bài viết nào phù hợp với bộ lọc hiện tại.'}</div>
                    )}
                </section>
            </div>
        </main>
    );
};

export default Events;
