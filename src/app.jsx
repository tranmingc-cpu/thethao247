import React, { useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchNews, setSelectedCategory, setSearch, setSelectedArticle } from "./pages/store.js";
import Header from "./components/header.jsx";
import Footer from "./components/footer.jsx";
import Home from "./pages/home.jsx";
import Detail from "./pages/detail.jsx";

function App() {
    const dispatch = useDispatch();
    const { items: news, loading, selectedCategory, search, selectedArticle } = useSelector(
        (state) => state.news
    );

    useEffect(() => {
        dispatch(fetchNews());
    }, [dispatch]);

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

    const handleSelectCategory = (category) => {
        dispatch(setSelectedCategory(category));
        dispatch(setSelectedArticle(null));
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleSearchChange = (val) => {
        dispatch(setSearch(val));
    };

    const handleArticleClick = (article) => {
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
}

export default App;
