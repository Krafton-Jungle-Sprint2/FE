// src/shared/lib/api.js
import axios from 'axios'

const api = axios.create({ baseURL: '/api', withCredentials: true }) // ✅ 유지


// req: access 토큰
api.interceptors.request.use(cfg => {
    const t = localStorage.getItem('accessToken')
    if (t) cfg.headers.Authorization = `Bearer ${t}`
    return cfg
})

let refreshing = null
api.interceptors.response.use(
    r => r,
    async err => {
        const { config, response } = err
        const status = response?.status

        // 1) refresh 호출 자체거나, 이미 재시도했으면 패스
        if (config?.url?.includes('/auth/refresh') || config?.__retry || status !== 401) {
            return Promise.reject(err)
        }

        try {
            // 2) 단일 refresh Promise 공유
            refreshing ??= axios.post('/api/auth/refresh', {}, { withCredentials: true })
                .finally(() => { refreshing = null })

            const { data } = await refreshing
            if (data?.access) localStorage.setItem('accessToken', data.access)

            // 3) 원 요청 1회 재시도
            config.__retry = true
            config.headers = config.headers || {}
            config.headers.Authorization = `Bearer ${localStorage.getItem('accessToken')}`
            return api(config)
        } catch (e) {
            localStorage.removeItem('accessToken')
            return Promise.reject(err) // 로그인 페이지로 보내는 로직이 있으면 여기에서 트리거
        }
    }
)

export default api
