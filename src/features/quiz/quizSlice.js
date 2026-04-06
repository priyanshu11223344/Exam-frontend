import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "../../api/axios";

export const fetchQuizzes = createAsyncThunk(
  "quiz/fetchQuizzes",
  async (filters, { getState, rejectWithValue }) => {
    try {
      const state = getState();

      const boards = state.boards.boards;
      const subjects = state.subjects.subjects;

      // 🔥 FIND NAME FROM ID
      const boardObj = boards.find(b => b._id === filters.boardId);
      const subjectObj = subjects.find(s => s._id === filters.subjectId);

      // ❌ STOP if anything missing
      if (
        !boardObj ||
        !subjectObj ||
        !filters.paperNumber ||
        !filters.variant ||
        filters.years.length === 0 ||
        filters.seasons.length === 0
      ) {
        console.log("❌ Missing required filters");
        return [];
      }

      // ✅ CONVERT TO BACKEND FORMAT
      const params = {
        board: boardObj.name,              // 🔥 NAME
        subject: subjectObj.name,          // 🔥 NAME
        year: filters.years[0],
        season: filters.seasons[0],
        paperName: filters.paperNumber[0],
        variant: filters.variant[0],
      };

      console.log("🔥 FINAL PARAMS:", params);

      const res = await API.get("/quiz", { params });

      return res.data.questions;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || "Error fetching quizzes"
      );
    }
  }
);

const quizSlice = createSlice({
  name: "quiz",
  initialState: {
    quizzes: [],
    loading: false,
    error: null,
  },
  reducers: {
    setQuizData:(state,action)=>{
      state.quizzes=action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchQuizzes.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchQuizzes.fulfilled, (state, action) => {
        state.loading = false;
        state.quizzes = action.payload;
        sessionStorage.setItem("quizData",JSON.stringify(action.payload))
      })
      .addCase(fetchQuizzes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});
export const{setQuizData}=quizSlice.actions;
export default quizSlice.reducer;