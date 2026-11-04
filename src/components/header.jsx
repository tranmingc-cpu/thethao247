import React from "react";
import "./header.css";

function Header({ selectedCategory, onSelectCategory, search, onSearchChange, categories = [] }) {
    return (
        <header className="header-wrapper">
            <div className="top-bar">
                <div className="top-bar-container">
                    <div className="top-bar-left">
                        <span>📅 {new Date().toLocaleDateString("vi-VN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</span>
                        <span>•</span>
                        <span>Tin nhanh thể thao 24/7 liên tục cập nhật</span>
                    </div>
                    <div className="top-bar-right">
                        <a href="https://thethao247.vn/lich-thi-dau-bong-da-c32/" target="_blank" rel="noreferrer">Lịch thi đấu</a>
                        <a href="https://thethao247.vn/ket-qua-bong-da-c33/" target="_blank" rel="noreferrer">Kết quả</a>
                        <a href="https://thethao247.vn/bang-xep-hang-bong-da-c34/" target="_blank" rel="noreferrer">Bảng xếp hạng</a>
                    </div>
                </div>
            </div>

            <div className="header-main">
                <div className="brand-wrapper">
                    <a href="/" className="logo-badge">
                        THỂ THAO <span>247</span>
                    </a>
                    <span className="header-tagline">Mạng tin tức & Cộng đồng Thể thao số 1</span>
                </div>

                <div className="header-search">
                    <input
                        type="text"
                        placeholder="Tìm kiếm cầu thủ, giải đấu, tin chuyển nhượng..."
                        value={search}
                        onChange={e => onSearchChange(e.target.value)}
                    />
                    <button type="button" title="Tìm kiếm">🔍</button>
                </div>
            </div>

            <nav className="main-nav">
                <div className="nav-container">
                    <button
                        type="button"
                        className={`nav-item ${selectedCategory === "Tất cả" ? "active" : ""}`}
                        onClick={() => onSelectCategory("Tất cả")}
                    >
                        <span className="nav-home-icon">🏠</span> TRANG CHỦ
                    </button>

                    {categories.filter(c => c !== "Tất cả").slice(0, 9).map(category => (
                        <button
                            type="button"
                            key={category}
                            className={`nav-item ${selectedCategory === category ? "active" : ""}`}
                            onClick={() => onSelectCategory(category)}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </nav>
        </header>
    );
}

export default Header;

