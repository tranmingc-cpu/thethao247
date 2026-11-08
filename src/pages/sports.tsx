import React, { useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "./store";
import { setSelectedSport, setSportsSearch } from "./sportsSlice";
import { SPORTS } from "../config/sports";
import Home from "./home";
import { NewsItem } from "../types";

interface SportsPageProps {
    onArticleClick: (article: NewsItem) => void;
}

const SportsPage: React.FC<SportsPageProps> = ({ onArticleClick }) => {
    const dispatch = useDispatch<AppDispatch>();
    const { items, loading, error, selectedSport, search } = useSelector(
        (s: RootState) => s.sports
    );

    const selectedName = useMemo(() => {
        if (selectedSport === "all") return "Tất cả";
        return SPORTS.find((s) => s.slug === selectedSport)?.name ?? "Tất cả";
    }, [selectedSport]);

    // "Thể thao tổng hợp" trùng nhiều bài với các môn con, nên ở chế độ "Tất cả"
    // ta vẫn hiện hết, còn khi chọn môn thì Home tự lọc theo category = tên môn.
    if (loading && items.length === 0) {
        return <p style={{ padding: 40, textAlign: "center" }}>Đang tải tin thể thao...</p>;
    }
    if (error && items.length === 0) {
        return <p style={{ padding: 40, textAlign: "center" }}>Lỗi: {error}</p>;
    }

    return (
        <div>
            <div style={{ maxWidth: 1240, margin: "16px auto 0", padding: "0 15px", display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button
                    type="button"
                    onClick={() => dispatch(setSelectedSport("all"))}
                    style={chipStyle(selectedSport === "all")}
                >
                    Tất cả
                </button>
                {SPORTS.map((s) => (
                    <button
                        key={s.slug}
                        type="button"
                        onClick={() => dispatch(setSelectedSport(s.slug))}
                        style={chipStyle(selectedSport === s.slug)}
                    >
                        {s.name}
                    </button>
                ))}
            </div>

            <Home
                news={items}
                selectedCategory={selectedName}
                onSelectCategory={() => {}}
                search={search}
                onArticleClick={onArticleClick}
            />
        </div>
    );
};

function chipStyle(active: boolean): React.CSSProperties {
    return {
        padding: "6px 14px",
        borderRadius: 20,
        border: "1.5px solid #c8102e",
        background: active ? "#c8102e" : "#fff",
        color: active ? "#fff" : "#c8102e",
        fontWeight: 700,
        fontSize: 13
    };
}

export default SportsPage;