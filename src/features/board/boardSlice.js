import { createSlice,createAsyncThunk } from "@reduxjs/toolkit";
import API from "../../api/axios";
export const fetchBoards=createAsyncThunk(
    "boards/fetchBoards",
    async(_,thunkAPI)=>{
        try {
            const res=await API.get("/boards/");
        return res.data.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data);
        }
    }
);
const boardSlice=createSlice({
    name:"boards",
    initialState:{
        boards:[],
        loading:false,
        error:null,
    },
    reducers:{},
    extraReducers:(builder)=>{
        builder
        .addCase(fetchBoards.pending,(state)=>{
            state.loading=true;
        })
        .addCase(fetchBoards.fulfilled,(state,action)=>{
            state.loading=false;
            state.boards=action.payload;
        })
        .addCase(fetchBoards.rejected,(state,action)=>{
            state.loading=false;
            state.error=action.payload;
        });
    },
});
export default boardSlice.reducer;