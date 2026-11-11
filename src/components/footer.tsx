import React from "react";
import "./footer.css";

const Footer: React.FC = () => {
    return (
        <footer className="footer-site">
            <div className="footer-nav-banner">
                <div className="footer-container" style={{ width: "100%", display: "flex", alignItems: "center" }}>
                    <div className="footer-nav-logo">
                        THETHAO<span>247</span><small>.vn</small>
                    </div>
                    <div className="footer-nav-decor"></div>
                </div>
            </div>

            <div className="footer-sitemap">
                <div className="footer-container">
                    <div className="footer-cols-grid">
                        <div className="footer-col-group">
                            <h4>Tiện ích bóng đá</h4>
                            <ul>
                                <li><a href="#!">Lịch thi đấu bóng đá</a></li>
                                <li><a href="#!">Kết quả bóng đá</a></li>
                                <li><a href="#!">Nhận định bóng đá</a></li>
                                <li><a href="#!">Tỷ số bóng đá</a></li>
                                <li><a href="#!">Trực tiếp bóng đá</a></li>
                                <li><a href="#!">Chuyển nhượng bóng đá</a></li>
                                <li><a href="#!">Video thể thao</a></li>
                            </ul>
                        </div>

                        <div className="footer-col-group">
                            <h4>Giải đấu nổi bật</h4>
                            <ul>
                                <li><a href="#!">Ngoại hạng Anh</a></li>
                                <li><a href="#!">Cúp C1</a></li>
                                <li><a href="#!">La Liga</a></li>
                                <li><a href="#!">Serie A</a></li>
                                <li><a href="#!">Bundesliga</a></li>
                                <li><a href="#!">V League</a></li>
                                <li><a href="#!">World Cup</a></li>
                                <li><a href="#!">Euro</a></li>
                                <li><a href="#!">Asian Cup</a></li>
                                <li><a href="#!">Cúp C2</a></li>
                                <li><a href="#!">SEA Games</a></li>
                                <li><a href="#!">AFF Cup</a></li>
                                <li><a href="#!">Bóng đá Việt Nam</a></li>
                            </ul>
                        </div>

                        <div className="footer-col-group">
                            <h4>Bảng xếp hạng bóng đá</h4>
                            <ul>
                                <li><a href="#!">BXH Ngoại hạng Anh</a></li>
                                <li><a href="#!">BXH La Liga</a></li>
                                <li><a href="#!">BXH Ý</a></li>
                                <li><a href="#!">BXH Cúp C1</a></li>
                                <li><a href="#!">BXH Cúp C2</a></li>
                                <li><a href="#!">BXH Đức</a></li>
                                <li><a href="#!">BXH Pháp</a></li>
                                <li><a href="#!">BXH V League</a></li>
                            </ul>
                        </div>

                        <div className="footer-col-group">
                            <h4>Kết quả bóng đá</h4>
                            <ul>
                                <li><a href="#!">Kết quả Cúp C1</a></li>
                                <li><a href="#!">Kết quả Ngoại hạng Anh</a></li>
                                <li><a href="#!">Kết quả bóng đá Ý</a></li>
                                <li><a href="#!">Kết quả bóng đá Tây Ban Nha</a></li>
                                <li><a href="#!">Kết quả bóng đá Đức</a></li>
                                <li><a href="#!">Kết quả bóng đá Pháp</a></li>
                                <li><a href="#!">Kết quả Cúp C2</a></li>
                            </ul>
                        </div>

                        <div className="footer-col-group">
                            <h4>Thể thao tổng hợp</h4>
                            <ul>
                                <li><a href="#!">Bóng chuyền</a></li>
                                <li><a href="#!">Quần vợt</a></li>
                                <li><a href="#!">Esports</a></li>
                                <li><a href="#!">Xe cộ</a></li>
                                <li><a href="#!">Võ</a></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <div className="footer-tags-bar">
                <div className="footer-container">
                    <div className="tags-wrapper">
                        <a href="#!" className="tag-btn">Latest</a>
                        <a href="#!" className="tag-btn">Công nghệ</a>
                    </div>
                </div>
            </div>

            <div className="footer-info-section">
                <div className="footer-container">
                    <div className="footer-info-grid">
                        <div className="company-col">
                            <div className="company-logo">
                                <div className="logo-main-text">
                                    THETHAO<span>247</span><small>.VN</small>
                                </div>
                            </div>
                            <div className="company-subtext">Trang mạng xã hội thể thao</div>

                            <div className="info-text">
                                <p><strong>Công ty TNHH MTV GenPress</strong></p>
                                <p>Giấy phép thiết lập Mạng xã hội số 365/GP-BTTTT, Ký ngày 4/12/2024</p>
                                <p><strong>Địa chỉ Hà Nội:</strong> Tầng 04, Tòa nhà Star, Lô D32 KĐT Cầu Giấy, Đường Dương Đình Nghệ, Yên Hòa, Cầu Giấy, Hà Nội.</p>
                                <p><strong>Mã số thuế:</strong> 0110067529</p>
                                <p><strong>Điện thoại:</strong> 0847100247</p>
                                <p><strong>Người chịu trách nhiệm:</strong> Trần Xuân Hùng</p>
                                <p><strong>Email:</strong> contact@thethao247.vn</p>
                            </div>
                        </div>

                        <div className="social-col">
                            <div className="info-title">Social</div>
                            <ul className="social-links">
                                <li><a href="#!">▶ Youtube</a></li>
                                <li><a href="#!">f Facebook</a></li>
                                <li><a href="#!">🐦 Twitter</a></li>
                                <li><a href="#!">📡 RSS</a></li>
                                <li><a href="#!">🎵 Tiktok</a></li>
                            </ul>

                            <div className="cert-badge">
                                <span>👁️ ĐÃ CẤP PHÉP</span>
                            </div>
                        </div>

                        <div className="legal-col">
                            <ul>
                                <li><a href="#!">Thỏa thuận chia sẻ nội dung</a></li>
                                <li><a href="#!">Chính sách bảo mật</a></li>
                                <li><strong>Báo giá quảng cáo:</strong> <a href="#!" style={{ color: "#dc2626" }}>Tại đây</a></li>
                                <li><strong>Liên hệ quảng cáo, truyền thông, hợp tác kinh doanh:</strong> 0985 233 950</li>
                                <li><strong>VPGD:</strong> Tầng 4, số 248 Lương Thế Vinh, Trung Văn, Nam Từ Liêm, Hà Nội.</li>
                                <li>© LANGTUCCAU 2024 . All Rights Reserved.</li>
                            </ul>

                            <div className="dmca-badge">
                                🛡️ DMCA PROTECTED
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="footer-bottom-pattern"></div>
        </footer>
    );
};
export default Footer;

