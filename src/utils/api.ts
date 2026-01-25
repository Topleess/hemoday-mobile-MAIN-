import axios from 'axios';

// Default to localhost for dev. In prod, this should be configurable.
// User can replace with their computer's IP if testing on real device.
const API_URL = 'https://api.hemoday.online/api/v1';

const api = axios.create({
    baseURL: API_URL,
    timeout: 10000, // 10 seconds timeout
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle 401
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // Optimally, redirect to login or emit event
            // window.location.href = '/login'; // Or handle in React
        }
        return Promise.reject(error);
    }
);

export default api;
