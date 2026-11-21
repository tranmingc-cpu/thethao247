import React, { useEffect, useMemo, useState } from 'react';
import { EVENTS } from '../../config/events';
import { getAllRSSNews } from '../../services/rssServices';
import { NewsItem } from '../../types/types';
import './events.css';

interface EventsProps {
    search: string;
    onArticleClick: (article: NewsItem) => void;
}

type EventLayout = 'tournament' | 'medal' | 'news';

const EVENT_LAYOUTS: Record<string, EventLayout> = {
    'Asian Cup': 'tournament',
    'World Cup': 'tournament',
    'U23 Châu Á': 'tournament',
    'SEA Games': 'medal',
    'Olympic': 'medal',
    'AFF Cup': 'news',
    'Esports': 'news',
    'Xe': 'news',
    'Công nghệ': 'news'
};

const EVENT_INTRO: Record<string, string> = {
    'Asian Cup': 'Tin tức, lịch thi đấu và thông tin về Vòng chung kết Asian Cup.',
    'World Cup': 'Tin tức, diễn biến và thông tin về Giải vô địch bóng đá thế giới.',
    'U23 Châu Á': 'Tin tức và thông tin về các đội tuyển tại giải U23 châu Á.',
    'SEA Games': 'Tin tức, thành tích và hoạt động thể thao tại Đại hội Thể thao Đông Nam Á.',
    'Olympic': 'Tin tức và thành tích thể thao tại Thế vận hội Olympic.',
    'AFF Cup': 'Tin tức mới nhất về bóng đá Đông Nam Á.',
    'Esports': 'Tin tức thể thao điện tử, các tựa game và giải đấu nổi bật.',
    'Xe': 'Tin tức ô tô, xe máy, xe điện và xu hướng ngành xe.',
    'Công nghệ': 'Tin tức công nghệ, thiết bị và những xu hướng mới.'
};

const ASIAN_CUP_FIXTURES = 'https://thethao247.vn/livescores/chau-a/asian-cup/?box=&iframe=&limit=10&nocache=1';
const ASIAN_CUP_STANDINGS = 'https://thethao247.vn/livescores/chau-a/asian-cup/standings/?box=&iframe=&nocache=1&priority_table=F&round=2BlOBHpg';

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

    const filteredNews = useMemo(() => {
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

        result.sort((a, b) => {
            const dateA = new Date(a.pubDate || 0).getTime();
            const dateB = new Date(b.pubDate || 0).getTime();
            return sortBy === 'latest' ? dateB - dateA : dateA - dateB;
        });
        return result;
    }, [news, selectedEvent, search, sortBy]);

    useEffect(() => setVisibleCount(10), [selectedEvent, search, sortBy]);

    const activeLayout = selectedEvent === 'Tất cả' ? 'news' : (EVENT_LAYOUTS[selectedEvent] || 'news');
    const heroNews = filteredNews[0];
    const secondaryNews = filteredNews.slice(1, 3);
    const sidebarNews = filteredNews.slice(3, 8);
    const listNews = filteredNews.slice(3, 3 + visibleCount);

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

            {search.trim() && <div className="events-search-status">Kết quả tìm kiếm cho <strong>“{search}”</strong>: {filteredNews.length} bài viết</div>}
            {loadError && <div className="events-error">{loadError}</div>}

            <div className="events-columns">
                <section className="events-main-column">
                    <div className="events-section-heading">
                        <h1>{selectedEvent === 'Tất cả' ? 'Tin Sự kiện & Công nghệ' : selectedEvent}</h1>
                        <span>{filteredNews.length} bài viết</span>
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

                            {activeLayout === 'tournament' && selectedEvent === 'Asian Cup' && (
                                <section className="events-info-panel">
                                    <h2>Thông tin Asian Cup 2027</h2>
                                    <p>{EVENT_INTRO[selectedEvent]}</p>
                                    <div className="events-info-links">
                                        <a href="https://thethao247.vn/asian-cup" target="_blank" rel="noreferrer">Trang Asian Cup trên Thể Thao 247</a>
                                        <a href={ASIAN_CUP_FIXTURES} target="_blank" rel="noreferrer">Mở lịch thi đấu</a>
                                        <a href={ASIAN_CUP_STANDINGS} target="_blank" rel="noreferrer">Mở bảng xếp hạng</a>
                                    </div>
                                </section>
                            )}

                            <div className="events-content-grid">
                                <div className="events-news-list">
                                    <div className="events-subheading"><h2>Tin mới nhất</h2><span>{filteredNews.length} bài</span></div>
                                    {listNews.map(renderArticleCard)}
                                    {filteredNews.length > 3 + visibleCount && (
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
                                    {selectedEvent === 'Asian Cup' && (
                                        <>
                                            <section className="events-sidebar-card">
                                                <h2>Lịch thi đấu Asian Cup</h2>
                                                <iframe title="Lịch thi đấu Asian Cup" src={ASIAN_CUP_FIXTURES} loading="lazy" />
                                            </section>
                                            <section className="events-sidebar-card">
                                                <h2>Bảng xếp hạng Asian Cup</h2>
                                                <iframe title="Bảng xếp hạng Asian Cup" src={ASIAN_CUP_STANDINGS} loading="lazy" />
                                            </section>
                                        </>
                                    )}
                                    {selectedEvent !== 'Asian Cup' && selectedEvent !== 'Tất cả' && (
                                        <section className="events-sidebar-card events-about-card">
                                            <h2>Giới thiệu chuyên mục</h2>
                                            <p>{EVENT_INTRO[selectedEvent] || 'Tin tức mới nhất từ Thể Thao 247.'}</p>
                                        </section>
                                    )}
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
