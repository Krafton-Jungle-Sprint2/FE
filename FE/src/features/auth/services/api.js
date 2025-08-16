import axios from 'axios'
import router from '@/router'

const api = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true, // refresh token 쿠키 받으려면 필요
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        const refreshRes = await axios.post('http://localhost:3000/auth/refresh', {}, { withCredentials: true })
        const newToken = refreshRes.data.accessToken
        localStorage.setItem('accessToken', newToken)

        error.config.headers.Authorization = `Bearer ${newToken}`
        return api.request(error.config)
      } catch (e) {
        localStorage.removeItem('accessToken')
        router.push('/login')
      }
    }
    return Promise.reject(error)
  }
)

export default api
