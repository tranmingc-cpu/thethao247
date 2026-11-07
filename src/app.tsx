import React, { useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchNews, setSelectedCategory, setSearch, setSelectedArticle, RootState, AppDispatch } from "./pages/store";
import Header from "./components/header";
import Footer from "./components/footer";
import Home from "./pages/home";
import Detail from "./pages/detail";
import { NewsItem } from "./types/types.ts";
import { getArticlesByCategories } from "./services/rssService";
import { FootBall } from "./config/football";

const App: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { items: news, loading, selectedCategory, search, selectedArticle } = useSelector(
        (state: RootState) => state.news
    );

    // 1. Tải danh sách bài viết khi component mount
    useEffect(() => {
        dispatch(fetchNews());
    }, [dispatch]);

    // Log kiểm tra dữ liệu tin tức đã map từ RSS
    useEffect(() => {
        getArticlesByCategories(FootBall).then((articles) => {
            console.log("Tổng số bài viết đã tải từ RSS:", articles.length);
            if (articles.length > 0) {
                console.log("Mẫu bài viết đầu tiên:", articles[0]);
            }
        });
    }, []);

    // 2. Lấy danh sách danh mục để hiển thị lên thanh điều hướng Header
    const categories = useMemo(() => {
        const catNames = FootBall.map((cat) => cat.name);
        return ["Tất cả", ...catNames];
    }, []);

    const handleSelectCategory = (category: string) => {
        dispatch(setSelectedCategory(category));
        dispatch(setSelectedArticle(null));
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleSearchChange = (val: string) => {
        dispatch(setSearch(val));
    };

    const handleArticleClick = (article: NewsItem) => {
        dispatch(setSelectedArticle(article));
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleBackHome = () => {
        dispatch(setSelectedArticle(null));
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    if (loading && news.length === 0) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Đang tải tin tức Thể Thao 247...</p>
            </div>
        );
    }

    return (
        <div className="thethao247-app">
            <Header
                selectedCategory={selectedCategory}
                onSelectCategory={handleSelectCategory}
                search={search}
                onSearchChange={handleSearchChange}
                categories={categories}
            />
            {selectedArticle ? (
                <Detail
                    article={selectedArticle}
                    onBack={handleBackHome}
                    onSelectArticle={handleArticleClick}
                    allNews={news}
                />
            ) : (
                <Home
                    news={news}
                    selectedCategory={selectedCategory}
                    onSelectCategory={handleSelectCategory}
                    search={search}
                    onArticleClick={handleArticleClick}
                />
            )}
            <Footer />
        </div>
    );
};

export default App;