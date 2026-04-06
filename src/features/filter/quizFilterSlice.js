import { createSlice } from "@reduxjs/toolkit";

const loadQuizFilters=()=>{
    try {
        const saved=sessionStorage.getItem("quizFilters");
        return saved?JSON.parse(saved):{
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
const quizFilterSlice=createSlice({
  name:"quizFilters",
  initialState:loadQuizFilters(),
  reducers:{
    setQuizFilter:(state,action)=>{
        const {name,value}=action.payload;
        state[name]=value;
        sessionStorage.setItem("quizFilters",JSON.stringify(state));
    },
    resetQuizAfterBoard: (state, action) => {
        state.boardId = action.payload;
        state.subjectId = "";
        state.topicIds = [];
        state.years = [];
        state.seasons = [];
        state.paperNumber = "";
        state.variant = "";
  
        sessionStorage.setItem("quizFilters", JSON.stringify(state));
      },
  
      resetQuizAfterSubject: (state, action) => {
        state.subjectId = action.payload;
        state.topicIds = [];
        state.years = [];
        state.seasons = [];
        state.paperNumber = "";
        state.variant = "";
  
        sessionStorage.setItem("quizFilters", JSON.stringify(state));
      },
  }  
});
export const {setQuizFilter,resetQuizAfterBoard,resetQuizAfterSubject}=quizFilterSlice.actions;
export default quizFilterSlice.reducer;