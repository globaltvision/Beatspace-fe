import axios from "axios";
export const baseURL = "https://global-network-backend.up.railway.app/api";
// export const baseURL = "http://localhost:8000/api";

// withCredentials is required globally — the backend uses better-auth (cookie/session based).
// The Bearer token in Authorization header is declared in protectRoute but never read;
// the session cookie is what actually authenticates requests.
const custAxios = axios.create({
  baseURL: baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

const formAxios = axios.create({
  baseURL: baseURL,
  withCredentials: true,
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
  (error) => Promise.reject(error)
);

formAxios.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);


// Routes that can return 401 without meaning the session has expired.
// A 401 on these must NOT wipe the token or dispatch authChange.
const SILENT_401_PATTERNS = [/\/notfs/];

const handle401 = (error) => {
  if (error.response?.status === 401) {
    const url = error.config?.url || '';
    const isSilent = SILENT_401_PATTERNS.some((p) => p.test(url));
    if (!isSilent) {
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      window.dispatchEvent(new Event('authChange'));
    }
  }
  return Promise.reject(error);
};

custAxios.interceptors.response.use((response) => response, handle401);
formAxios.interceptors.response.use((response) => response, handle401);


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
