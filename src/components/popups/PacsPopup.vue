<template>
  <vue-draggable-resizable
    v-show="visible"
    class="pacs-popup"
    id="pacs-popup-view"
    :parent="true"
    :resizable="false"
    :draggable="false"
    :x="0" :y="0" :z="2000"
    :w="aWidth" :h="aHeight"
    style="background-color: rgba(128,128,128,0);">
    <div class="pacs-popup-inner">
      <div class="pacs-header">
        <span>Load Dicom</span>
        <img src="/static/images/icons/svg/btn-close-nor.svg"
             @click="closePopup"
             @mousedown="stopMovable">
      </div>
      <div class="pacs-body">
        <template
          v-if="pageNum === 1 && studies">
          <table>
            <thead>
            <tr>
              <th width="25%">Study Name</th>
              <th width="25%">Study ID</th>
              <th width="25%">Patient Name</th>
              <th width="25%">Patient ID</th>
            </tr>
            </thead>
            <tbody>
            <tr
              v-for="aStudy, anIndex in studies"
              class="studyTableRow"
              :id="`studyTableRow${anIndex}`"
              @click="tableRowClicked(anIndex)"
            >
              <td><span>{{aStudy.studyName}}</span></td>
              <td><span>{{aStudy.studyId}}</span></td>
              <td><span>{{aStudy.patientName}}</span></td>
              <td><span>{{aStudy.patientId}}</span></td>
            </tr>
            </tbody>
          </table>
        </template>
        <template
          v-else-if="pageNum === 2 && series">
          <div
            class="up-one-level"
            @click="upOneLevelClicked">
            <span>Up One Level ↑ </span>
          </div>
          <table>
            <thead>
            <tr>
              <th width="50%">Series Name</th>
              <th width="50%">Series ID</th>
            </tr>
            </thead>
            <tbody>
            <tr
              v-for="sr, anIndex in series"
              class="seriesTableRow"
              :id="`seriesTableRow${anIndex}`"
              @click="tableRowClicked(anIndex)"
            >
              <td><span>{{sr.seriesName}}</span></td>
              <td><span>{{sr.seriesId}}</span></td>
            </tr>
            </tbody>
          </table>
        </template>
      </div>
      <div class="pacs-footer"
        @click="footerButtonClicked">
        <span
          v-if="pageNum === 1">
          Next
        </span>
        <span
          v-else-if="pageNum === 2">
          Load
        </span>
      </div>
    </div>
  </vue-draggable-resizable>
</template>

<script>
  import axios from 'axios'
  import * as busType from '@/util/bus/bus-types'

  export default {
    name: 'PacsPopup',
    data () {
      return {
        visible: false,
        studies: [],
        series: [],
        aWidth: 760,
        aHeight: 710,
        pageNum: 1,
        selectedStudyRow: -1,
        selectedSeriesRow: -1,
        delay: 200,
        clicks: 0,
        timer: null
      }
    },
    created () {
      const baseURI = 'http://35.187.196.136';
      this.$http.get(`${baseURI}/series/studies/5bcc8aa34fa7f1481830c3e0`)
        .then((result) => {
          this.initData(result.data.items)
        })
        .catch(e => {
          console.log(e)
          alert('Failed to retrieve data.')
        })
        .finally(() => {
          this.visible = true
          this.viewPositionCenter()
        })
    },
    methods: {
      initData (items) {
        this.studies = []
        this.series = []
        for (var i=0; i<items.length; i++) {
          var study = {}
          study.studyName = items[i].study_name ? items[i].study_name : '-'
          study.studyId = items[i].study_id ? items[i].study_id : '-'
          study.patientName = items[i].patient_name ? items[i].patient_name : '-'
          study.patientId = items[i].patient_id ? items[i].patient_id : '-'
          this.studies.push(study)

          var sr = {}
          sr.seriesName = items[i].series_name ? items[i].series_name : '-'
          sr.seriesId = items[i].series_id ? items[i].series_id : '-'
          sr.fileName = items[i].file_name ? items[i].file_name : '-'
          sr.fileURL = items[i].file_url ? items[i].file_url : '-'
          this.series.push(sr)
        }
      },
      viewPositionCenter () {
        this.$nextTick(() => {
          var popup = document.getElementById('pacs-popup-view')
          popup.style.left = 'calc(50vw - 380px)'
          popup.style.top = 'calc(50vh - 355px)'
        })
      },
      resetTableLayout() {
        var rows = document.getElementsByClassName('studyTableRow')
        if (rows) {
          for (var i=0; i<rows.length; i++) {
            if (i % 2 === 0) {
              rows[i].style.backgroundColor = '#383838'
            } else {
              rows[i].style.backgroundColor = '#323232'
            }
          }
        }
        rows = document.getElementsByClassName('seriesTableRow')
        if (rows) {
          for (var i=0; i<rows.length; i++) {
            if (i % 2 === 0) {
              rows[i].style.backgroundColor = '#383838'
            } else {
              rows[i].style.backgroundColor = '#323232'
            }
          }
        }
        document.getElementsByClassName('pacs-footer')[0].style.backgroundColor = '#696969'
      },
      upOneLevelClicked () {
        this.pageNum = 1
        this.selectedStudyRow = -1
        this.selectedSeriesRow = -1
        this.viewPositionCenter()
        this.resetTableLayout()
      },
      tableRowClicked(anIndex) {
        this.clicks++
        if(this.clicks === 1) {
          var self = this
          this.timer = setTimeout(function() {
            self.drawSelectedTableRow(anIndex)
            self.clicks = 0
          }, this.delay);
        } else{
          clearTimeout(this.timer);
          this.drawSelectedTableRow(anIndex)
          this.footerButtonClicked()
          this.clicks = 0;
        }
      },
      drawSelectedTableRow(anIndex) {
        var selectedRow
        this.viewPositionCenter()
        this.resetTableLayout()
        if (this.pageNum === 1) {
          selectedRow = document.getElementById(`studyTableRow${anIndex}`)
          selectedRow.style.backgroundColor = '#373e6b'
          this.selectedStudyRow = anIndex
        } else if (this.pageNum === 2) {
          selectedRow = document.getElementById(`seriesTableRow${anIndex}`)
          selectedRow.style.backgroundColor = '#373e6b'
          this.selectedSeriesRow = anIndex
        }
        document.getElementsByClassName('pacs-footer')[0].style.backgroundColor = '#583edb'
      },
      footerButtonClicked () {
        if (this.pageNum === 1) {
          if (this.selectedStudyRow < 0) {
            alert('Please select a study.')
            return
          }
          this.selectedStudyRow = -1
          this.pageNum = 2
          this.resetTableLayout()
          this.viewPositionCenter()
        } else if (this.pageNum === 2) {
          if (this.selectedSeriesRow < 0) {
            alert('Please select a series.')
            return
          }
          console.log(this.series[this.selectedSeriesRow])
          this.downloadDicomZip(this.series[this.selectedSeriesRow])
          this.$bus.$emit(busType.SHOW_PACS_POPUP, false)
        }
      },
      downloadDicomZip(item) {
        axios({
          url: item.fileURL,
          method: 'GET',
          responseType: 'blob', // important
        }).then((response) => {
          const contentType = 'application/zip'
          var downloadedFile = new File([response.data], `${item.fileName}.zip`, {type: contentType})
          console.log(downloadedFile)
          this.$bus.$emit(busType.FILE_UPLOADED, downloadedFile)
        })
      },
      closePopup (e) {
        this.$bus.$emit(busType.SHOW_PACS_POPUP, false)
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

  /* width */
  ::-webkit-scrollbar {
    width: 10px;
  }

  /* Track */
  ::-webkit-scrollbar-track {
    background: #282828;
  }

  /* Handle */
  ::-webkit-scrollbar-thumb {
    background: #555;
  }

  /* Handle on hover */
  ::-webkit-scrollbar-thumb:hover {
    background: #888;
  }

  .pacs-popup-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    opacity: 0.6;
    background-color: #000000;
  }

  .pacs-popup {
    box-shadow: 5px 5px 30px black;
    border-radius: 5px;

    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;

    .pacs-popup-inner {
      width: 100%;
      height: 100%;
      background-color: #282828;
      border-radius: 5px;
      overflow: hidden;
      border-radius: 5px;

      .pacs-header {
        padding-left: 15px;
        width: 100%;
        height: 48px;
        border-bottom: 2px solid #1e1e1e;

        span {
          position: relative;
          top: 10px;
          font-size: 15px;
          vertical-align: middle;
          color: #e3e3e3;
          font-weight: bold;
        }

        img {
          vertical-align: middle;
          margin-right: 0;
          width: 48px;
          height: 48px;
          float: right;

          &:hover {
            cursor: pointer;
            background-color: $button-over-color;
          }
        }
      }

      .pacs-body {
        position: absolute;
        width: 100%;
        top: 48px;
        bottom: 60px;
        background-color: #282828;
        overflow-y: auto;
        overflow-x: hidden;
        border-bottom-left-radius: 5px;
        border-bottom-right-radius: 5px;
        cursor: default;

        .up-one-level {
          width: 100%;
          height: 48px;
          background-color: #1e1e1e;
          &:hover {
            cursor: pointer;
            background-color: $button-over-color;
          }

          span {
            height: 48px;
            margin-left: 26px;
            line-height: 48px;
            font-family: AppleSDGothicNeo;
            font-size: 15px;
            font-weight: bold;
            font-style: normal;
            font-stretch: normal;
            letter-spacing: normal;
            color: #ffffff;
          }
        }

        table {
          position: relative;
          width: 100%;
          table-layout: fixed;
          border: 2px solid #282828;
          border-radius: 3px;
        }

        tr {
          &:nth-child(odd) {
            background-color: #383838;
          }
          &:nth-child(even) {
            background-color: #323232;
          }
          &:hover {
            cursor: pointer;
            background-color: $button-over-color;
          }
          &:active {
            cursor: pointer;
            background-color: #373e6b;
          }
        }
        /*tr.active {*/
          /*background-color: #373e6b;*/
        /*}*/

        th {
          background-color: #282828;
          color: #696969;
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }

        td {
          overflow: hidden;
          text-overflow: ellipsis;
          color: #ffffff;
          span {
            white-space: nowrap;
            font-family: AppleSDGothicNeo;
            font-size: 18px;
            font-weight: bold;
            font-style: normal;
            font-stretch: normal;
            letter-spacing: normal;
            color: #ffffff;
          }
        }

        th, td {
          padding: 10px 20px;
        }
      }

      .pacs-footer {
        position: absolute;
        bottom: 0;
        width: 100%;
        height: 60px;
        background-color: #696969;
        border-bottom-left-radius: 5px;
        border-bottom-right-radius: 5px;
        text-align: center;

        &:hover {
          cursor: pointer;
        }

        span {
          line-height: 60px;
          font-family: AppleSDGothicNeo;
          font-size: 15px;
          font-weight: 800;
          font-style: normal;
          font-stretch: normal;
          letter-spacing: normal;
          text-align: center;
          color: #ffffff;
        }
      }
    }
  }
</style>
