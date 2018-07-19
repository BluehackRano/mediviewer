import Vue from 'vue'
import Vuex from 'vuex'

import actions from './actions'
import mutations from './mutations'

import menus from './modules/menus'
import segmentations from './modules/segmentations'

Vue.use(Vuex)

const state = {
  userId: 'abcd',
  currentLayout: {
    name: '2By2'
  },
  focusedCanvas: {},
  currentAction: {},
  currentSelect: {},
  showTags: false,
  tagInfo: {},
  showAnalysisReportPopup: false,
  capturedImage: {
    layout1: null,
    layout2: null,
    layout3: null
  },
  chartReports: [],
  report: {},
  maskOpacity: 100
}

const getters = {
  focusedCanvas: state => state.focusedCanvas,
  tagInfo: state => state.tagInfo,
  showAnalysisReportPopup: state => state.showAnalysisReportPopup,
  capturedImage: state => state.capturedImage,
  chartReports: state => state.chartReports,
  report: state => state.report,
  maskOpacity: state => state.maskOpacity
}

const store = new Vuex.Store({
  state,
  modules: {
    menus,
    segmentations
  },
  getters,
  actions,
  mutations
})

export default store
