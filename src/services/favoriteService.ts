import { NewsItem } from '../types/types';

const FAVORITES_PREFIX = 'favorites_';

function getFavoritesKey(userId?: string): string {
    return userId ? `${FAVORITES_PREFIX}${userId}` : `${FAVORITES_PREFIX}guest`;
}

export function getFavorites(userId?: string): NewsItem[] {
    try {
        const data = localStorage.getItem(getFavoritesKey(userId));
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
}

export function isFavorite(articleId: string, userId?: string): boolean {
    const list = getFavorites(userId);
    return list.some(item => item.id === articleId || item.link === articleId);
}

export function toggleFavorite(article: NewsItem, userId?: string): boolean {
    const key = getFavoritesKey(userId);
    const list = getFavorites(userId);
    const index = list.findIndex(item => item.id === article.id || item.link === article.link);

    let nextList: NewsItem[];
    let added = false;

    if (index >= 0) {
        nextList = list.filter((_, i) => i !== index);
        added = false;
    } else {
        nextList = [article, ...list];
        added = true;
    }

    try {
        localStorage.setItem(key, JSON.stringify(nextList));
    } catch {

    }

    window.dispatchEvent(new Event('favorites_changed'));
    return added;
}

export function removeFavorite(articleId: string, userId?: string): void {
    const key = getFavoritesKey(userId);
    const list = getFavorites(userId);
    const nextList = list.filter(item => item.id !== articleId && item.link !== articleId);
    try {
        localStorage.setItem(key, JSON.stringify(nextList));
    } catch {

    }
    window.dispatchEvent(new Event('favorites_changed'));
}
