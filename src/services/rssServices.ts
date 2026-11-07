import Parser from 'rss-parser';
import { Article, RssCategory } from '../types/types.ts';

const parser = new Parser();
const CORS_PROXY = 'https://api.allorigins.win/raw?url=';

export async function fetchArticlesFromCategory(category: RssCategory): Promise<Article[]> {
    try {
        const response = await parser.parseURL(`${CORS_PROXY}${encodeURIComponent(category.rss)}`);
        return (response.items || []).map((item, index) => ({
            id: item.guid || item.link || `${category.slug}-${index}`,
            title: item.title?.trim() || 'Không có tiêu đề',
            slug: item.link ? item.link.split('/').pop() || '' : '',
            description: (item.contentSnippet || item.summary || '').replace(/<[^>]*>?/gm, '').trim(),
            link: item.link || '',
            pubDate: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
            thumbnail: item.enclosure?.url || extractImgSrc(item.content || ''),
            categorySlug: category.slug,
            categoryName: category.name
        }));
    } catch (error) {
        console.error(`Lỗi tải RSS danh mục ${category.name}:`, error);
        return [];
    }
}
export function filterAndSearchArticles(
    articles: Article[],
    categorySlug?: string,
    searchQuery?: string,
    sortBy: 'latest' | 'oldest' = 'latest'
): Article[] {
    let result = [...articles];
    if (categorySlug && categorySlug !== 'trang-chu') {
        result = result.filter(item => item.categorySlug === categorySlug);
    }
    if (searchQuery && searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase().trim();
        result = result.filter(
            item => item.title.toLowerCase().includes(query) || item.description.toLowerCase().includes(query)
        );
    }

    result.sort((a, b) => {
        const timeA = new Date(a.pubDate).getTime();
        const timeB = new Date(b.pubDate).getTime();
        return sortBy === 'latest' ? timeB - timeA : timeA - timeB;
    });

    return result;
}

function extractImgSrc(html: string): string | undefined {
    const match = html.match(/<img[^>]+src=["']([^"']+)["']/);
    return match ? match[1] : undefined;
}