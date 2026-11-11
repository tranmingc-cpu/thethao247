import { Article, RssCategory, NewsItem } from '../types/types';
import { ALL_CATEGORIES } from '../config/categories';

function getFeedProxyUrl(rssUrl: string): string {
    if (typeof window !== 'undefined') {
        const urlObj = new URL(rssUrl);
        return `/api-rss${urlObj.pathname}`;
    }
    return rssUrl;
}

function parseXmlText(xmlText: string): Document {
    const parser = new DOMParser();
    return parser.parseFromString(xmlText, 'text/xml');
}

function getNodeText(parent: Element, tagName: string): string {
    const node = parent.getElementsByTagName(tagName)[0];
    return node ? node.textContent?.trim() || '' : '';
}

function extractThumbnail(itemNode: Element, description: string): string {
    const enclosure = itemNode.getElementsByTagName('enclosure')[0];
    if (enclosure && enclosure.getAttribute('url')) {
        return enclosure.getAttribute('url') || '';
    }

    const contentEncoded = itemNode.getElementsByTagName('content:encoded')[0]?.textContent || '';
    const htmlToSearch = `${description} ${contentEncoded}`;
    const match = htmlToSearch.match(/<img[^>]+src=["']([^"']+)["']/i);
    return match ? match[1] : '';
}

export async function fetchArticlesFromCategory(
    category: Pick<RssCategory, 'slug' | 'name' | 'rss'>
): Promise<Article[]> {
    const targetUrl = getFeedProxyUrl(category.rss);
    try {
        const res = await fetch(targetUrl);
        if (!res.ok) {
            return [];
        }

        const xmlText = await res.text();
        const xmlDoc = parseXmlText(xmlText);
        const items = Array.from(xmlDoc.querySelectorAll('item'));

        if (items.length === 0) return [];

        return items.map((item, index) => {
            const title = getNodeText(item, 'title') || 'Không có tiêu đề';
            const link = getNodeText(item, 'link');
            const guid = getNodeText(item, 'guid') || link || `${category.slug}-${index}-${Date.now()}`;
            const rawDesc = getNodeText(item, 'description');
            const cleanDesc = rawDesc.replace(/<[^>]*>?/gm, '').trim();
            const pubDateStr = getNodeText(item, 'pubDate');
            const pubDate = pubDateStr ? new Date(pubDateStr).toISOString() : new Date().toISOString();
            const thumbnail = extractThumbnail(item, rawDesc);
            const slug = link ? link.split('/').filter(Boolean).pop() || '' : '';

            return {
                id: guid,
                title,
                slug,
                description: cleanDesc,
                link,
                pubDate,
                thumbnail,
                categorySlug: category.slug,
                categoryName: category.name
            };
        });
    } catch {
        return [];
    }
}

function detectFootballCategory(article: NewsItem): string {
    const text = `${article.title} ${article.description} ${article.link}`.toLowerCase();

    if (
        text.includes('-c1-') ||
        text.includes('v-league') ||
        text.includes('đt việt nam') ||
        text.includes('việt nam') ||
        text.includes('u23 việt nam') ||
        text.includes('u19 việt nam') ||
        text.includes('vff') ||
        text.includes('hà nội fc') ||
        text.includes('hoàng anh gia lai') ||
        text.includes('cahn')
    ) {
        return 'Bóng đá Việt Nam';
    }

    if (
        text.includes('ngoại hạng anh') ||
        text.includes('premier league') ||
        text.includes('epl') ||
        text.includes('man utd') ||
        text.includes('mu ') ||
        text.includes('chelsea') ||
        text.includes('arsenal') ||
        text.includes('liverpool') ||
        text.includes('man city') ||
        text.includes('tottenham') ||
        text.includes('newcastle') ||
        text.includes('erik ten hag') ||
        text.includes('amorim') ||
        text.includes('carrick')
    ) {
        return 'Ngoại hạng Anh';
    }

    if (
        text.includes('la liga') ||
        text.includes('real madrid') ||
        text.includes('barcelona') ||
        text.includes('barca') ||
        text.includes('atletico') ||
        text.includes('laliga')
    ) {
        return 'La Liga';
    }

    if (
        text.includes('cup c1') ||
        text.includes('cúp c1') ||
        text.includes('champions league') ||
        text.includes('uefa champions league')
    ) {
        return 'Cúp C1 (Champions League)';
    }

    if (
        text.includes('chuyển nhượng') ||
        text.includes('chiêu mộ') ||
        text.includes('hợp đồng') ||
        text.includes('gia hạn') ||
        text.includes('tin-chuyen-nhuong')
    ) {
        return 'Chuyển nhượng';
    }

    return 'Bóng đá quốc tế';
}

export async function getAllRSSNews(
    categories: Pick<RssCategory, 'slug' | 'name' | 'rss'>[] = ALL_CATEGORIES
): Promise<NewsItem[]> {
    try {
        const results = await Promise.all(
            categories.map(category => fetchArticlesFromCategory(category))
        );
        const articles = results.flat();
        const news: NewsItem[] = articles.map(item => {
            const initialCategory = item.categoryName;
            const newsItem: NewsItem = {
                id: item.id,
                title: item.title,
                image: item.thumbnail || '',
                description: item.description,
                link: item.link,
                category: initialCategory,
                pubDate: item.pubDate
            };

            if (initialCategory === 'Trang chủ / Tổng hợp' || initialCategory === 'Bóng đá quốc tế') {
                const detected = detectFootballCategory(newsItem);
                if (detected) {
                    newsItem.category = detected;
                }
            }

            return newsItem;
        });

        const uniqueNews = Array.from(new Map(news.map(item => [item.link || item.id, item])).values());

        uniqueNews.sort(
            (a, b) =>
                new Date(b.pubDate || 0).getTime() -
                new Date(a.pubDate || 0).getTime()
        );

        return uniqueNews;
    } catch {
        return [];
    }
}

export async function getLiveCategoriesFromHomeRSS(): Promise<string[]> {
    try {
        const homeArticles = await fetchArticlesFromCategory({
            slug: 'trang-chu',
            name: 'Trang chủ / Tổng hợp',
            rss: 'https://thethao247.vn/trang-chu.rss'
        });

        const catSet = new Set<string>();
        homeArticles.forEach(item => {
            const tempItem: NewsItem = {
                id: item.id,
                title: item.title,
                image: item.thumbnail || '',
                description: item.description,
                link: item.link,
                category: item.categoryName,
                pubDate: item.pubDate
            };
            const cat = detectFootballCategory(tempItem);
            if (cat) catSet.add(cat);
        });

        const dynamicCategories = Array.from(catSet);
        if (dynamicCategories.length > 0) {
            return dynamicCategories;
        }
    } catch {}
    } 
    return [
        'Bóng đá Việt Nam',
        'Bóng đá quốc tế',
        'Ngoại hạng Anh',
        'La Liga',
        'Cúp C1 (Champions League)',
        'Chuyển nhượng'
    ];
}

