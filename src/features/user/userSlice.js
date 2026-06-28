import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "../../api/axios";

export const fetchUser = createAsyncThunk(
  "user/fetchUser",
  async ({ getToken, clerkUser }, thunkAPI) => {
    try {
      const token = await getToken();

      const res = await API.get("/user/me", {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Local-Clerk-Id": clerkUser?.id || "",
          "X-Local-User-Email":
            clerkUser?.primaryEmailAddress?.emailAddress || "",
          "X-Local-User-Name":
            clerkUser?.fullName || clerkUser?.firstName || "Student",
          "X-Local-User-Role": clerkUser?.publicMetadata?.role || "user",
        },
      });

      return res.data.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.error || err.message
      );
    }
  }
);
export const updateUser = createAsyncThunk(
  "user/updateUser",
  async ({ getToken, clerkUser, formData }, thunkAPI) => {
    try {
      const token = await getToken();

      const res = await API.put(
        "/user/update",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-Local-Clerk-Id": clerkUser?.id || "",
            "X-Local-User-Email":
              clerkUser?.primaryEmailAddress?.emailAddress || "",
            "X-Local-User-Name":
              clerkUser?.fullName || clerkUser?.firstName || "Student",
            "X-Local-User-Role": clerkUser?.publicMetadata?.role || "user",
          },
        }
      );

      return res.data.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.error || err.message
      );
    }
  }
);
const userSlice = createSlice({
  name: "user",
  initialState: {
    user: null,
    role: "user",              // ✅ ADD THIS
    planName: "Free",
    features: ["topical"],
    loading: false,
    error: null,
  },
  reducers: {
    setAdminAccess: (state, action) => {
      state.user = {
        ...(state.user || {}),
        ...(action.payload || {}),
      };
      state.role = "admin";
      state.planName = "Admin";
      state.features = ["topical", "mcq", "pdf", "years_access"];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.pending, (state) => {
        state.loading = true;
        state.error=null;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      
        state.role = action.payload?.role || "user";   // ✅ ADD THIS
      
        state.planName = action.payload?.planName || "Free";
        state.features = action.payload?.features || ["topical"];
      })
      .addCase(fetchUser.rejected, (state,action) => {
        state.loading = false;
        state.error=action.payload
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.user = action.payload;
      });
  }
});

export const { setAdminAccess } = userSlice.actions;
export default userSlice.reducer;
