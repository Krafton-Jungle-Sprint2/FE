import api from '@/shared/lib/api'
export const create = (user_id) => api.post('/friends', { user_id }).then(r => r.data)
export const list = (q) => api.get('/friends', { params: q }).then(r => r.data)
export const update = (id, relation) => api.patch(`/friends/${id}`, { relation }).then(r => r.data)
export const remove = (id) => api.delete(`/friends/${id}`)
