
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


// Nang kich thuoc mot so dang URL thumbnail RSS neu server co cung cap anh lon hon.
function getHighResImage(url) {
    if (!url) return "";
    return url
        .replace(/\/resize_\d+x\d+\//g, "/resize_600x400/")
        .replace(/\/thumb_w\/\d+/g, "/thumb_w/800")
        .replace(/-120x80/g, "-800x500")
        .replace(/-300x200/g, "-800x500");
}

export async function getAllRSSCategories() {
    const html = await fetchURL(RSS_DIRECTORY);
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const links = doc.querySelectorAll("a[href]");
    const categories = [];

    links.forEach(link => {
        const href = link.getAttribute("href");
        if (!href || !/\.rss(?:[?#]|$)/i.test(href)) return;

        const parent = link.closest("li") || link.parentElement;
        const categoryLink = parent
            ? Array.from(parent.querySelectorAll("a[href]")).find(anchor => !/\.rss(?:[?#]|$)/i.test(anchor.getAttribute("href") || ""))
            : null;
        const parentText = categoryLink?.textContent || parent?.textContent || "";
        const name = parentText.replace(/\bRSS\b/gi, "").replace(/[|–—-]/g, " ").replace(/\s+/g, " ").trim()
            || link.textContent.trim()
            || "Tin tức";
        const url = new URL(href, RSS_DIRECTORY).href;
        const lowerName = name.toLocaleLowerCase("vi-VN");
        const lowerUrl = url.toLocaleLowerCase("vi-VN");

        let slug = "";
        if (lowerUrl.includes("/xe-c191.rss") || lowerName === "xe") slug = "xe";
        if (lowerUrl.includes("sea-games") || lowerName.includes("sea games") || lowerName.includes("seagames")) slug = "sea-games";

        categories.push({ name, url, slug });
    });

    // Các RSS con của SEA Games 33.
    const extraCategories = [
        { name: "SEA Games 33", url: "https://thethao247.vn/sea-games-33-c88.rss", slug: "sea-games" },
        { name: "Bóng đá SEA Games", url: "https://thethao247.vn/bong-da-sea-games-c129.rss", slug: "sea-games" },
        { name: "Tin bên lề SEA Games", url: "https://thethao247.vn/tin-ben-le-c131.rss", slug: "sea-games" },
        { name: "Môn khác SEA Games", url: "https://thethao247.vn/cac-mon-khac-c132.rss", slug: "sea-games" },
    ];

    extraCategories.forEach(extra => {
        const existing = categories.find(item => item.url === extra.url);
        if (existing) {
            existing.name = extra.name;
            existing.slug = extra.slug;
        } else {
            categories.push(extra);
        }
    });

    return [...new Map(categories.map(item => [item.url, item])).values()];
}

function extractItems(text) {
    const parser = new DOMParser();
    const wrap = (s) =>
        `<?xml version="1.0" encoding="utf-8"?>` +
        `<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" ` +
        `xmlns:content="http://purl.org/rss/1.0/modules/content/" ` +
        `xmlns:dc="http://purl.org/dc/elements/1.1/" ` +
        `xmlns:media="http://search.yahoo.com/mrss/"><channel>${s}</channel></rss>`;

    const rawItems = text.match(/<item>[\s\S]*?<\/item>/g) || [];
    const good = [];
    let skipped = 0;

    rawItems.forEach((raw) => {
        const ok = (s) => !parser.parseFromString(wrap(s), "text/xml").querySelector("parsererror");
        if (ok(raw)) {
            good.push(raw);
            return;
        }
        // thử đóng CDATA bị thiếu rồi parse lại
        const fixed = raw.replace("</description>", "]]></description>");
        if (ok(fixed)) {
            good.push(fixed);
        } else {
            skipped++;
        }
    });

    console.warn(`extractItems: giữ ${good.length}, bỏ ${skipped} bài lỗi`);
    return wrap(good.join(""));
}

function parseRSS(xmlText, category) {
    const parser = new DOMParser();
    let xml = parser.parseFromString(xmlText, "text/xml");
    if (xml.querySelector("parsererror")) {
        console.warn("RSS lỗi, thử vá:", category.name);
        xml = parser.parseFromString(extractItems(xmlText), "text/xml");
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
        image = getHighResImage(image);
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
            sourceUrl: category.url || "",
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


    const uniqueMap = new Map();
    allNews.forEach((item) => {
        const key = item.link || item.id;
        const existing = uniqueMap.get(key);
        if (!existing || (!existing.slug && item.slug)) {
            uniqueMap.set(key, item);
        }
    });
    const uniqueNews = [...uniqueMap.values()];
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
