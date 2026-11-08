import React, {useEffect, useMemo, useState} from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchNews, setSelectedCategory, setSearch, setSelectedArticle, RootState, AppDispatch } from "./pages/store";
import Header from "./components/header";
import Footer from "./components/footer";
import Home from "./pages/home";
import Detail from "./pages/detail";
import { NewsItem } from "./types";
import { SPORTS } from "./config/sports";
import {fetchSports} from "./pages/sportsSlice.ts";
import SportsPage from "./pages/sports";

const App: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { items: news, loading, selectedCategory, search, selectedArticle } = useSelector(
        (state: RootState) => state.news
    );
    const [view, setView] = useState<"news" | "sports">("news");
    const sportsItems = useSelector((state: RootState) => state.sports.items);

    useEffect(() => { dispatch(fetchSports()); }, [dispatch]);
    const sports = useSelector((s: RootState) => s.sports);
    useEffect(() => { dispatch(fetchSports()); }, [dispatch]);
    useEffect(() => {
        console.log("[SPORTS]", { loading: sports.loading, count: sports.items.length, error: sports.error });
    }, [sports.loading, sports.items.length, sports.error]);
    useEffect(() => {dispatch(fetchNews());}, [dispatch]);
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
            <div style={{ maxWidth: 1240, margin: "10px auto 0", padding: "0 15px", display: "flex", gap: 8 }}>
                <button type="button" onClick={() => { setView("news"); dispatch(setSelectedArticle(null)); }}>
                    Tin chung
                </button>
                <button type="button" onClick={() => { setView("sports"); dispatch(setSelectedArticle(null)); }}>
                    Thể thao
                </button>
            </div>
            {selectedArticle ? (
                <Detail
                    article={selectedArticle}
                    onBack={handleBackHome}
                    onSelectArticle={handleArticleClick}
                    allNews={view === "sports" ? sportsItems : news}
                />
            ) : view === "sports" ? (
                <SportsPage onArticleClick={handleArticleClick} />
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

