import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// Importar el CSS principal (¡SOLO UNO!)
import './style.css' 

// Importar y ejecutar la semilla de datos (opcional, data.js ya lo hace)
// import { seedData } from './services/data'
// seedData(); // No es necesario si data.js ya lo auto-ejecuta

createApp(App).use(router).mount('#app')

