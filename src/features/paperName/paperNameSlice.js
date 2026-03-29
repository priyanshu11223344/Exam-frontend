import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "../../api/axios";
// 🔥 THUNK: Fetch Paper Names by Subject
export const fetchPaperNames = createAsyncThunk(
  "paperName/fetchPaperNames",
  async (subjectId, { rejectWithValue }) => {
    try {
      const res = await fetch(
        `/paperName/${subjectId}`
      );
 
      const data = await res.json();

      if (!res.ok) {
        return rejectWithValue(data);
      }

      return data.data; // ✅ only return papers
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 🔥 SLICE
const paperNameSlice = createSlice({
  name: "paperName",
  initialState: {
    paperNames: [],
    loading: false,
    error: null,
  },
  reducers: {},

  extraReducers: (builder) => {
    builder
      // ✅ Pending
      .addCase(fetchPaperNames.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      // ✅ Success
      .addCase(fetchPaperNames.fulfilled, (state, action) => {
        state.loading = false;
        state.paperNames = action.payload;
      })

      // ❌ Error
      .addCase(fetchPaperNames.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default paperNameSlice.reducer;