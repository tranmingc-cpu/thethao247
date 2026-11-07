import { configureStore, createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { getAllRSSNews } from "../services/rssService";
import { NewsItem } from "../types/types.ts";

export interface NewsState {
    items: NewsItem[];
    selectedArticle: NewsItem | null;
    loading: boolean;
    error: string | null;
    selectedCategory: string;
    search: string;
}

const initialState: NewsState = {
    items: [],
    selectedArticle: null,
    loading: false,
    error: null,
    selectedCategory: "Tất cả",
    search: ""
};

export const fetchNews = createAsyncThunk<NewsItem[]>("news/fetchNews", async () => {
    return await getAllRSSNews();
});

const newsSlice = createSlice({
    name: "news",
    initialState,
    reducers: {
        setSelectedCategory: (state, action: PayloadAction<string>) => {
            state.selectedCategory = action.payload;
        },
        setSearch: (state, action: PayloadAction<string>) => {
            state.search = action.payload;
        },
        setSelectedArticle: (state, action: PayloadAction<NewsItem | null>) => {
            state.selectedArticle = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchNews.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchNews.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(fetchNews.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || "Lỗi tải tin tức";
            });
    }
});

export const { setSelectedCategory, setSearch, setSelectedArticle } = newsSlice.actions;

export const store = configureStore({
    reducer: {
        news: newsSlice.reducer
    }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

