import React, { useState } from 'react';
import { loginUser, registerUser } from '../services/authService';
import {
    validateUsername,
    validateEmail,
    validateConfirm,
    getPasswordChecks
} from '../services/authValidation';
import { User } from '../types/types';
import './authModal.css';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAuthSuccess: (user: User) => void;
}

const EMPTY_FORM = { username: '', fullName: '', email: '', password: '', confirm: '' };

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAuthSuccess }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [form, setForm] = useState(EMPTY_FORM);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const { username, fullName, email, password, confirm } = form;
    const setField = (name: keyof typeof EMPTY_FORM) => (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm({ ...form, [name]: e.target.value });

    const checks = getPasswordChecks(password);
    const usernameError = username ? validateUsername(username) : null;
    const emailError = email ? validateEmail(email) : null;
    const confirmError = confirm ? validateConfirm(password, confirm) : null;
    const registerValid =
        !validateUsername(username) &&
        !validateEmail(email) &&
        checks.every((c) => c.ok) &&
        !validateConfirm(password, confirm);

    const close = () => {
        setForm(EMPTY_FORM);
        setError('');
        onClose();
    };

    const switchMode = (login: boolean) => {
        setIsLogin(login);
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isLogin && (!username.trim() || !password)) {
            setError('Vui lòng nhập tên đăng nhập/email và mật khẩu');
            return;
        }
        const res = isLogin
            ? await loginUser(username, password)
            : await registerUser({ username, email, password, fullName });

        if (res.success && res.user) {
            onAuthSuccess(res.user);
            close();
        } else {
            setError(res.message);
        }
    };

    return (
        <div className="auth-overlay" onClick={close}>
            <div className="auth-modal-card" onClick={(e) => e.stopPropagation()}>
                <button type="button" className="auth-close-btn" onClick={close}>×</button>

                <div className="auth-tabs">
                    <button
                        type="button"
                        className={`auth-tab-btn ${isLogin ? 'active' : ''}`}
                        onClick={() => switchMode(true)}
                    >
                        Đăng Nhập
                    </button>
                    <button
                        type="button"
                        className={`auth-tab-btn ${!isLogin ? 'active' : ''}`}
                        onClick={() => switchMode(false)}
                    >
                        Đăng Ký
                    </button>
                </div>

                {error && <div className="auth-error-banner">{error}</div>}

                <form onSubmit={handleSubmit} className="auth-form" noValidate>
                    <div className="auth-input-group">
                        <label>{isLogin ? 'Tên đăng nhập / Email' : 'Tên đăng nhập'}</label>
                        <input
                            type="text"
                            placeholder={isLogin ? 'Nhập username hoặc email' : 'Từ 3 ký tự, không có khoảng trắng'}
                            value={username}
                            onChange={setField('username')}
                        />
                        {!isLogin && usernameError && <span className="auth-field-error">{usernameError}</span>}
                    </div>

                    {!isLogin && (
                        <>
                            <div className="auth-input-group">
                                <label>Họ và tên (không bắt buộc)</label>
                                <input type="text" value={fullName} onChange={setField('fullName')} />
                            </div>
                            <div className="auth-input-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    placeholder="example@gmail.com"
                                    value={email}
                                    onChange={setField('email')}
                                />
                                {emailError && <span className="auth-field-error">{emailError}</span>}
                            </div>
                        </>
                    )}

                    <div className="auth-input-group">
                        <label>Mật khẩu</label>
                        <input
                            type="password"
                            placeholder="Nhập mật khẩu"
                            value={password}
                            onChange={setField('password')}
                        />
                        {!isLogin && (
                            <ul className="auth-checklist">
                                {checks.map((c) => (
                                    <li key={c.label} className={c.ok ? 'ok' : ''}>
                                        {c.ok ? '✓' : '○'} {c.label}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {!isLogin && (
                        <div className="auth-input-group">
                            <label>Nhập lại mật khẩu</label>
                            <input
                                type="password"
                                placeholder="Nhập lại mật khẩu"
                                value={confirm}
                                onChange={setField('confirm')}
                            />
                            {confirmError && <span className="auth-field-error">{confirmError}</span>}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="auth-submit-btn"
                        disabled={!isLogin && !registerValid}
                    >
                        {isLogin ? 'Đăng Nhập' : 'Tạo Tài Khoản Mới'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AuthModal;