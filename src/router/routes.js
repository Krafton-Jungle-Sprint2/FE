// src/router/routes.js
import MainLayout from '@/layouts/MainLayout.vue'
import LoginPage from '@/features/auth/pages/LoginPage.vue'
import SignupPage from '@/features/auth/pages/SignupPage.vue'
import TodoPage from '@/features/todo/pages/TodoPage.vue'
import TeamChatPage from '@/features/chat/pages/TeamChatPage.vue'
import TeamSchedulePage from '@/features/schedule/pages/TeamSchedulePage.vue'

const routes = [
  { path: '/login', component: LoginPage },
  { path: '/signup', component: SignupPage },
  {
    path: '/',
    component: MainLayout,
    children: [
      { path: 'todos', component: TodoPage, meta: { requiresAuth: true } },
      { path: 'chat/:wsId?', component: () => import('@/features/chat/pages/TeamChatPage.vue') },
      { path: 'chat', component: TeamChatPage, alias: ['/teamchatpage'] },
      { path: 'schedule', component: TeamSchedulePage, alias: ['/teamschedulepage'] },
      { path: 'profile', component: () => import('@/features/profile/MyPage.vue') },
    ],
  },
]

export default routes
