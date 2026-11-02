import axios from "axios";
const RSS_DIRECTORY = "https://thethao247.vn/rss.html";
const PROXY = "https://proxy.cors.dev/";
async function fetchURL(url) {
    const response = await fetch(PROXY + url, {
        method: "GET",
        credentials: "omit"
    });
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${url}`);
    }
    return await response.text();
}
export async function getAllRSSCategories() {
    const html = await fetchURL(RSS_DIRECTORY);
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const links = doc.querySelectorAll("a[href]");
    const categories = [];
    links.forEach(link => {
        const href = link.getAttribute("href");
        if (href && /\.rss(?:[?#]|$)/i.test(href)) {
            categories.push({
                name: link.textContent.trim() || "Tin tức",
                url: new URL(href, RSS_DIRECTORY).href
            });
        }
    });
    return [...new Map(categories.map(item => [item.url, item])).values()];
}
function parseRSS(xmlText, category) {
    const parser = new DOMParser();
    const xml = parser.parseFromString(xmlText, "text/xml");
    if (xml.querySelector("parsererror")) {
        throw new Error("RSS XML không hợp lệ");
    }
    return Array.from(xml.querySelectorAll("item")).map(item => {
        const getText = tag => item.getElementsByTagName(tag)[0]?.textContent || "";
        const enclosure = item.querySelector("enclosure");
        return {
            id: getText("guid") || getText("link"),
            title: getText("title"),
            description: getText("description"),
            link: getText("link"),
            pubDate: getText("pubDate"),
            image: enclosure?.getAttribute("url") || "",
            category: category.name,
            categoryUrl: category.url
        };
    });
}
export async function getAllRSSNews() {const categories = await getAllRSSCategories();
    console.log("Tổng số danh mục RSS:", categories.length);
    console.log("Danh sách danh mục:", categories);
    const allNews = [];
    for (let i = 0; i < categories.length; i += 5) {
        const group = categories.slice(i, i + 5);
        const results = await Promise.allSettled(
            group.map(async category => {
                const xml = await fetchURL(category.url);
                return parseRSS(xml, category);
            })
        );
// lấy full rss có 1289 bài
        results.forEach((result, index) => {
            if (result.status === "fulfilled") {
                allNews.push(...result.value); //allNews.push(...result.value.slice(0, 10)); gioi han bai
            } else {
                console.error(
                    "Lỗi RSS:",
                    group[index].name,
                    result.reason
                );
            }
        });
    }
    const uniqueNews = [...new Map(allNews.map(item => [item.link, item])).values()];
    uniqueNews.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
    return uniqueNews.slice();
}
export async function testRSS() {
    const url = "https://thethao247.vn/bong-da-viet-nam-c1.rss";
    try {
        const text = await fetchURL(url);
        console.log("RSS RESPONSE:", text.substring(0, 1000));
        const parser = new DOMParser();
        const xml = parser.parseFromString(text, "application/xml");
        console.log("PARSER ERROR:", xml.querySelector("parsererror"));
        console.log("RSS ITEMS:", xml.querySelectorAll("item").length);

    } catch (error) {
        console.error("TEST RSS ERROR:", error);
    }
}
