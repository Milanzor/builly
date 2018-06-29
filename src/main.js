import Vue from 'vue';
import App from './App.vue';
import VueSocketio from 'vue-socket.io';

Vue.config.productionTip = false;

new Vue({
    created() {
        document.title = 'Builly';
        // Bind VueSocketio
        Vue.use(VueSocketio, `${window.location.protocol}//${window.location.hostname}:4999`);
    },
    render: h => h(App)
}).$mount('#app');
