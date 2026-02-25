import { createSlice } from "@reduxjs/toolkit";

const filterSlice = createSlice({
  name: "filters",
  initialState: {
    boardId: "",
    subjectId: "",
    topicIds: [],
    years: [],
    seasons: [],
    paperNumber: "",
    variant: "",
  },
  reducers: {
    setFilter: (state, action) => {
      const { name, value } = action.payload;
      state[name] = value;
    },

    // 🔥 Reset everything after board change
    resetAfterBoard: (state, action) => {
      state.boardId = action.payload;
      state.subjectId = "";
      state.topicIds = [];
      state.years = [];
      state.seasons = [];
      state.paperNumber = "";
      state.variant = "";
    },

    // 🔥 Reset topic + deeper filters after subject change
    resetAfterSubject: (state, action) => {
      state.subjectId = action.payload;
      state.topicIds = [];
      state.years = [];
      state.seasons = [];
      state.paperNumber = "";
      state.variant = "";
    },
  },
});

export const { setFilter, resetAfterBoard, resetAfterSubject } =
  filterSlice.actions;

export default filterSlice.reducer;