/**
 * plugins/vuetify.ts
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Composables
import { createVuetify } from 'vuetify'
import { getInitialPreferences } from '@/composables/useUserPreferences'

// Styles
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
  theme: {
    defaultTheme: getInitialPreferences().theme,
    themes: {
      light: {
        dark: false,
        colors: {
          surface: '#F5F7FA',
        },
      },
    },
  },
})
