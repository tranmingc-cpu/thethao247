import { User } from '../types/types';
import { validateUsername, validateEmail, validatePassword } from './authValidation';

const USERS_KEY = 'users';
const CURRENT_USER_KEY = 'currentUser';

type AuthResult = { success: boolean; message: string; user?: User };

async function hashPassword(password: string, salt: string): Promise<string> {
    const data = new TextEncoder().encode(salt + password);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
}

function readStorage<T>(key: string, fallback: T): T {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : fallback;
    } catch {
        return fallback;
    }
}

function startSession(user: User): AuthResult {
    const { passwordHash, salt, ...safeUser } = user;
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(safeUser));
    return { success: true, message: 'Thành công', user: safeUser };
}

export const getCurrentUser = (): User | null => readStorage<User | null>(CURRENT_USER_KEY, null);

export function logoutUser(): void {
    localStorage.removeItem(CURRENT_USER_KEY);
}

export async function registerUser(input: {
    username: string;
    email: string;
    password: string;
    fullName?: string;
}): Promise<AuthResult> {
    const error =
        validateUsername(input.username) ??
        validateEmail(input.email) ??
        validatePassword(input.password);
    if (error) return { success: false, message: error };

    const users = readStorage<User[]>(USERS_KEY, []);
    const username = input.username.trim();
    const email = input.email.trim();

    if (users.some((u) => u.username.toLowerCase() === username.toLowerCase())) {
        return { success: false, message: 'Tên đăng nhập đã tồn tại' };
    }
    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
        return { success: false, message: 'Email đã được đăng ký' };
    }

    const salt = crypto.randomUUID();
    const newUser: User = {
        id: `user_${Date.now()}`,
        username,
        email,
        fullName: input.fullName?.trim() || username,
        createdAt: new Date().toISOString(),
        salt,
        passwordHash: await hashPassword(input.password, salt)
    };

    localStorage.setItem(USERS_KEY, JSON.stringify([...users, newUser]));
    return startSession(newUser);
}

export async function loginUser(usernameOrEmail: string, password: string): Promise<AuthResult> {
    const query = usernameOrEmail.trim().toLowerCase();
    const user = readStorage<User[]>(USERS_KEY, []).find(
        (u) => u.username.toLowerCase() === query || u.email.toLowerCase() === query
    );
    if (!user) return { success: false, message: 'Tài khoản không tồn tại' };

    const hash = await hashPassword(password, user.salt ?? '');
    if (hash !== user.passwordHash) return { success: false, message: 'Mật khẩu không chính xác' };

    return startSession(user);
}