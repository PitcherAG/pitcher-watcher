// ------------------------------
// Sentry integration - comment out code below to enable sentry.io in the project
// Dont forget to add proper _dsn_ id!!

import * as Sentry from '@sentry/vue'
import Vue from 'vue'
import { Integrations } from '@sentry/tracing'

if (process.env.NODE_ENV && process.env.NODE_ENV !== 'development') {
  Sentry.init({
    Vue,
    release: `${JSON.parse(process.env.VUE_APP_NAME)}@${JSON.parse(process.env.VUE_APP_VERSION)}`,
    autoSessionTracking: true,
    dsn: '__INSERT_SENTRY_DSN_NUMBER_HERE__',
    integrations: [new Integrations.BrowserTracing()],
    tracesSampleRate: 1.0,
  })
}
