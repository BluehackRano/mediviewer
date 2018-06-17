export default {
  SET_USER_ID (state, userId) {
    state.userId = userId
  },
  SET_LAYOUT_TYPE (state, layout) {
    state.currentLayout = layout
  },
  SELECT_MENU (state, menu) {
    state.currentSelect = menu
  },
  SELECT_CANVAS (state, canvas) {
    state.focusedCanvas = canvas
  },
  SET_SHOW_TAGS (state, showTags) {
    state.showTags = showTags
  },
  SHOW_ANALYSIS_REPORT_POPUP (state, showAnalysisReportPopup) {
    state.showAnalysisReportPopup = showAnalysisReportPopup
  },
  SET_CAPTURED_IMAGE (state, capturedImage) {
    state.capturedImage = capturedImage
  }
}
