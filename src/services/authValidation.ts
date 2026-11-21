export interface PasswordCheck {
    label: string;
    ok: boolean;
}

export const validateUsername = (username: string): string | null => {
    const value = username.trim();
    if (value.length < 3) return 'Tên đăng nhập phải từ 3 ký tự trở lên';
    if (/\s/.test(value)) return 'Tên đăng nhập không được có khoảng trắng';
    return null;
};

export const validateEmail = (email: string): string | null =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ? null : 'Email không đúng định dạng';

export const getPasswordChecks = (password: string): PasswordCheck[] => [
    { label: 'Từ 6 ký tự trở lên', ok: password.length >= 6 },
    { label: 'Có chữ cái', ok: /\p{L}/u.test(password) },
    { label: 'Có chữ số', ok: /\d/.test(password) }
];

export const validatePassword = (password: string): string | null => {
    const failed = getPasswordChecks(password).find((c) => !c.ok);
    return failed ? `Mật khẩu cần: ${failed.label.toLowerCase()}` : null;
};

export const validateConfirm = (password: string, confirm: string): string | null =>
    password === confirm ? null : 'Mật khẩu nhập lại không khớp';