import { api, setToken, getToken } from './api.js';
import { toast } from './utils.js';

export const auth = {
    async login(email, password) {
        const res = await api.request('auth/login.php', 'POST', { email, password });
        if (res.token) {
            setToken(res.token);
            // Optionally persist to sessionStorage for tab persistence strictly temporarily
            sessionStorage.setItem('nexus_token', res.token);
        }
        return res;
    },
    async register(data) {
        return await api.request('auth/register.php', 'POST', data);
    },
    logout() {
        setToken(null);
        sessionStorage.removeItem('nexus_token');
        window.location.href = 'index.html';
    },
    isLoggedIn() {
        const memToken = getToken() || sessionStorage.getItem('nexus_token');
        if (memToken && !getToken()) {
            setToken(memToken);
        }
        return !!memToken;
    },
    requireAuth() {
        if (!this.isLoggedIn()) {
            window.location.href = 'auth.html?redirect=' + encodeURIComponent(window.location.pathname);
        }
    }
};

// Initialize token from session storage if exists (page refresh)
const existingToken = sessionStorage.getItem('nexus_token');
if (existingToken) setToken(existingToken);
