<template>
  <section class="hero is-bold app-navbar">

    <div class="hero-head">

      <div class="nav-load-file-area">
        <b-field class="nav-load-file-b-field">
          <b-upload v-model="files" accept=".zip" @change.native="fileUploaded">
            <a class="button nav-load-file-button">
              <img src="/static/images/icons/img-nor-over-open-dicom.svg">
              <span>Load Dicom file</span>
            </a>
          </b-upload>
        </b-field>

        <span class="nav-load-file-label">
          <template v-if="files && files.length">&nbsp; | &nbsp;Dicom : {{ files[0].name }}</template>
          <template v-if="segmentationFile">&nbsp; | &nbsp;Segmentation : {{ segmentationFile.name }}</template>
        </span>
      </div>

      <!--<b-field style="position: fixed; left: 260px; top: 0; height: 52px; width: 250px; z-index: 1025;">-->
        <!--<b-upload v-model="files" accept=".zip" @change.native="loadSegmetation">-->
          <!--<a class="button is-white" style="width: 100%; height: 100%;">-->
            <!--<img src="/static/sample/imgs/folder_open.png" style="width: 24px; height: 24px; top: 0; left: 0;">-->
            <!--&nbsp;<span>Load Segmentation</span>-->
          <!--</a>-->
        <!--</b-upload>-->
      <!--</b-field>-->

      <nav class="nav">
        <div class="nav-left">
          <img src="/static/images/logos/img-logo-vuno.svg">
          <!--<router-link @click.native="logoClicked" to="/" class="nav-item hero-brand" style="cursor: none">-->
            <!--<a style="height: 40px">-->
              <!--<img src="/static/images/logos/img-logo-vuno.svg">-->
            <!--</a>-->
          <!--</router-link>-->
        </div>

        <div class="nav-right">
          <a class="button nav-help-button"
             @click="helpButtonClicked">
            Help
          </a>
        </div>
      </nav>

    </div>
  </section>
</template>

<script>
  import * as busType from '@/util/bus/bus-types'

  export default {
    name: 'AppHeader',
    data () {
      return {
        files: null,
        segmentationFile: null
      }
    },
    created () {
      this.$bus.$on(busType.FILE_UPLOADED_SEG, this.segmentationFileUploaded)
    },
    methods: {
      logoClicked () {
        this.$router.go('/')
      },
      fileUploaded () {
        this.$bus.$emit(busType.FILE_UPLOADED_SEG, null)
        this.$bus.$emit(busType.FILE_UPLOADED, this.files[0])
      },
      loadSegmetation () {
//        this.$bus.$emit(busType.FILE_UPLOADED_SEG, this.files[0])
      },
      segmentationFileUploaded (segmentationFile) {
        this.segmentationFile = segmentationFile
      },
      helpButtonClicked () {
        this.$bus.$emit(busType.SHOW_HELP_POPUP, null)
      }
    }
  }
</script>

<style lang="scss" scoped>
  @import "../../style/bh_style.scss";

  .app-navbar {
    position: fixed;
    width: 100%;
    z-index: 1024;
    background-color: $header-bg-color;
    font-weight: bold;
  }

  .hero .nav {
    height: $header-height;
    box-shadow: none;
  }

  .hero-head {
    height: $header-height;
  }

  .nav-item img {
    max-height: 100%;
  }

  .nav-left {
    img {
      margin-left: 14px;
      pointer-events: none;

      -webkit-touch-callout: none;
      -webkit-user-select: none;
      -khtml-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
    }
  }

  .nav-load-file-area {
    position: fixed;
    left: $sidebar-width;
    z-index: 1025;
    display: inline;
  }
  .nav-load-file-b-field {

  }
  .nav-load-file-button {
    margin-top: 20px;
    padding: 0 15px 0 0;
    width: 172px;
    height: 40px;
    background-color: $header-load-file-button-normal-color;
    color: $header-load-file-button-normal-label-color;
    border: none;

    span {
      font-size: 15px;
    }

    &:hover {
      background-color: #4c456d;
    }

    &:active {
      background-color: #27305e;
    }
  }
  .nav-load-file-label {
    margin-left: 177px;
    margin-top: 30px;
    top: 0px;
    width: 800px;
    height: 20px;
    font-size: 15px;
    color: white;
    position: absolute;
  }

  .nav-help-button {
    width: 80px;
    height: 80px;
    background-color: $header-help-button-normal-color;
    color: $header-help-button-normal-label-color;
    border: none;

    &:hover {
      background-color: #4c456d;
    }
  }
</style>
