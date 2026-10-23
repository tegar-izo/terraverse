import { createApp } from "vue";
import App from "./App.vue";
import "./styles/main.css";
import "./lib/state.js";
import { terapkanTema } from "./lib/tema.js";

terapkanTema();
createApp(App).mount("#app");
