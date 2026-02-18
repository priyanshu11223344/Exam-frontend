import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "../../api/axios";

// FETCH SUBJECTS BY BOARD
export const fetchSubjects = createAsyncThunk(
  "subjects/fetchSubjects",
  async (boardId, thunkAPI) => {
    try {
      const res = await API.get(`/subjects/board/${boardId}`);
      return res.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data);
    }
  }
);

const subjectSlice = createSlice({
  name: "subjects",
  initialState: {
    subjects: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearSubjects: (state) => {
      state.subjects = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubjects.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSubjects.fulfilled, (state, action) => {
        state.loading = false;
        state.subjects = action.payload;
      })
      .addCase(fetchSubjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearSubjects } = subjectSlice.actions;
export default subjectSlice.reducer;
