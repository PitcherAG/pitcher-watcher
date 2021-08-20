import { languages as availableLanguages } from '@/../gettext.config'
import { name as pkgName, version as pkgVersion } from '@/../package.json'

process.env.VUE_APP_LANGUAGES = JSON.stringify(availableLanguages)
process.env.VUE_APP_VERSION = JSON.stringify(pkgVersion)
process.env.VUE_APP_NAME = JSON.stringify(pkgName)
