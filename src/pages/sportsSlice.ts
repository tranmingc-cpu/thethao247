import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { getSportsNews } from "../services/rssServices";
import { SPORTS } from "../config/sports";
import { NewsItem } from "../types/types.ts";

export interface SportsState {
    items: NewsItem[];
    loading: boolean;
    error: string | null;
    selectedSport: string;
    search: string;
}

const initialState: SportsState = {
    items: [],
    loading: false,
    error: null,
    selectedSport: "all",
    search: ""
};

export const fetchSports = createAsyncThunk<NewsItem[]>("sports/fetchSports", async () => {
    return await getSportsNews(SPORTS);
});

const sportsSlice = createSlice({
    name: "sports",
    initialState,
    reducers: {
        setSelectedSport: (state, action: PayloadAction<string>) => {
            state.selectedSport = action.payload;
        },
        setSportsSearch: (state, action: PayloadAction<string>) => {
            state.search = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchSports.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchSports.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(fetchSports.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || "Lỗi tải tin thể thao";
            });
    }
});

export const { setSelectedSport, setSportsSearch } = sportsSlice.actions;
export default sportsSlice.reducer;