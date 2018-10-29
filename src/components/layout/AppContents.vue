<template>
  <div class="app-main">
    <router-view></router-view>
    <analysis-report-popup
      v-show="showAnalysisReportPopup"
    ></analysis-report-popup>
    <segmentation-popup
      v-show="showSegmentationPopup"
    ></segmentation-popup>
    <mask-opacity-popup
      v-show="showMaskOpacityPopup">
    </mask-opacity-popup>
    <div
      class="pacs-popup-container"
      v-if="showPacsPopup"
      @click="pacsPopupContainerClicked">
      <pacs-popup
        style="opacity: 1;">
      </pacs-popup>
    </div>


    <help-popup
      v-show="showHelpPopup">
    </help-popup>
  </div>
</template>

<script>
  import {mapGetters, mapActions} from 'vuex'
  import * as mutationType from '@/store/mutation-types'
  import * as busType from '@/util/bus/bus-types'

  import SegmentationPopup from '@/components/popups/SegmentationPopup'
  import AnalysisReportPopup from '@/components/popups/AnalysisReportPopup'
  import MaskOpacityPopup from '@/components/popups/MaskOpacityPopup'
  import PacsPopup from '@/components/popups/PacsPopup'
  import HelpPopup from '@/components/popups/HelpPopup'

  export default {
    name: 'AppContents',
    computed: {
      ...mapGetters({
        menus: 'menus',
        showAnalysisReportPopup: 'showAnalysisReportPopup',
        focusedCanvas: 'focusedCanvas'
      })
    },
    data () {
      return {
        isFileUploaded: false,
        showSegmentationPopup: false,
        showMaskOpacityPopup: false,
        showPacsPopup: false,
        showPacsPopupInner: false,
        showHelpPopup: false
      }
    },
    components: {
      SegmentationPopup,
      AnalysisReportPopup,
      MaskOpacityPopup,
      PacsPopup,
      HelpPopup
    },
    created () {
      this.$bus.$on(busType.FILE_UPLOADED, () => {
        this.isFileUploaded = true
      })
      this.$bus.$on(busType.SHOW_SEGMENTATION_POPUP, this.showSegmentationPopupToggle)
      this.$bus.$on(busType.SHOW_ANALYSIS_REPORT_POPUP, this.showAnalysisReportPopupToggle)
      this.$bus.$on(busType.SHOW_MASK_OPACITY_POPUP, this.showMaskOpacityPopupToggle)
      this.$bus.$on(busType.SHOW_PACS_POPUP, this.showPacsPopupToggle)
      this.$bus.$on(busType.SHOW_HELP_POPUP, this.showHelpPopupToggle)
    },
    mounted () {
      document.onkeydown = (e) => {
        if (!this.isFileUploaded) {
          return
        }
        let keyCode = e.keyCode
//        console.log(keyCode)
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
        } else if (keyCode === 84) { // t : Show/Hide Tags
          for (let i = 0; i < this.menus.length; i++) {
            if (this.menus[i].name === 'ShowTagsToggle') {
              this.$store.commit(mutationType.SET_SHOW_TAGS, !this.menus[i].toggle)
              this.showTagsToggle({
                name: this.menus[i].name,
                toggle: !this.menus[i].toggle
              })
            }
          }
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
          this.$store.commit(mutationType.SELECT_CANVAS, document.getElementById('layout-1-1'))
        } else if (keyCode === 49) { // 1
          this.$store.commit(mutationType.SELECT_CANVAS, document.getElementById('layout-1-2'))
        } else if (keyCode === 50) { // 2
          this.$store.commit(mutationType.SELECT_CANVAS, document.getElementById('layout-2-1'))
        } else if (keyCode === 51) { // 3
          this.$store.commit(mutationType.SELECT_CANVAS, document.getElementById('layout-2-2'))
        }
      }
    },
    methods: {
      ...mapActions([
        'showTagsToggle'
      ]),
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
      showMaskOpacityPopupToggle (show) {
        this.showMaskOpacityPopup = show
//        if (show) {
//          this.showMaskOpacityPopup = show
//          return
//        }
//        this.showMaskOpacityPopup = !this.showMaskOpacityPopup
      },
      showPacsPopupToggle (show) {
        if (show) {
          this.showPacsPopup = show
          return
        }
        this.showPacsPopup = !this.showPacsPopup
      },
      pacsPopupContainerClicked (e) {
        e.stopPropagation()
        e.preventDefault()
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
  .pacs-popup-container {
    position: absolute;
    top: 0;
    left: 0;
    min-width: 100vw;
    min-height: 100vh;
    z-index: 3000;
    background-color: rgba(0,0,0,0.6);
  }
</style>
