import axios from "axios";
// export const baseURL = "http://localhost:8000/api";
// export const baseURL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
export const baseURL = "https://beatspace-be-production-2.up.railway.app//api";

const custAxios = axios.create({
  baseURL: baseURL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

const formAxios = axios.create({
  baseURL: baseURL,
  headers: {
    "Content-Type": "multipart/form-data",
    Accept: "application/json",
  },
});


custAxios.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


formAxios.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


custAxios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Clear session storage on unauthorized
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      // Dispatch auth change event to notify app
      window.dispatchEvent(new Event('authChange'));
    }
    return Promise.reject(error);
  }
);


formAxios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Clear session storage on unauthorized
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      // Dispatch auth change event to notify app
      window.dispatchEvent(new Event('authChange'));
    }
    return Promise.reject(error);
  }
);


export const attachToken = () => {
  const token = sessionStorage.getItem('token');
  if (token) {
    custAxios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete custAxios.defaults.headers.common["Authorization"];
  }
};

export const attachTokenWithFormAxios = () => {
  const token = sessionStorage.getItem('token');
  if (token) {
    formAxios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete formAxios.defaults.headers.common["Authorization"];
  }
};

const publicAxios = axios.create({
  baseURL: baseURL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export { formAxios, publicAxios };

export default custAxios;
