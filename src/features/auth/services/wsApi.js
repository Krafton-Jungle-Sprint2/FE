import api from '@/shared/lib/api'
export const createWS = (name) => api.post('/workspaces', { name }).then(r => r.data)
export const listWS = () => api.get('/workspaces').then(r => r.data)
export const wsDetail = (id) => api.get(`/workspaces/${id}`).then(r => r.data)

export const addMember = (id, user_id) => api.post(`/workspaces/${id}/members`, { user_id }).then(r => r.data)
export const setAccepted = (id, uid, accepted) => api.patch(`/workspaces/${id}/members/${uid}`, { accepted }).then(r => r.data)
export const removeMember = (id, uid) => api.delete(`/workspaces/${id}/members/${uid}`)

export const createTask = (wsId, b) => api.post(`/workspaces/${wsId}/tasks`, b).then(r => r.data)
export const listTasks = (wsId, q) => api.get(`/workspaces/${wsId}/tasks`, { params: q }).then(r => r.data)
export const patchTask = (wsId, tid, b) => api.patch(`/workspaces/${wsId}/tasks/${tid}`, b).then(r => r.data)
export const removeTask = (wsId, tid) => api.delete(`/workspaces/${wsId}/tasks/${tid}`)
