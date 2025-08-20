export function requireAuth(to, from, next) {
    const ok = !!localStorage.getItem('accessToken')
    if (to.meta.requiresAuth && !ok) next('/login'); else next()
}
