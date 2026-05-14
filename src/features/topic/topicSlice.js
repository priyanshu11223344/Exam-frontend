import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "../../api/axios";

// FETCH TOPICS BY SUBJECT
export const fetchTopics = createAsyncThunk(
  "topics/fetchTopics",
  async (subjectId, thunkAPI) => {
    try {
      const res = await API.get(`/topics/subject/${subjectId}`);
      return res.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data);
    }
  }
);
export const createTopic=createAsyncThunk(
  "topics/createTopics",
  async(topicData,thunkAPI)=>{
    try {
      const res=await API.post("/topics/",topicData);
      return res.data.data;
    } catch (error) {
       return thunkAPI.rejectWithValue(error.response?.data);
    }
  }
)
const topicSlice = createSlice({
  name: "topics",
  initialState: {
    topics: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearTopics: (state) => {
      state.topics = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTopics.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTopics.fulfilled, (state, action) => {
        state.loading = false;
        state.topics = action.payload;
      })
      .addCase(fetchTopics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createTopic.pending, (state) => {
        state.loading = true;
      })
      
      .addCase(createTopic.fulfilled, (state, action) => {
        state.loading = false;
      
        // ✅ instantly update topics
        state.topics.push(action.payload);
      })
      
      .addCase(createTopic.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
  },
});

export const { clearTopics } = topicSlice.actions;
export default topicSlice.reducer;
