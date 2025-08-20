import api from '@/shared/lib/api'
export const signup = (b) => api.post('/auth/signup', b).then(r => r.data)
export const login = async (b) => {
    const data = (await api.post('/auth/login', b)).data
    localStorage.setItem('accessToken', data.accessToken || data.token?.access)
    return data
}
export const me = () => api.get('/users/me').then(r => r.data)
export const logout = () => api.post('/auth/logout').then(r => r.data)
