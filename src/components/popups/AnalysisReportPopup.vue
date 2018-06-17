<template>
  <vue-draggable-resizable
    class="report-popup"
    :parent="true"
    :resizable="true"
    :x="30" :y="30" :z="2000"
    :w="popupWidth" :h="popupHeight">
    <div class="report-popup-inner">
      <div class="report-header">
        <span>Analysis Report</span>
        <img src="/static/images/icons/svg/btn-close-nor.svg"
             @click="closePopup"
             @mousedown="stopMovable">
      </div>
      <div class="report-body">
        <div class="report-body-left">

        </div>
        <div class="report-body-center">
          <div class="container">
            <div class="inner">
              <img
                v-if="reportImg"
                :src="reportImg" alt="Please wait ...">
              <img
                v-if="reportImg"
                :src="reportImg" alt="Please wait ...">
            </div>
          </div>
        </div>


      </div>
    </div>
  </vue-draggable-resizable>
</template>

<script>
  import * as busType from '@/util/bus/bus-types'

  export default {
    name: 'AnalysisReportPopup',
    computed: {
    },
    data () {
      return {
        reportImg: null,
        popupWidth: 0,
        popupHeight: 0
      }
    },
//    watch: {
//      windowWidth (newWidth, oldWidth) {
//        this.popupWidth = newWidth
//      },
//      windowHeight (newHeight, oldHeight) {
//        this.popupHeight = newHeight
//      }
//    },
    created () {
      this.$bus.$on(busType.FILE_UPLOADED, this.dicomFileUploaded)

      this.popupWidth = window.innerWidth - 60
      this.popupHeight = window.innerHeight - 60
    },
    mounted () {
//      this.$nextTick(() => {
//        window.addEventListener('resize', () => {
//          this.windowWidth = window.innerWidth
//          this.windowHeight = window.innerHeight
//        });
//      })
    },
    methods: {
      dicomFileUploaded (dicomFile) {
        this.resetReportImageWithFileName(dicomFile.name)
      },
      resetReportImageWithFileName (fileName) {
        switch (fileName) {
          case 'dicom-001-02.zip':
            this.reportImg = '/static/reports/report-001.png'
            break
          case 'dicom-002-02.zip':
            this.reportImg = '/static/reports/report-002.png'
            break
          case 'dicom-003-02.zip':
            this.reportImg = '/static/reports/report-003.png'
            break
          case 'dicom-004-02.zip':
            this.reportImg = '/static/reports/report-004.png'
            break
          case 'dicom-005-02.zip':
            this.reportImg = '/static/reports/report-005.png'
            break
          default:
            break
        }
      },
      closePopup (e) {
        this.$bus.$emit(busType.SHOW_ANALYSIS_REPORT_POPUP, false)
        e.stopPropagation()
      },
      stopMovable (e) {
        e.stopPropagation()
      }
    }
  }
</script>

<style lang="scss" scoped>
  @import "../../style/bh_style.scss";

  .report-popup {
    box-shadow: 5px 5px 30px black;

    .report-popup-inner {
      width: 100%;
      height: 100%;
      background-color: #282828;
      border-radius: 5px;
      overflow: hidden;

      .report-header {
        margin-left: 15px;
        width: 100%;
        height: 48px;

        span {
          position: relative;
          top: 10px;
          font-size: 15px;
          vertical-align: middle;
          color: #e3e3e3;
        }

        img {
          vertical-align: middle;
          margin-right: 15px;
          width: 48px;
          height: 48px;
          float: right;

          &:hover {
            cursor: pointer;
            background-color: $button-over-color;
          }
        }
      }

      .report-body {
        position: absolute;
        width: 100%;
        top: 48px;
        bottom: 0;
        padding: 0;
        background-color: rgb(32, 31, 36);
        overflow-y: auto;
        overflow-x: hidden;
        border-bottom-left-radius: 5px;
        border-bottom-right-radius: 5px;

        .report-body-left {
          position: absolute;
          left: 0;
          width: 30%;
          height: 100%;
          background-color: gray;
        }

        .report-body-center {
          position: absolute;
          left: 30%;
          width: 70%;
          height: 100%;

          .container {
            position: absolute;
            left: 5%;
            top: 5%;
            width: 90%;
            height: 90%;
            border: 1px solid gray;
            overflow-x: auto;
            overflow-y: auto;

            .inner {
              position: absolute;
              left: 0;
              top: 0;
              width: 2000px;
              height: 2000px;

              img {
                /*position: absolute;*/
                /*width: 800px;*/
                /*height: 850px;*/
                pointer-events: none;
              }
            }


          }

        }
      }

      -webkit-touch-callout: none;
      -webkit-user-select: none;
      -khtml-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
    }
  }

  /* width */
  ::-webkit-scrollbar {
    width: 10px;
    height: 10px;
  }

  /* Track */
  ::-webkit-scrollbar-track {
    background: #3b3a40;
  }

  /* Handle */
  ::-webkit-scrollbar-thumb {
    background: #787782;
    border-radius: 10px;
  }

  /* Handle on hover */
  ::-webkit-scrollbar-thumb:hover {
    background: #555;
    border-radius: 10px;
  }
</style>
