import { configureStore } from "@reduxjs/toolkit";
import boardReducer from "../features/board/boardSlice";
import subjectReducer from "../features/subject/subjectSlice";
import topicReducer from "../features/topic/topicSlice";
import paperReducer from "../features/paper/paperSlice";
import filterReducer from "../features/filter/filterSlice";
import paperNameReducer from "../features/paperName/paperNameSlice";
import quizReducer from "../features/quiz/quizSlice";
import quizFilterSlice from "../features/filter/quizFilterSlice";
export const store = configureStore({
  reducer: {
    boards: boardReducer,
    subjects: subjectReducer,
    topics: topicReducer,
    papers: paperReducer,
    filters:filterReducer,
    paperName: paperNameReducer,
    quizzes:quizReducer,
    quizFilters:quizFilterSlice,
  },
});
