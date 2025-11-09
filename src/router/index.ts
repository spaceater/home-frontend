import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  // history: createWebHistory(import.meta.env.BASE_URL),
  history: createWebHistory('/'),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../pages/home/home.vue')
    },
    {
      path: '/interval-estimate',
      name: 'intervalEstimate',
      component: () => import('../pages/interval_estimate/interval_estimate.vue'),
    },
    {
      path: '/resume',
      name: 'resume',
      component: () => import('../pages/resume/resume.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'notFound',
      component: () => import('../pages/error/error.vue')
    }
  ],
})

export default router
