

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import * as iconfont from './assets/icons'

import App from './App.vue'
import router from './router'


const app = createApp(App)

app.use(createPinia())
app.use(router)
//注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
  }

  // 注册第三方图标 - 替代修复方案
for(const icon in iconfont) {
  app.component(`pi-${icon}`, (iconfont as any)[icon])
}

app.mount('#app')
