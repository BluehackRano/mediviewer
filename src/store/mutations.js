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
    if (state.focusedCanvas) {
      if (!state.focusedCanvas.opacity) {
        if (state.focusedCanvas.opacity !== 0) {
          state.focusedCanvas.opacity = 100
        }
      }
      state.maskOpacity = state.focusedCanvas.opacity
    }
  },
  SET_SHOW_TAGS (state, showTags) {
    state.showTags = showTags
  },
  SHOW_ANALYSIS_REPORT_POPUP (state, showAnalysisReportPopup) {
    state.showAnalysisReportPopup = showAnalysisReportPopup
  },
  SET_CAPTURED_IMAGE (state, capturedImage) {
    state.capturedImage = capturedImage
  },
  SET_CHART_REPORTS (state, chartReports) {
    state.chartReports = []
    state.chartReports = chartReports
  },
  SET_REPORT (state, report) {
    state.report = report
  },
  SET_TAG_INFO (state, tagInfo) {
    state.tagInfo = tagInfo
  },
  SET_MASK_OPACITY (state, opacity) {
    if (opacity < 0) {
      state.maskOpacity = 0
    } else if (opacity > 100) {
      state.maskOpacity = 100
    } else {
      state.maskOpacity = opacity
    }
    state.focusedCanvas.opacity = state.maskOpacity
  }
}
