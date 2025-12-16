import axios from "axios";
import config from "../../config";

//=======Generate Content=====

export const generateContentAPI = async (userPrompt) => {
  const response = await axios.post(
    `${config.apiBaseUrl}/api/v1/google/generate-content`,
    {
      prompt: userPrompt,
    },
    {
      withCredentials: true,
    }
  );
  return response?.data;
};