import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { uploadManualQuestions } from "./questionAPI";

// UPLOAD QUESTIONS
export const uploadQuestions = createAsyncThunk(
  "questions/uploadQuestions",
  async (questionsData, thunkAPI) => {
    try {
      return await uploadManualQuestions(questionsData);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || error.message
      );
    }
  }
);

const questionSlice = createSlice({
  name: "questions",

  initialState: {
    loading: false,
    success: false,
    error: null,
  },

  reducers: {},

  extraReducers: (builder) => {
    builder

      // PENDING
      .addCase(uploadQuestions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      // SUCCESS
      .addCase(uploadQuestions.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })

      // FAILED
      .addCase(uploadQuestions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default questionSlice.reducer;