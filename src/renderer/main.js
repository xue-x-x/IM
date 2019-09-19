import Vue from 'vue'
import axios from 'axios'

import App from './App'
import router from './router'
import store from './store'

import iView from 'iview';
import 'iview/dist/styles/iview.css';    // 使用 CSS
import VueParticles from 'vue-particles';
import { dateStr, formatDateTime } from './views/im/utils/chatUtils.js';

Vue.use(iView);
Vue.use(VueParticles);

Vue.prototype.formatDateTime = formatDateTime;
Vue.prototype.dateStr = dateStr;

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>'
}).$mount('#app')
