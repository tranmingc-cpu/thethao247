import React, { useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchNews, setSelectedCategory, setSearch, setSelectedArticle, RootState, AppDispatch } from "./pages/store";
import Header from "./components/header";
import Footer from "./components/footer";
import Home from "./pages/home";
import Detail from "./pages/detail";
import { NewsItem } from "./types";
import { getSportsNews } from "../services/rssService.js";
import { SPORTS } from "./config/sports";

const App: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { items: news, loading, selectedCategory, search, selectedArticle } = useSelector(
        (state: RootState) => state.news
    );
    useEffect(() => {dispatch(fetchNews());}, [dispatch]);
    useEffect(() => {
        getSportsNews(SPORTS).then((n) => console.log("Tổng:", n.length, n[0]));
    }, []);
    const defaultNav = [
        "Bóng đá Việt Nam",
        "Bóng đá Quốc Tế",
        "Bóng đá Anh",
        "Champions League",
        "Bóng chuyền",
        "Quần vợt",
        "Võ thuật",
        "Esports"
    ];
    const categories = useMemo(() => {
        const setCats = new Set(news.map((item) => item.category).filter(Boolean));
        const dynamicCats = Array.from(setCats);
        return ["Tất cả", ...new Set([...defaultNav, ...dynamicCats])];
    }, [news]);
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
                />) : (
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

