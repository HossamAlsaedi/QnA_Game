import './assets/main.css'

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'font-awesome/css/font-awesome.min.css';


import App from './App.vue'
import router from './router/index'

const app = createApp(App)

app.use(createPinia())
app.use(router)

router.afterEach((to) => {
    const defaultTitle = 'سؤال وجواب'
    document.title = to.meta.title || defaultTitle
})


app.mount('#app')
