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
   Handle Errors and Retries
========================= */
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const { config, response } = error;
        
        // Retry logic for specific errors
        if (!config || !config.retry) {
            config.retry = 0;
        }

        const MAX_RETRIES = 2;
        if (config.retry < MAX_RETRIES && (error.code === 'ECONNABORTED' || (response && response.status >= 500))) {
            config.retry += 1;
            console.warn(`Retrying request (${config.retry}/${MAX_RETRIES}): ${config.url}`);
            
            // Wait with exponential backoff
            const delay = Math.pow(2, config.retry) * 1000;
            await new Promise(resolve => setTimeout(resolve, delay));
            return axiosInstance(config);
        }

        // Network error (server down / no internet)
        if (!response) {
            console.error("Network Error:", error.message);
            return Promise.reject({
                message: "Server is unreachable. Please check your connection.",
                originalError: error
            });
        }

        const { status } = response;
        const errorData = response.data || {};

        // Extract consistent error message
        const message = errorData.error || errorData.detail || errorData.message || "An unexpected error occurred.";

        // Unauthorized → logout user (but ignore for login endpoint)
        if (status === 401 && !config.url.includes("auth/login")) {
            localStorage.removeItem("token");
            window.location.href = "/login?expired=true";
        }

        // Maintain compatibility with existing code while adding standardized field
        error.message = message;
        error.status = status;
        return Promise.reject(error);
    }
);

export default axiosInstance;
