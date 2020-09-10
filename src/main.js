import Vue from "vue";
import App from "./App";

Vue.config.productionTip = true;


window.$app = new Vue({
    el: "#app",
    components: { App },
    template:"<App/>"
});