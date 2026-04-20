// Base API Request wrapper
import { toast } from './utils.js';

let memToken = null;

export const setToken = (token) => {
    memToken = token;
};

export const getToken = () => memToken;

export const api = {
    async request(endpoint, method = 'GET', data = null) {
        const url = `php/api/${endpoint}`;
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (memToken) {
            options.headers['Authorization'] = `Bearer ${memToken}`;
        }
        
        // Setup CSRF header reading from cookie or meta tag
        // Simple fallback to localStorage if needed for CSRF, but we will use the backend check.
        // Actually CSRF token should be an endpoint we fetch once on load.

        if (data && method !== 'GET') {
            options.body = JSON.stringify(data);
        }

        try {
            const res = await fetch(url, options);
            const contentType = res.headers.get("content-type");
            let result = {};
            if (contentType && contentType.indexOf("application/json") !== -1) {
                result = await res.json();
            }

            if (!res.ok) {
                if (res.status === 401 && endpoint !== 'auth/login.php') {
                    // Try to refresh token or redirect
                    window.location.href = 'auth.html?redirect=' + encodeURIComponent(window.location.pathname);
                }
                throw new Error(result.error || `HTTP error ${res.status}`);
            }

            return result;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }
};
