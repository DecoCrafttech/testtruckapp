import axios from "axios";
import Toast from "react-native-toast-message";

const refreshToken = async () => {
  return "new_access_token";
};
const axiosInstance = axios.create({
  baseURL: "https://truck.truckmessage.com",
  headers: {
    'Content-Type': 'application/json',
  }  
});

axiosInstance.interceptors.response.use(
  (response) => {       
    if (response.data.error_code === 0) {
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: response.data.message
      });
    } else {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: response.data.message
      });
    }    
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      refreshToken()
    }
    return Promise.reject(error);
  }
);


export default axiosInstance;