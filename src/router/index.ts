import { createRouter, createWebHistory } from 'vue-router'
import home from '../pages/home/home.vue'
import error from '../pages/error/error.vue'
import interval_estimate from '../pages/interval_estimate/interval_estimate.vue'

const router = createRouter({
  // history: createWebHistory(import.meta.env.BASE_URL),
  history: createWebHistory('/'),
  routes: [
    {
      path: '/',
      name: 'home',
      component: home
    },
    {
      path: '/interval-estimate',
      name: 'intervalEstimate',
      component: interval_estimate,
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'notFound',
      component: error
    }
  ],
})

export default router
