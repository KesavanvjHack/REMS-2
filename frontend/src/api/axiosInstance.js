import axios from "axios";

const axiosInstance = axios.create({
    baseURL: "http://127.0.0.1:8000/api/",
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
});

/* =========================
   REQUEST INTERCEPTOR
   Attach TokenP
========================= */
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

/* =========================
   RESPONSE INTERCEPTOR
   Handle Errors
========================= */
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        // Network error (server down / no internet)
        if (!error.response) {
            alert("Network error. Please check your internet connection.");
            return Promise.reject(error);
        }

        const { status } = error.response;

        // Unauthorized → logout user
        if (status === 401) {
            localStorage.removeItem("token");
            alert("Session expired. Please login again.");
            window.location.href = "/login";
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
