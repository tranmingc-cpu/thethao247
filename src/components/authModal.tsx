import React, { useState } from 'react';
import { loginUser, registerUser } from '../services/authService';
import { User } from '../types/types';
import './authModal.css';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAuthSuccess: (user: User) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAuthSuccess }) => {
    const [isLoginMode, setIsLoginMode] = useState<boolean>(true);
    const [username, setUsername] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [fullName, setFullName] = useState<string>('');
    const [errorMessage, setErrorMessage] = useState<string>('');

    if (!isOpen) return null;

    const resetForm = () => {
        setUsername('');
        setEmail('');
        setPassword('');
        setFullName('');
        setErrorMessage('');
    };

    const handleSwitchMode = (mode: boolean) => {
        setIsLoginMode(mode);
        setErrorMessage('');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage('');

        if (isLoginMode) {
            if (!username.trim()) {
                setErrorMessage('Vui lòng nhập tên đăng nhập hoặc email');
                return;
            }
            const res = loginUser(username, password);
            if (res.success && res.user) {
                onAuthSuccess(res.user);
                resetForm();
                onClose();
            } else {
                setErrorMessage(res.message);
            }
        } else {
            if (!username.trim() || !email.trim() || !password.trim()) {
                setErrorMessage('Vui lòng điền đầy đủ các thông tin bắt buộc');
                return;
            }
            const res = registerUser({ username, email, password, fullName });
            if (res.success && res.user) {
                onAuthSuccess(res.user);
                resetForm();
                onClose();
            } else {
                setErrorMessage(res.message);
            }
        }
    };

    return (
        <div className="auth-overlay" onClick={onClose}>
            <div className="auth-modal-card" onClick={e => e.stopPropagation()}>
                <button type="button" className="auth-close-btn" onClick={onClose}>×</button>
                <div className="auth-tabs">
                    <button
                        type="button"
                        className={`auth-tab-btn ${isLoginMode ? 'active' : ''}`}
                        onClick={() => handleSwitchMode(true)}
                    >
                        Đăng Nhập
                    </button>
                    <button
                        type="button"
                        className={`auth-tab-btn ${!isLoginMode ? 'active' : ''}`}
                        onClick={() => handleSwitchMode(false)}
                    >
                        Đăng Ký
                    </button>
                </div>

                {errorMessage && (
                    <div className="auth-error-banner">
                        {errorMessage}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="auth-input-group">
                        <label>{isLoginMode ? 'Tên đăng nhập / Email' : 'Tên đăng nhập'}</label>
                        <input
                            type="text"
                            placeholder={isLoginMode ? 'Nhập username hoặc email' : 'Chọn tên tài khoản'}
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                        />
                    </div>

                    {!isLoginMode && (
                        <>
                            <div className="auth-input-group">
                                <label>Họ và tên</label>
                                <input
                                    type="text"
                                    placeholder="Ví dụ: Nguyễn Văn A"
                                    value={fullName}
                                    onChange={e => setFullName(e.target.value)}
                                />
                            </div>
                            <div className="auth-input-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    placeholder="example@gmail.com"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                />
                            </div>
                        </>
                    )}

                    <div className="auth-input-group">
                        <label>Mật khẩu</label>
                        <input
                            type="password"
                            placeholder="Nhập mật khẩu"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                        />
                    </div>

                    <button type="submit" className="auth-submit-btn">
                        {isLoginMode ? 'Đăng Nhập' : 'Tạo Tài Khoản Mới'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AuthModal;
