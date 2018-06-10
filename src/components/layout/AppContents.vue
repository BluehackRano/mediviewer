<template>
  <div class="app-main">
    <router-view></router-view>
    <analysis-report-popup
      v-show="showAnalysisReportPopup"
    ></analysis-report-popup>
    <segmentation-popup
      v-show="showSegmentationPopup"
    ></segmentation-popup>

    <help-popup
      v-show="showHelpPopup">
    </help-popup>
  </div>
</template>

<script>
  import * as busType from '@/util/bus/bus-types'

  import SegmentationPopup from '@/components/popups/SegmentationPopup'
  import AnalysisReportPopup from '@/components/popups/AnalysisReportPopup'
  import HelpPopup from '@/components/popups/HelpPopup'

  export default {
    name: 'AppContents',
    data () {
      return {
        isFileUploaded: false,
        showSegmentationPopup: false,
        showAnalysisReportPopup: false,
        showHelpPopup: false
      }
    },
    components: {
      SegmentationPopup,
      AnalysisReportPopup,
      HelpPopup
    },
    created () {
      this.$bus.$on(busType.FILE_UPLOADED, () => {
        this.isFileUploaded = true
      })
      this.$bus.$on(busType.SHOW_SEGMENTATION_POPUP, this.showSegmentationPopupToggle)
      this.$bus.$on(busType.SHOW_ANALYSIS_REPORT_POPUP, this.showAnalysisReportPopupToggle)
      this.$bus.$on(busType.SHOW_HELP_POPUP, this.showHelpPopupToggle)
    },
    mounted () {
      document.onkeydown = (e) => {
        if (!this.isFileUploaded) {
          return
        }
        let keyCode = e.keyCode
        console.log(keyCode)
        if (keyCode === 80) { // p : Pan
          let menu = {
            name: 'Pan',
            type: 'select'
          }
          this.$bus.$emit(busType.MENU_CLICKED, menu)
        } else if (keyCode === 66) { // b : BrightnessContrast
          let menu = {
            name: 'BrightnessContrast',
            type: 'select'
          }
          this.$bus.$emit(busType.MENU_CLICKED, menu)
        } else if (keyCode === 69) { // e
        } else if (keyCode === 70) { // f : Fit
          let menu = {
            name: 'Fit',
            type: 'action'
          }
          this.$bus.$emit(busType.MENU_CLICKED, menu)
        } else if (keyCode === 73) { // i : Invert
          let menu = {
            name: 'Invert',
            type: 'action'
          }
          this.$bus.$emit(busType.MENU_CLICKED, menu)
        } else if (keyCode === 83) { // s
        } else if (keyCode === 90) { // z
        } else if (keyCode === 187) { // + : ZoomIn
          let menu = {
            name: 'ZoomIn',
            type: 'action'
          }
          this.$bus.$emit(busType.MENU_CLICKED, menu)
        } else if (keyCode === 189) { // - : ZoomOut
          let menu = {
            name: 'ZoomOut',
            type: 'action'
          }
          this.$bus.$emit(busType.MENU_CLICKED, menu)
        } else if (keyCode === 48) { // 0
        }
      }
    },
    methods: {
      showSegmentationPopupToggle (show) {
        if (show) {
          this.showSegmentationPopup = show
          return
        }
        this.showSegmentationPopup = !this.showSegmentationPopup
      },
      showAnalysisReportPopupToggle (show) {
        if (show) {
          this.showAnalysisReportPopup = show
          return
        }
        this.showAnalysisReportPopup = !this.showAnalysisReportPopup
      },
      showHelpPopupToggle (show) {
        if (show) {
          this.showHelpPopup = show
          return
        }
        this.showHelpPopup = !this.showHelpPopup
      }
    }
  }
</script>

<style lang="scss" scoped>
  #app-main {
  }
</style>
