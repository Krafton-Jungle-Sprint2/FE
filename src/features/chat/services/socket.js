import { io } from 'socket.io-client'
export const connectChat = () => io('/api', { // vite proxy 경유
    path: '/socket.io',
    auth: { token: localStorage.getItem('accessToken') }
})
