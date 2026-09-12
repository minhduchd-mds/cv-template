import { createApp } from 'vue'
import './data/initialize-sample-media'
import RootApp from './RootApp.vue'
import { sanitizeStoredProfile } from './security/safe-media'
import './styles/main.scss'

sanitizeStoredProfile()
createApp(RootApp).mount('#app')
