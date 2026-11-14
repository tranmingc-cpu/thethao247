import React from "react";
import { NewsItem } from "../types/types.ts";
import "./detail.css";
interface DetailProps {
    article: NewsItem | null;
    onBack: () => void;
    onSelectArticle: (article: NewsItem) => void;
    allNews?: NewsItem[];
}
const Detail: React.FC<DetailProps> = ({ article, onBack, onSelectArticle, allNews = [] }) => {
    if (!article) {
        return (
            <div className="detail-wrapper">
                <button type="button" className="btn-back-home" onClick={onBack}>
                    ← Quay lại Trang Chủ
                </button>
                <p>Không tìm thấy nội dung bài viết.</p>
            </div>
        );
    }
    const relatedNews = allNews
        .filter(
            (item) =>
                item.id !== article.id &&
                item.link !== article.link &&
                (!article.category || item.category === article.category))
        .slice(0, 3);
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
        <div className="detail-wrapper">
            <div className="breadcrumb">
                <button type="button" onClick={onBack}>Trang chủ</button>
                <span>/</span>
                <span>{article.category || "Tin thể thao"}</span>
            </div>
            <div className="detail-layout">
                <article className="detail-main">
                    <span className="detail-category-tag">{article.category || "Tin nóng"}</span>
                    <h1 className="detail-title">{article.title}</h1>
                    <div className="detail-meta">
                        <span>⏱ {formatDate(article.pubDate)}</span>
                        <span>•</span>
                        <span>Nguồn: Thể Thao 247</span>
                    </div>
                    {article.description && (
                        <div className="detail-sapo">
                            {article.description}
                        </div>
                    )}
                    {article.image && (
                        <div className="detail-cover">
                            <img src={article.image} alt={article.title} />
                        </div>
                    )}
                    <div className="detail-content">
                        <p>{article.description}</p>
                        <p>Theo dõi các diễn biến thể thao mới nhất trong ngày trên hệ thống thể thao trực tuyến. Mọi thông tin chuyển nhượng, kết quả thi đấu, bảng xếp hạng luôn được cập nhật chính xác và đầy đủ nhất theo thời gian thực.</p>
                    </div>
                    <div className="detail-original-link">
                        <span>Bài viết được lấy từ RSS Thethao247</span>
                        <a href={article.link} target="_blank" rel="noreferrer">
                            Xem bài gốc trên TheThao247.vn ↗
                        </a>
                    </div>
                    {relatedNews.length > 0 && (
                        <div className="related-section">
                            <h3 className="related-title">Tin cùng chuyên mục</h3>
                            <div className="related-grid">
                                {relatedNews.map((item, idx) => (
                                    <div
                                        key={item.id || idx}
                                        className="related-card"
                                        onClick={() => {
                                            onSelectArticle(item);
                                            window.scrollTo({ top: 0, behavior: "smooth" });
                                        }}>
                                        <div className="related-thumb">
                                            {item.image ? (
                                                <img src={item.image} alt={item.title} />) : (
                                                <div className="no-image">THỂ THAO 247</div>
                                            )}
                                        </div>
                                        <h5>{item.title}</h5>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </article>
                <aside className="sidebar-wrapper">
                    <div className="sidebar-card">
                        <h3 className="sidebar-title"> Tin Đọc Nhiều</h3>
                        <div className="trending-list">
                            {allNews.slice(0, 5).map((item, index) => (
                                <div
                                    className="trending-item"
                                    key={item.id || index}
                                    style={{ cursor: "pointer" }}
                                    onClick={() => {
                                        onSelectArticle(item);
                                        window.scrollTo({ top: 0, behavior: "smooth" });
                                    }}>
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
        </div>
    );
};
export default Detail;

