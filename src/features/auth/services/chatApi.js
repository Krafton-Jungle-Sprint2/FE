import api from '@/shared/lib/api'
export const listRooms = (team_id) => api.get('/chat/rooms', { params: { team_id } }).then(r => r.data)
export const getRoom = (id) => api.get(`/chat/rooms/${id}`).then(r => r.data)
export const sendMsg = (id, text) => api.post(`/chat/rooms/${id}/messages`, { text }).then(r => r.data)
export const listMsgs = (id, p) => api.get(`/chat/rooms/${id}/messages`, { params: p }).then(r => r.data)
