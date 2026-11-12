const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

const TOKEN_KEY = 'penjadwalan_token';
const USER_KEY = 'penjadwalan_user';

export const tokenStorage = {
    getToken: () => localStorage.getItem(TOKEN_KEY),
    setToken: (token) => localStorage.setItem(TOKEN_KEY, token),
    removeToken: () => localStorage.removeItem(TOKEN_KEY),

    getUser: () => {
        const u = localStorage.getItem(USER_KEY);
        try {
            return u ? JSON.parse(u) : null;
        } catch {
            return null;
        }
    },
    setUser: (user) => localStorage.setItem(USER_KEY, JSON.stringify(user)),
    removeUser: () => localStorage.removeItem(USER_KEY),

    clear: () => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
    }
};

/**
 * Universal API Fetch wrapper yang mematuhi format envelope JSON standar
 */
export async function apiFetch(endpoint, options = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    const token = tokenStorage.getToken();
    if (token && !headers.Authorization) {
        headers.Authorization = `Bearer ${token}`;
    }

    try {
        const response = await fetch(url, {
            ...options,
            headers
        });

        const json = await response.json().catch(() => null);

        if (!response.ok) {
            const errorMessage = json?.message || `Permintaan gagal dengan status ${response.status}`;
            const err = new Error(errorMessage);
            err.status = response.status;
            err.errorCode = json?.error_code;
            err.errors = json?.errors || [];
            throw err;
        }

        return json;
    } catch (error) {
        if (!error.status) {
            error.message = 'Gagal terhubung ke server backend. Pastikan server aktif di port 3000.';
        }
        throw error;
    }
}

export const authApi = {
    async login(email, password) {
        const res = await apiFetch('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email: email.trim(), password })
        });

        if (res.data?.token) {
            tokenStorage.setToken(res.data.token);
            tokenStorage.setUser(res.data.user);
        }

        return res;
    },

    async registerMahasiswa(data) {
        return await apiFetch('/auth/register/mahasiswa', {
            method: 'POST',
            body: JSON.stringify({
                nim: data.nim?.trim(),
                nama: data.nama?.trim(),
                email: data.email?.trim(),
                password: data.password,
                prodi: data.prodi?.trim(),
                tahun_masuk: parseInt(data.tahun || data.tahun_masuk, 10),
                judul: data.judul?.trim()
            })
        });
    },

    async registerDosen(data) {
        return await apiFetch('/auth/register/dosen', {
            method: 'POST',
            body: JSON.stringify({
                nip: data.nip?.trim(),
                nama: data.nama?.trim(),
                email: data.email?.trim(),
                password: data.password,
                kepakaran: data.kepakaran?.trim()
            })
        });
    },

    async getProfile() {
        return await apiFetch('/auth/me', {
            method: 'GET'
        });
    },

    async logout() {
        try {
            await apiFetch('/auth/logout', { method: 'POST' });
        } finally {
            tokenStorage.clear();
        }
    },

    async getAuditLogs(page = 1, per_page = 15) {
        return await apiFetch(`/admin/audit-logs?page=${page}&per_page=${per_page}`, {
            method: 'GET'
        });
    },

    async getDosenList(page = 1, per_page = 15) {
        return await apiFetch(`/dosen?page=${page}&per_page=${per_page}`, {
            method: 'GET'
        });
    },

    async getMahasiswaList(page = 1, per_page = 15) {
        return await apiFetch(`/mahasiswa?page=${page}&per_page=${per_page}`, {
            method: 'GET'
        });
    }
};
