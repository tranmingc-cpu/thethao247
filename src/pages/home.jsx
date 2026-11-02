import { useEffect, useState } from "react";
import { getAllRSSNews } from "../../services/rssService";
function Home() {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        async function loadNews() {
            try {
                const data = await getAllRSSNews();
                setNews(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }
        loadNews();
    }, []);
    if (loading) {
        return <h2>Đang tải toàn bộ tin tức...</h2>;
    }
    return (
        <div>
            <h1>Tất cả tin tức</h1>
            <p>Tổng số bài viết: {news.length}</p>
            {news.map(item => (
                <article key={item.id || item.link}>
                    <h3>{item.title}</h3>
                    <p>{item.category}</p>
                    <p>{item.description}</p>
                    <a href={item.link} target="_blank" rel="noreferrer">
                        Đọc bài viết
                    </a>
                </article>
            ))}
        </div>
    );
}
export default Home;
