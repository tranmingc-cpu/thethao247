import { User } from '../types/types';

const USERS_KEY = 'users';
const CURRENT_USER_KEY = 'currentUser';

export function getUsers(): User[] {
    try {
        const data = localStorage.getItem(USERS_KEY);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
}

export function getCurrentUser(): User | null {
    try {
        const data = localStorage.getItem(CURRENT_USER_KEY);
        return data ? JSON.parse(data) : null;
    } catch {
        return null;
    }
}

export function registerUser(user: { username: string; email: string; password?: string; fullName?: string }): { success: boolean; message: string; user?: User } {
    const users = getUsers();
    const usernameClean = user.username.trim().toLowerCase();
    const emailClean = user.email.trim().toLowerCase();

    if (users.some(u => u.username.toLowerCase() === usernameClean)) {
        return { success: false, message: 'Tên đăng nhập đã tồn tại' };
    }

    if (users.some(u => u.email.toLowerCase() === emailClean)) {
        return { success: false, message: 'Email đã được đăng ký' };
    }

    const newUser: User = {
        id: `user_${Date.now()}`,
        username: user.username.trim(),
        email: user.email.trim(),
        password: user.password || '',
        fullName: user.fullName?.trim() || user.username.trim(),
        createdAt: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));

    const { password, ...safeUser } = newUser;
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(safeUser));

    return { success: true, message: 'Đăng ký thành công', user: safeUser };
}

export function loginUser(usernameOrEmail: string, password?: string): { success: boolean; message: string; user?: User } {
    const users = getUsers();
    const query = usernameOrEmail.trim().toLowerCase();

    const targetUser = users.find(u =>
        u.username.toLowerCase() === query || u.email.toLowerCase() === query
    );

    if (!targetUser) {
        return { success: false, message: 'Tài khoản không tồn tại' };
    }

    if (password && targetUser.password && targetUser.password !== password) {
        return { success: false, message: 'Mật khẩu không chính xác' };
    }

    const { password: _, ...safeUser } = targetUser;
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(safeUser));

    return { success: true, message: 'Đăng nhập thành công', user: safeUser };
}

export function logoutUser(): void {
    localStorage.removeItem(CURRENT_USER_KEY);
}
