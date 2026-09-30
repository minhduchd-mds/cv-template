import { createApp } from 'vue'
import './data/initialize-sample-media'
import RootApp from './RootApp.vue'
import { migrateStoredProfile } from './data/migrate-stored-profile'
import { sanitizeStoredProfile } from './security/safe-media'
import './styles/main.scss'

sanitizeStoredProfile()
migrateStoredProfile()
createApp(RootApp).mount('#app')
window.clearTimeout(window.__cvStudioFallbackTimer)
window.__cvStudioFallbackTimer = 0
