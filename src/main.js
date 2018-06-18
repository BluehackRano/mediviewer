// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import router from './router'
import store from './store'

import axios from 'axios'

import Buefy from 'buefy'
import 'buefy/lib/buefy.css'
import 'vue-awesome/icons'
import Icon from 'vue-awesome/components/Icon'
import VueDraggableResizable from 'vue-draggable-resizable'

import App from './App'

Vue.prototype.$http = axios

Vue.config.productionTip = false

Vue.use(Buefy)
Vue.component('icon', Icon)
Vue.component('vue-draggable-resizable', VueDraggableResizable)

/* Global event bus instance */
const EventBus = new Vue()
Object.defineProperties(Vue.prototype, {
  $bus: {
    get: function () {
      return EventBus
    }
  }
})

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  template: '<App/>',
  components: { App }
})
