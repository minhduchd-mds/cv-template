import { createApp } from 'vue'
import './data/initialize-sample-media'
import RootApp from './RootApp.vue'
import { sanitizeStoredProfile } from './security/safe-media'
import './styles.css'
import './enhancements.css'
import './editor.css'
import './builder-advanced.css'
import './cv-sections.css'
import './motion.css'
import './quality.css'
import './concepts/concepts.css'
import './concepts/concept-experience.css'
import './concepts/concept-polish.css'
import './styles/main.scss'

sanitizeStoredProfile()
createApp(RootApp).mount('#app')
