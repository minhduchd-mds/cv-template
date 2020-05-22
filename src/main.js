import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
// import router from './router'
// import store from './store'
// import './plugins/base'
// import './plugins/chartist'
// import './plugins/vee-validate'
// import i18n from './i18n'
import * as firebase from "firebase/app";
Vue.config.productionTip = false

const firebaseConfig = {
  apiKey: "AIzaSyD67Yh-Q35CnMP1c2T5SQE8eBohx8QUIj4",
  authDomain: "chat-5ddd7.firebaseapp.com",
  databaseURL: "https://chat-5ddd7.firebaseio.com",
  projectId: "chat-5ddd7",
  storageBucket: "chat-5ddd7.appspot.com",
  messagingSenderId: "850707411995",
  appId: "1:850707411995:web:477d7610fe08471aa2b4be"
};
firebase.initializeApp(firebaseConfig);

new Vue({
  vuetify,
  // router,
  // store,
  // i18n,
  render: h => h(App)
}).$mount('#app')
