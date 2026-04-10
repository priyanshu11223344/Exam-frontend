import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "../../api/axios";

// FETCH PAPERS WITH FILTER
export const fetchPapers = createAsyncThunk(
  "papers/fetchPapers",
  async ({ filters, token }, thunkAPI) => {
    try {
      const params = new URLSearchParams();

      // 🔥 Multi-select fields
      if (filters.topicIds?.length)
        params.append("topicIds", filters.topicIds.join(","));

      if (filters.years?.length)
        params.append("years", filters.years.join(","));

      if (filters.seasons?.length)
        params.append("seasons", filters.seasons.join(","));

      // 🔥 Single fields
      if (filters.paperNumber)
        params.append("paperNumber", filters.paperNumber);

      if (filters.variant)
        params.append("variant", filters.variant);

      const res = await API.get(
        `/papers/filter?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`, // ✅ correct
          },
        }
      );

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
    setPapers:(state,action)=>{
      state.papers=action.payload
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPapers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPapers.fulfilled, (state, action) => {
        state.loading = false;
        state.papers = action.payload;
        sessionStorage.setItem("papers",JSON.stringify(action.payload))
      })
      .addCase(fetchPapers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearPapers,setPapers } = paperSlice.actions;
export default paperSlice.reducer;
