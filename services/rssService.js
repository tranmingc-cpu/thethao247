
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
function repairRSS(text) {
    const end = text.lastIndexOf("</item>");
    if (end === -1) return text;
    return text.slice(0, end + "</item>".length) + "</channel></rss>";
}

function parseRSS(xmlText, category) {
    const parser = new DOMParser();
    let xml = parser.parseFromString(xmlText, "text/xml");
    if (xml.querySelector("parsererror")) {
        console.warn("RSS lỗi, thử vá:", category.name);
        xml = parser.parseFromString(repairRSS(xmlText), "text/xml");
        if (xml.querySelector("parsererror")) {
            throw new Error("RSS XML không hợp lệ");
        }
    }
    const items = Array.from(xml.querySelectorAll("item"));
    const newsList = items.map(item => {
        function getText(tag) {
            return item.getElementsByTagName(tag)[0]?.textContent?.trim() || "";
        }
        const title = getText("title");
        const link = getText("link");
        let description = getText("description") || getText("content:encoded");
        const descriptionDoc = parser.parseFromString(description, "text/html");
        const imageInDescription = descriptionDoc.querySelector("img")?.getAttribute("src") || "";
        const cleanDescription = descriptionDoc.body.textContent.replace(/\s+/g, " ").trim();
        let image = "";
        const enclosure = item.getElementsByTagName("enclosure")[0];
        const media = item.getElementsByTagName("media:content")[0];
        const thumbnail = item.getElementsByTagName("media:thumbnail")[0];
        if (enclosure) {
            image = enclosure.getAttribute("url") || "";
        }
        if (!image && media) {
            image = media.getAttribute("url") || "";
        }
        if (!image && thumbnail) {
            image = thumbnail.getAttribute("url") || "";
        }
        if (!image) {
            image = imageInDescription;
        }
        const pubDate = getText("pubDate");
        const timestamp = Date.parse(pubDate);
        return {
            id: getText("guid") || link,
            title: title,
            link: link,
            description: cleanDescription,
            image: image,
            category: category.name,
            slug: category.slug || "",
            pubDate: Number.isNaN(timestamp) ? null : new Date(timestamp).toISOString()
        };
    });
    return newsList;
}
export async function getAllRSSNews() {
    console.log("Bắt đầu lấy dữ liệu RSS...");
    const categories = await getAllRSSCategories();
    console.log("Tổng số danh mục:", categories.length);
    if (categories.length === 0) {
        throw new Error("Không tìm thấy danh mục RSS nào");
    }
    const allNews = [];
    for (let i = 0; i < categories.length; i += 5) {
        const group = categories.slice(i, i + 5);
        const results = await Promise.allSettled(
            group.map(async category => {
                const xml = await fetchURL(category.url);
                return parseRSS(xml, category);
            })
        );
        results.forEach((result, index) => {
            if (result.status === "fulfilled") {
                allNews.push(...result.value);
                console.log("Đã lấy:", group[index].name, result.value.length, "bài");
            } else {
                console.error("Lỗi RSS:", group[index].name, result.reason);
            }
        });
        console.log("Tổng bài đã lấy tạm thời:", allNews.length);
    }
    const uniqueNews = [...new Map(allNews.map(item => [item.link || item.id, item])).values()];
    uniqueNews.sort((a, b) => new Date(b.pubDate || 0) - new Date(a.pubDate || 0));
    console.log("Tổng số bài viết sau chuẩn hóa:", uniqueNews.length);
    console.log("Bài viết đầu tiên:", uniqueNews[0]);
    console.table(uniqueNews.slice(0, 10));
    return uniqueNews;
}

export async function testRSS() {
    const url = "https://thethao247.vn/bong-da-viet-nam-c1.rss";
    try {
        const text = await fetchURL(url);
        const parser = new DOMParser();
        const xml = parser.parseFromString(text, "text/xml");
        console.log("RSS RESPONSE:", text.substring(0, 1000));
        console.log("PARSER ERROR:", xml.querySelector("parsererror"));
        console.log("RSS ITEMS:", xml.querySelectorAll("item").length);
    } catch (error) {
        console.error("TEST RSS ERROR:", error);
    }
}

export async function getSportsNews(sports) {
    const results = await Promise.allSettled(
        sports.map(async (s) => parseRSS(await fetchURL(s.rss), { name: s.name, slug: s.slug }))
    );
    results.forEach((r, i) => {
        if (r.status === "fulfilled") console.log(sports[i].name, r.value.length, "bài");
        else console.error("Lỗi:", sports[i].name, r.reason);
    });
    const all = results.flatMap((r) => (r.status === "fulfilled" ? r.value : []));
    const unique = [...new Map(all.map((i) => [i.link || i.id, i])).values()];
    return unique.sort((a, b) => new Date(b.pubDate || 0) - new Date(a.pubDate || 0));
}

export async function debugFeed(url) {
    const text = await fetchURL(url);
    console.log("Độ dài:", text.length);
    console.log("500 ký tự đầu:", text.substring(0, 500));
    const xml = new DOMParser().parseFromString(text, "text/xml");
    console.log("parsererror:", xml.querySelector("parsererror")?.textContent);
}
