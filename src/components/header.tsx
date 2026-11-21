import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import logoImg from "../assets/logo.png";
import AuthModal from "./authModal";
import { getCurrentUser, logoutUser } from "../services/authService";
import { User } from "../types/types";
import "./header.css";

interface HeaderProps {
    selectedCategory: string;
    onSelectCategory: (category: string) => void;
    search: string;
    onSearchChange: (value: string) => void;
    categories?: string[];
}
const Header: React.FC<HeaderProps> = ({
                                           selectedCategory,
                                           onSelectCategory,
                                           search,
                                           onSearchChange,
                                           categories = []
                                       }) => {
    const location = useLocation();
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

    useEffect(() => {
        setCurrentUser(getCurrentUser());
    }, []);

    const handleLogout = () => {
        logoutUser();
        setCurrentUser(null);
    };

    const handleAuthSuccess = (user: User) => {
        setCurrentUser(user);
    };

    return (
        <header className="header-wrapper">
            <div className="top-bar">
                <div className="top-bar-container">
                    <div className="top-bar-left">
                        <span>{new Date().toLocaleDateString("vi-VN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</span>
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
                    <Link to="/" className="logo-link">
                        <img src={logoImg} alt="Logo Thể Thao 247" className="header-logo-img" />
                    </Link>
                    <span className="header-tagline">Mạng tin tức & Cộng đồng Thể thao số 1</span>
                </div>
                <div className="header-actions-area">
                    <div className="header-search">
                        <input
                            type="text"
                            placeholder="Tìm kiếm cầu thủ, giải đấu, tin chuyển nhượng..."
                            value={search}
                            onChange={(e) => onSearchChange(e.target.value)}
                        />
                        <button type="button" title="Tìm kiếm">Tìm kiếm</button>
                    </div>

                    <div className="header-user-box">
                        {currentUser ? (
                            <div className="user-profile-badge">
                                <span className="user-avatar-circle">{currentUser.username.charAt(0).toUpperCase()}</span>
                                <span className="user-display-name">{currentUser.fullName || currentUser.username}</span>
                                <button type="button" className="btn-logout-small" onClick={handleLogout}>
                                    Đăng xuất
                                </button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                className="btn-login-header"
                                onClick={() => setIsAuthModalOpen(true)}
                            >
                                Đăng nhập
                            </button>
                        )}
                    </div>
                </div>
            </div>
            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
                onAuthSuccess={handleAuthSuccess}
            />
            <nav className="main-nav">
                <div className="nav-container">
                    <Link
                        to="/"
                        className={`nav-item ${location.pathname === "/" ? "active" : ""}`}
                        onClick={() => onSelectCategory("Tất cả")}
                    >
                        TRANG CHỦ
                    </Link>
                    <Link
                        to="/bong-da"
                        className={`nav-item ${location.pathname.startsWith("/bong-da") ? "active" : ""}`}
                        onClick={() => onSelectCategory("Tất cả")}
                    >
                        BÓNG ĐÁ
                    </Link>
                    <Link
                        to="/the-thao"
                        className={`nav-item ${location.pathname.startsWith("/the-thao") ? "active" : ""}`}
                        onClick={() => onSelectCategory("Tất cả")}
                    >
                        CÁC MÔN THỂ THAO
                    </Link>
                    <Link
                        to="/su-kien"
                        className={`nav-item ${location.pathname.startsWith("/su-kien") ? "active" : ""}`}
                        onClick={() => onSelectCategory("Tất cả")}
                    >
                        SỰ KIỆN & CÔNG NGHỆ
                    </Link>
                    {(location.pathname === "/" || location.pathname.startsWith("/bong-da")) && categories.filter((c) => c !== "Tất cả").slice(0, 5).map((category) => (
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
};
export default Header;


