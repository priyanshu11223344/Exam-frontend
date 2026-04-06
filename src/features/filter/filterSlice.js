import { createSlice } from "@reduxjs/toolkit";

// ✅ ADD THIS (for loading filters)
const loadFilters = () => {
  try {
    const saved = sessionStorage.getItem("filters");
    return saved
      ? JSON.parse(saved)
      : {
          boardId: "",
          subjectId: "",
          topicIds: [],
          years: [],
          seasons: [],
          paperNumber: "",
          variant: "",
        };
  } catch (error) {
    return {
      boardId: "",
      subjectId: "",
      topicIds: [],
      years: [],
      seasons: [],
      paperNumber: "",
      variant: "",
    };
  }
};

const filterSlice = createSlice({
  name: "filters",

  // ✅ ONLY CHANGE HERE
  initialState: loadFilters(),

  reducers: {
    setFilter: (state, action) => {
      const { name, value } = action.payload;
      state[name] = value;
      sessionStorage.setItem("filters", JSON.stringify(state));
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
      sessionStorage.setItem("filters", JSON.stringify(state));
    },

    // 🔥 Reset topic + deeper filters after subject change
    resetAfterSubject: (state, action) => {
      state.subjectId = action.payload;
      state.topicIds = [];
      state.years = [];
      state.seasons = [];
      state.paperNumber = "";
      state.variant = "";
      sessionStorage.setItem("filters", JSON.stringify(state));
    },
  },
});

export const { setFilter, resetAfterBoard, resetAfterSubject } =
  filterSlice.actions;

export default filterSlice.reducer;