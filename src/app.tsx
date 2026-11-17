import React, { useEffect, useMemo, useState } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
    setSelectedCategory,
    setSearch,
    setSelectedArticle,
    fetchNews,
    RootState,
    AppDispatch
} from "./pages/store";
import Header from "./components/header";
import Footer from "./components/footer";
import Home from "./pages/home";
import Football from "./pages/football/football";
import Detail from "./pages/detail";
import Sports from "./pages/sports/sports";
import Events from "./pages/events/events";
import { NewsItem } from "./types/types";
import { FootBall } from "./config/football";
import { getLiveCategoriesFromHomeRSS } from "./services/rssServices";

const AppContent: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { items: news, loading, selectedCategory, search, selectedArticle } = useSelector(
        (state: RootState) => state.news
    );
    const [dynamicCats, setDynamicCats] = useState<string[]>([]);

    useEffect(() => {
        dispatch(fetchNews(FootBall));
        getLiveCategoriesFromHomeRSS().then((cats) => {
            if (cats && cats.length > 0) {
                setDynamicCats(cats);
            }
        });
    }, [dispatch]);

    const categories = useMemo(() => {
        const list = dynamicCats.length > 0 ? dynamicCats : FootBall.map((cat) => cat.name);
        const filtered = list.filter((cat) => cat !== "Trang chủ / Tổng hợp");
        return ["Tất cả", ...filtered];
    }, [dynamicCats]);

    const handleSelectCategory = (category: string) => {
        dispatch(setSelectedCategory(category));
        dispatch(setSelectedArticle(null));
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleSearchChange = (value: string) => {
        dispatch(setSearch(value));
    };

    const handleArticleClick = (article: NewsItem) => {
        dispatch(setSelectedArticle(article));
        navigate("/chi-tiet");
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleBackHome = () => {
        dispatch(setSelectedArticle(null));
        navigate(-1);
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

            <Routes>
                <Route
                    path="/"
                    element={
                        <Home
                            search={search}
                            onArticleClick={handleArticleClick}
                        />
                    }
                />
                <Route
                    path="/bong-da"
                    element={
                        <Football
                            news={news}
                            selectedCategory={selectedCategory}
                            onSelectCategory={handleSelectCategory}
                            search={search}
                            onArticleClick={handleArticleClick}
                        />
                    }
                />
                <Route
                    path="/the-thao"
                    element={
                        <Sports
                            search={search}
                            onArticleClick={handleArticleClick}
                        />
                    }
                />
                <Route
                    path="/su-kien"
                    element={
                        <Events
                            search={search}
                            onArticleClick={handleArticleClick}
                        />
                    }
                />
                <Route
                    path="/chi-tiet"
                    element={
                        <Detail
                            article={selectedArticle}
                            onBack={handleBackHome}
                            onSelectArticle={handleArticleClick}
                            allNews={news}
                        />
                    }
                />
            </Routes>

            <Footer />
        </div>
    );
};

const App: React.FC = () => {
    return (
        <BrowserRouter>
            <AppContent />
        </BrowserRouter>
    );
};

export default App;