// Nexus Utility Module

export const debounce = (fn, ms) => {
    let timer;
    return function(...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), ms);
    };
};

export const throttle = (fn, ms) => {
    let lastTime = 0;
    return function(...args) {
        const now = Date.now();
        if (now - lastTime >= ms) {
            fn.apply(this, args);
            lastTime = now;
        }
    };
};

export const timeAgo = (dateString) => {
    const date = new Date(dateString);
    const seconds = Math.floor((new Date() - date) / 1000);
    let interval = seconds / 31536000;

    if (interval > 1) return Math.floor(interval) + "y ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m ago";
    return Math.floor(seconds) + "s ago";
};

export const escapeHTML = (str) => {
    return str.replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
};

export const toast = (message, type = 'info') => {
    const existingContainer = document.getElementById('toast-container');
    const container = existingContainer || (() => {
        const c = document.createElement('div');
        c.id = 'toast-container';
        c.style.cssText = 'position: fixed; bottom: 24px; right: 24px; z-index: 10000; display: flex; flex-direction: column; gap: 8px;';
        document.body.appendChild(c);
        return c;
    })();

    const t = document.createElement('div');
    t.className = `toast toast-${type}`;
    t.style.cssText = `
        background: var(--bg-elevated);
        border-left: 3px solid ${type === 'danger' ? 'var(--danger)' : type === 'success' ? 'var(--success)' : 'var(--accent)'};
        color: var(--text-primary);
        padding: 12px 20px;
        font-family: var(--font-body);
        font-size: 14px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.5);
        opacity: 0;
        transform: translateY(20px);
        transition: all var(--transition-med);
    `;
    t.textContent = message;
    container.appendChild(t);

    requestAnimationFrame(() => {
        t.style.opacity = '1';
        t.style.transform = 'translateY(0)';
        setTimeout(() => {
            t.style.opacity = '0';
            t.style.transform = 'translateY(20px)';
            setTimeout(() => t.remove(), 200);
        }, 4000);
    });
};
