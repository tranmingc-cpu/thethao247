export interface NewsItem {
    id: string;
    title: string;
    image: string;
    description: string;
    link: string;
    category: string;
    pubDate: string | null;
}
export interface RssCategory {
    slug: string;
    name: string;
    rss: string;
    group: 'football' | 'sports' | 'tech-events';
    description?: string;
}

export interface Article {
    id: string;
    title: string;
    slug: string;
    description: string;
    link: string;
    pubDate: string;
    thumbnail?: string;
    categorySlug: string;
}

export interface ArticleFilterParams {
    categorySlug?: string;
    searchQuery?: string;
    sortBy?: "latest" | "oldest";
    limit?: number;
    page?: number;
}
