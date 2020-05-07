import Vue from 'vue'
import App from './App.vue'
import vuetify from '@/plugins/vuetify' // path to vuetify export
// import router from './router'
// import store from './store'
// import './plugins/base'
// import './plugins/chartist'
// import './plugins/vee-validate'
// import i18n from './i18n'
Vue.config.productionTip = false


new Vue({
  vuetify,
  // router,
  // store,
  // i18n,
  render: h => h(App)
}).$mount('#app')
