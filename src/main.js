// main.js
import { createApp } from "vue";
import App from "./App.vue";
import router from "./router/index.js";
import "./assets/glass.css";

import { initializeDataService } from "./services/data.js";
initializeDataService();

createApp(App)
  .use(router)
  .mount("#app");
