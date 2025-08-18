// src/router/routes.js
import MainLayout from '@/layouts/MainLayout.vue'
import LoginPage from '@/features/auth/pages/LoginPage.vue'
import SignupPage from '@/features/auth/pages/SignupPage.vue'
import TodoPage from '@/features/todo/pages/TodoPage.vue'

const routes = [
  { path: '/login', component: LoginPage },
  { path: '/signup', component: SignupPage },
  {
    path: '/',
    component: MainLayout,
    children: [
      { path: 'todos', component: TodoPage },
      // { path: 'todos', component: TodoPage, meta: { requiresAuth: true } },
      { path: 'chat', component: () => import('@/features/chat/pages/TeamChatPage.vue') },//, meta: { requiresAuth: true } },
      { path: 'schedule', component: () => import('@/features/schedule/pages/TeamSchedulePage.vue') },//, meta: { requiresAuth: true } },
      { path: 'profile', component: () => import('@/features/profile/pages/MyPage.vue') },//, meta: { requiresAuth: true } },
    ]
  }
]

export default routes   // ✅ 반드시 필요
