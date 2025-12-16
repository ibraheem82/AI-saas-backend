import axios from "axios";
import config from "../../config";

//=======Registration=====
// ** `withCredentials`: true: it will set the cookies inside the user browser. This setting is important when dealing with cookies, authorization headers, or TLS client certificates. Setting it to true tells the browser (or Node.js environment) to include any stored cookies or credential information (like authentication tokens stored in cookies) when making the request to the target URL. This is often necessary for maintaining sessions or authenticated states, especially if your frontend and backend are running on different ports or domains during development or in a specific deployment setup.
export const registerAPI = async (userData) => {
  const response = await axios.post(
    `${config.apiBaseUrl}/api/v1/users/register`,
    {
      email: userData?.email,
      password: userData?.password,
      username: userData?.username,
    },
    {
      withCredentials: true,
    }
  );
  return response?.data;
};
//=======Login=====
export const loginAPI = async (userData) => {
  const response = await axios.post(
    `${config.apiBaseUrl}/api/v1/users/login`,
    {
      email: userData?.email,
      password: userData?.password,
    },
    {
      withCredentials: true,
    }
  );
  return response?.data;
};
//=======Check auth=====




export const checkUserAuthStatusAPI = async () => {
  const response = await axios.get(
    `${config.apiBaseUrl}/api/v1/users/auth/check`,
    {
      withCredentials: true,
    }
  );
  return response?.data;
};
//=======Logout =====


export const logoutAPI = async () => {
  const response = await axios.post(
    `${config.apiBaseUrl}/api/v1/users/logout`,
    {},
    {
      withCredentials: true,
    }
  );
  return response?.data;
};
//=======Get user profile =====

export const getUserProfileAPI = async () => {
  const response = await axios.get(
    `${config.apiBaseUrl}/api/v1/users/profile`,
    // {},
    {
      withCredentials: true,
    }
  );
  return response?.data;
};