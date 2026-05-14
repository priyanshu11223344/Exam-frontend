import API from "../../api/axios";
//          EXCEL UPLOAD FROM ADMIN.JSX????????/////////////////////////////////////////////////////////////IMP/////////////////////////////
// MANUAL BULK QUESTION UPLOAD
export const uploadManualQuestions = async (
  questionsData
) => {

  try {

    const res = await API.post(
      "/admin/upload-questions-form",
      {
        questions: questionsData,
      }
    );

    return res.data;

  } catch (error) {

    console.log(
      "error",
      error.response?.data || error.message
    );

    throw error;
  }
};