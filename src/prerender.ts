import { renderToString } from '@vue/server-renderer'
import { createSSRApp } from 'vue'
import { createRouter, createMemoryHistory } from 'vue-router'
import App from './App.vue'
import home from './pages/home/home.vue'
import error from './pages/error/error.vue'
import interval_estimate from './pages/interval_estimate/interval_estimate.vue'

export async function prerender(data: { url: string }) {
  // 为 SSR 创建内存历史记录路由
  const router = createRouter({
    history: createMemoryHistory('/'),
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

  // 创建 SSR 应用实例
  const app = createSSRApp(App)
  app.use(router)

  // 设置路由到指定 URL
  router.push(data.url)
  await router.isReady()

  // 渲染为 HTML 字符串
  const html = await renderToString(app)

  return {
    html,
    links: new Set<string>([]),
  }
}
