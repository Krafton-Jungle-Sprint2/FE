import api from '@/shared/lib/api'
export const list = (q) =>
    api.get('/me/todos', { params: q }).then(r => r.data)
export const create = (b) =>
    api.post('/me/todos', b).then(r => r.data)
export const patch = (id, b) =>
    api.patch(`/me/todos/${id}`, b).then(r => r.data)
export const remove = (id) =>
    api.delete(`/me/todos/${id}`)
