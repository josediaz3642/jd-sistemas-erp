import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
// import './style.css' // (Tus estilos globales)

const app = createApp(App)
const pinia = createPinia() // 2. Crear la instancia de Pinia

app.use(pinia) 
app.use(router)

app.mount('#app')