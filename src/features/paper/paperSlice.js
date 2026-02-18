import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "../../api/axios";

// FETCH PAPERS WITH FILTER
export const fetchPapers = createAsyncThunk(
  "papers/fetchPapers",
  async (filters, thunkAPI) => {
    try {
      const res = await API.get("/papers/filter", {
        params: filters,
      });
      return res.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data);
    }
  }
);

const paperSlice = createSlice({
  name: "papers",
  initialState: {
    papers: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearPapers: (state) => {
      state.papers = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPapers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPapers.fulfilled, (state, action) => {
        state.loading = false;
        state.papers = action.payload;
      })
      .addCase(fetchPapers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearPapers } = paperSlice.actions;
export default paperSlice.reducer;
