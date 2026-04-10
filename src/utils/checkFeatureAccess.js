import axios from "axios";
import { toast } from "react-hot-toast";
import API from "../api/axios";
export const checkFeatureAccess = async (feature) => {
  try {
    await API.get(`/feature/${feature}`);
    return true;
  } catch (err) {
    toast.error(err.response?.data?.message || "Upgrade required");
    return false;
  }
};