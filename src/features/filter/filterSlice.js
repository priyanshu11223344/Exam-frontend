import { createSlice } from "@reduxjs/toolkit";

const filterSlice = createSlice({
  name: "filters",
  initialState: {
    boardId: "",
    subjectId: "",
    topicId: "",
    year: "",
    season: "",
    paperNumber: "",
    variant: "",
  },
  reducers: {
    setFilter: (state, action) => {
      const { name, value } = action.payload;
      state[name] = value;
    },
    resetAfterBoard: (state, action) => {
      state.boardId = action.payload;
      state.subjectId = "";
      state.topicId = "";
    },
    resetAfterSubject: (state, action) => {
      state.subjectId = action.payload;
      state.topicId = "";
    },
  },
});

export const { setFilter, resetAfterBoard, resetAfterSubject } =
  filterSlice.actions;

export default filterSlice.reducer;
