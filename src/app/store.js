import { configureStore } from "@reduxjs/toolkit";
import boardReducer from "../features/board/boardSlice";
import subjectReducer from "../features/subject/subjectSlice";
import topicReducer from "../features/topic/topicSlice";
import paperReducer from "../features/paper/paperSlice";
import filterReducer from "../features/filter/filterSlice"
export const store = configureStore({
  reducer: {
    boards: boardReducer,
    subjects: subjectReducer,
    topics: topicReducer,
    papers: paperReducer,
    filters:filterReducer,
  },
});
