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

function getItemNodes(xmlText: string): Element[] {
    const parser = new DOMParser();
    const wrap = (s: string) =>
        `<?xml version="1.0" encoding="utf-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:media="http://search.yahoo.com/mrss/"><channel>${s}</channel></rss>`;
    const hasError = (s: string) =>
        !!parser.parseFromString(wrap(s), 'text/xml').querySelector('parsererror');

    const whole = parser.parseFromString(xmlText, 'text/xml');
    if (!whole.querySelector('parsererror')) return Array.from(whole.querySelectorAll('item'));

    const good: string[] = [];
    (xmlText.match(/<item>[\s\S]*?<\/item>/g) || []).forEach((raw) => {
        if (!hasError(raw)) { good.push(raw); return; }
        const fixed = raw.replace('</description>', ']]></description>');
        if (!hasError(fixed)) good.push(fixed);
    });
    console.warn(`RSS lỗi, giữ ${good.length} bài hợp lệ`);
    return Array.from(parser.parseFromString(wrap(good.join('')), 'text/xml').querySelectorAll('item'));
}

async function fetchFeedText(rssUrl: string): Promise<string> {
    const tryFetch = async (url: string) => {
        const res = await fetch(url);
        const text = await res.text();
        const isXml = text.trimStart().startsWith('<?xml') || text.includes('<rss');
        return res.ok && isXml ? text : null;
    };

    const direct = await tryFetch(getFeedProxyUrl(rssUrl));
    if (direct) return direct;

    console.warn('Proxy Vite bị chặn, thử proxy dự phòng:', rssUrl);
    const backup = await tryFetch('https://proxy.cors.dev/' + rssUrl);
    return backup ?? '';
}

export async function fetchArticlesFromCategory(
    category: Pick<RssCategory, 'slug' | 'name' | 'rss'>
): Promise<Article[]> {
    try {
        const xmlText = await fetchFeedText(category.rss);
        if (!xmlText) return [];
        const items = getItemNodes(xmlText);

        if (items.length === 0) return [];

        return items.map((item, index) => {
            const title = getNodeText(item, 'title') || 'Không có tiêu đề';
            const link = getNodeText(item, 'link');
            const guid = getNodeText(item, 'guid') || link || `${category.slug}-${index}-${Date.now()}`;
            const rawDesc = getNodeText(item, 'description');
            const cleanDesc = rawDesc.replace(/<[^>]*>?/gm, '').trim();
            const pubDateStr = getNodeText(item, 'pubDate');
            const t = Date.parse(pubDateStr);
            const pubDate = Number.isNaN(t) ? new Date(0).toISOString() : new Date(t).toISOString();
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
    } catch (e) {
        console.warn('RSS exception:', category.name, e);
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

    return [
        'Bóng đá Việt Nam',
        'Bóng đá quốc tế',
        'Ngoại hạng Anh',
        'La Liga',
        'Cúp C1 (Champions League)',
        'Chuyển nhượng'
    ];
}

