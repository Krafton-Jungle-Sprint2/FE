// src/shared/lib/api.js
import axios from 'axios'

const BASE =
  import.meta.env.MODE === 'development'
    ? '/api'                                // dev: Vite 프록시
    : (import.meta.env.VITE_API_URL || '/api').replace(/\/+$/,'') // prod: .env 값

const api = axios.create({
  baseURL: BASE,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
  timeout: 15000,
})

const getAccess  = () => localStorage.getItem('accessToken')
const getRefresh = () => localStorage.getItem('refreshToken')

// 요청 인터셉터
api.interceptors.request.use(cfg => {
  // 로그인/회원가입은 Authorization 제거(있어도 굳이 보내지 않음)
  if (/\/auth\/(login|signup)/.test(cfg.url || '')) {
    if (cfg.headers) delete cfg.headers.Authorization
    return cfg
  }
  const t = getAccess()
  if (t) cfg.headers = { ...(cfg.headers||{}), Authorization: `Bearer ${t}` }
  return cfg
})

let refreshing
// 응답 인터셉터
api.interceptors.response.use(
  r => r,
  async err => {
    const { config, response } = err
    const status = response?.status

    // 이미 재시도했거나 401이 아니면 그대로 종료
    if (!config || config.__retry || status !== 401) return Promise.reject(err)

    // 리프레시 자체 or 로그인/가입 요청이면 재시도하지 않음
    if (/\/auth\/(refresh|login|signup)/.test(config.url || '')) {
      return Promise.reject(err)
    }

    try {
      const refreshToken = getRefresh()
      if (!refreshToken) throw new Error('no refresh token')

      // BE는 body { refreshToken } 기대 → 프록시/직접호출 모두 대응
      refreshing ??= axios.post(
        `${BASE}/auth/refresh`,
        { refreshToken },
        { withCredentials: true, headers: { 'Content-Type': 'application/json' } }
      ).finally(() => { refreshing = null })

      const { data } = await refreshing
      const newAccess =
        data?.accessToken || data?.access || data?.token
      if (!newAccess) throw new Error('no access token in refresh response')

      localStorage.setItem('accessToken', newAccess)
      if (data?.refreshToken) localStorage.setItem('refreshToken', data.refreshToken)

      // 원 요청 1회 재시도
      config.__retry = true
      config.headers = { ...(config.headers||{}), Authorization: `Bearer ${newAccess}` }
      return api(config)
    } catch {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      return Promise.reject(err)
    }
  }
)

export default api
