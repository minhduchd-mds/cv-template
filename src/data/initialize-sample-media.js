import { sampleProfile360 } from './sample-profile-360'
import { withLocalSampleMedia } from './sample-media'

const localized = withLocalSampleMedia(sampleProfile360)

sampleProfile360.identity = localized.identity
sampleProfile360.projects = localized.projects
