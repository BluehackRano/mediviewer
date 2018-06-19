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
          <div class="top">
            <img
              v-if="capturedImage.layout1"
              :src="capturedImage.layout1.dicom" alt="Please wait ...">
            <img
              v-if="capturedImage.layout1"
              :src="capturedImage.layout1.seg" alt="Please wait ...">
          </div>
          <div class="center">
            <img
              v-if="capturedImage.layout2"
              :src="capturedImage.layout2.dicom" alt="Please wait ...">
            <img
              v-if="capturedImage.layout2"
              :src="capturedImage.layout2.seg" alt="Please wait ...">
          </div>
          <div class="bottom">
            <img
              v-if="capturedImage.layout3"
              :src="capturedImage.layout3.dicom" alt="Please wait ...">
            <img
              v-if="capturedImage.layout3"
              :src="capturedImage.layout3.seg" alt="Please wait ...">
          </div>
        </div>
        <div class="report-body-center">
          <div class="container">
            <div class="inner">

              <div class="contents">
                <div class="title">
                  <span>{{ report.Title }}</span>
                </div>
                <div class="provider">
                  <span>by {{ report.Provider }}</span>
                </div>

                <div class="patient-information-text">
                  <span>PATIENT INFORMATION</span>
                </div>
                <table class="patient-information-table">
                  <thead>
                  <tr>
                    <th>Patient ID</th>
                    <th>Patient Name</th>
                    <th>Sex</th>
                    <th>Age</th>
                  </tr>
                  </thead>
                  <tbody>
                  <tr>
                    <td>{{ report['Patient ID'] }}</td>
                    <td>-</td>
                    <td>{{ report.Sex }}</td>
                    <td>{{ report.Age }}</td>
                  </tr>
                  </tbody>
                </table>

                <div class="results-text">
                  <span>RESULTS</span>
                </div>
                <div class="results-image-container">
                  <div class="results-image">
                    <div class="left">
                      <img
                        v-if="capturedImage.layout1"
                        :src="capturedImage.layout1.dicom" alt="Please wait ...">
                      <!--<img-->
                      <!--class="seg"-->
                      <!--v-if="capturedImage.layout1"-->
                      <!--:src="capturedImage.layout1.seg" alt="Please wait ...">-->
                    </div>
                    <div class="center">
                      <img
                        v-if="capturedImage.layout2"
                        :src="capturedImage.layout2.dicom" alt="Please wait ...">
                      <!--<img-->
                      <!--class="seg"-->
                      <!--v-if="capturedImage.layout2"-->
                      <!--:src="capturedImage.layout2.seg" alt="Please wait ...">-->
                    </div>
                    <div class="right">
                      <img
                        v-if="capturedImage.layout3"
                        :src="capturedImage.layout3.dicom" alt="Please wait ...">
                      <!--<img-->
                      <!--class="seg"-->
                      <!--v-if="capturedImage.layout3"-->
                      <!--:src="capturedImage.layout3.seg" alt="Please wait ...">-->
                    </div>
                  </div>
                </div>

                <table class="results-table">
                  <thead>
                  <tr>
                    <th class="no">No</th>
                    <th>Name</th>
                    <th>Volume</th>
                    <th>Percentile</th>
                  </tr>
                  </thead>
                  <tbody>
                  <tr v-for="(value, key, index) in report.Volume">
                    <td>{{ index + 1 }}</td>
                    <td>{{ key }}</td>
                    <td>{{ report['Volume'][key] }}</td>
                    <td>{{ report['Percentile'][key] }}</td>
                  </tr>
                  </tbody>
                </table>
              </div> <!-- end of contents -->

              <div class="contents">
                <div class="title">
                  <span>{{ report.Title }}</span>
                </div>
                <div class="provider">
                  <span>by {{ report.Provider }}</span>
                </div>

                <div class="patient-information-text">
                  <span>PATIENT INFORMATION</span>
                </div>
                <table class="patient-information-table">
                  <thead>
                  <tr>
                    <th>Patient ID</th>
                    <th>Patient Name</th>
                    <th>Sex</th>
                    <th>Age</th>
                  </tr>
                  </thead>
                  <tbody>
                  <tr>
                    <td>{{ report['Patient ID'] }}</td>
                    <td>-</td>
                    <td>{{ report.Sex }}</td>
                    <td>{{ report.Age }}</td>
                  </tr>
                  </tbody>
                </table>

                <div class="charts-text">
                  <span>CHARTS</span>
                </div>
                <div class="charts-container">
                  <div
                    v-for="aChart in chartReports"
                    class="chart">
                    <img
                      :src="aChart" alt="Please wait ...">
                  </div>
                </div>

              </div> <!-- end of contents -->

            </div>
          </div>
        </div>


      </div>
    </div>
  </vue-draggable-resizable>
</template>

<script>
  import {mapGetters, mapActions} from 'vuex'
  import * as busType from '@/util/bus/bus-types'

  export default {
    name: 'AnalysisReportPopup',
    computed: {
      ...mapGetters([
        'showAnalysisReportPopup',
        'capturedImage',
        'chartReports',
        'report'
      ])
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
      ...mapActions([
        'showAnalysisReportPopupToggle'
      ]),
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
//        this.$bus.$emit(busType.SHOW_ANALYSIS_REPORT_POPUP, false)
        this.showAnalysisReportPopupToggle(false)
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
          background-color: rgb(32, 31, 36);
          overflow: hidden;

          .top {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 33.3%;
          }

          .center {
            position: absolute;
            left: 0;
            top: 33.3%;
            width: 100%;
            height: 33.3%;
          }

          .bottom {
            position: absolute;
            left: 0;
            bottom: 0;
            width: 100%;
            height: 33.3%;
          }

          img {
            position: absolute;
            top: 0;
            left: 0;
            max-width:100%;
            max-height:100%;
          }
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
              width: 100%;
              min-width: 700px;
              height: 2220px;

              .contents {
                margin-bottom: 10px;
                padding-left: 10px;
                padding-right: 10px;
                width: 100%;
                height: 1100px;
                background-color: white;
                /*text-align: center;*/

                .title {
                  padding-top: 30px;
                  width: 100%;
                  height: 50px;
                  text-align: center;

                  span {
                    line-height: 30px;
                    font-family: NotoSansCJKkr;
                    font-size: 35px;
                    font-weight: 900;
                    letter-spacing: 0;
                  }
                }

                .provider {
                  width: 100%;
                  height: 20px;
                  text-align: center;

                  span {
                    line-height: 10px;
                    font-family: NotoSansCJKkr;
                    font-size: 20px;
                    letter-spacing: 0;
                  }
                }

                .patient-information-text {
                  margin-top: 30px;
                }
                table.patient-information-table {
                  position: relative;
                  width: 100%;
                  border-radius: 3px;

                  th {
                    padding: 2px 4px;
                    height: 10px;
                    border: 2px solid black;
                    font-size: 10px;
                    -webkit-user-select: none;
                    -moz-user-select: none;
                    -ms-user-select: none;
                    user-select: none;
                  }

                  td {
                    padding: 5px 10px;
                    border: 2px solid black;
                    max-width: 30px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                  }
                }

                .results-text {
                  margin-top: 30px;
                }
                .results-image-container {
                  /*position: absolute;*/
                  width: 100%;
                  height: 250px;

                  .results-image {
                    width: 100%;
                    height: 250px;
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    grid-auto-rows: 250px;

                    div {
                      border: 1px solid gray;

                      img {
                        position: relative;
                        width: 100%;
                        height: 100%;
                      }
                    }
                  }
                }
                table.results-table {
                  margin-top: 30px;
                  position: relative;
                  width: 100%;
                  border-radius: 3px;

                  th {
                    padding: 5px 10px;
                    height: 10px;
                    border: 2px solid black;
                    max-width: 30px;
                    background-color: lightgray;
                    font-size: 15px;
                    -webkit-user-select: none;
                    -moz-user-select: none;
                    -ms-user-select: none;
                    user-select: none;
                  }

                  td {
                    padding: 5px 10px;
                    border: 2px solid black;
                    max-width: 30px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                  }

                  th.no {
                    width: 40px;
                  }
                }

                .charts-text {
                  margin-top: 30px;
                }
                .charts-container {
                  width: 100%;
                  display: grid;
                  grid-template-columns: repeat(3, 1fr);
                  grid-auto-rows: 250px;

                  .chart {
                    border: 1px solid black;

                    img {
                      position: relative;
                      width: 100%;
                      height: 100%;
                    }
                  }
                }
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
    width: 8px;
    height: 8px;
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
