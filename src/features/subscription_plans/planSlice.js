import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "../../api/axios";

// 🔥 API call
export const fetchPlans = createAsyncThunk(
  "plans/fetchPlans",
  async (_, thunkAPI) => {
    try {
      const res = await API.get("/plans");

      // ✅ Axios returns data directly
      return res.data.plans;

    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.error || err.message
      );
    }
  }
);

const planSlice = createSlice({
  name: "plans",
  initialState: {
    plans: [],
    loading: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPlans.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPlans.fulfilled, (state, action) => {
        state.loading = false;
        state.plans = action.payload;
      })
      .addCase(fetchPlans.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export default planSlice.reducer;