// src/app/router/routes.js
export const routes = [
  {
    path: '/',
    component: () => import('../layouts/MainLayout.vue'),
    children: [
      { path: '', redirect: '/login' },

      // Auth
      { path: 'login', component: () => import('@/features/auth/pages/LoginPage.vue') },
      { path: 'signup', component: () => import('@/features/auth/pages/SignupPage.vue') },

      // Pages
      { path: 'todos', component: () => import('@/features/todo/pages/TodoPage.vue') },
      { path: 'chat', component: () => import('@/features/chat/pages/TeamChatPage.vue') },
      { path: 'schedule', component: () => import('@/features/schedule/pages/TeamSchedulePage.vue') },
      { path: 'mypage', component: () => import('@/features/profile/pages/MyPage.vue') },
    ],
  },

  // 404 -> 홈으로
  { path: '/:pathMatch(.*)*', redirect: '/' },
]
