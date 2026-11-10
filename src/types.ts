export interface NewsItem {
    id: string;
    title: string;
    image: string;
    description: string;
    link: string;
    category: string;
    slug?: string;
    sourceUrl?: string;
    pubDate: string | null;
}

