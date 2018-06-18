<template>
  <div v-if="tagInfo">
    <div class="tags-left-top">
      <span>Study ID : {{ tagInfo.studyId }}</span><br>
      <span>Study date : {{ tagInfo.studyDate }}</span><br>
      <span>Patient's name : {{ tagInfo.patientName }}</span><br>
      <span>Patient ID : {{ tagInfo.patientId }}</span><br>
      <span>Patient sex : {{ tagInfo.patientSex }}</span><br>
      <span>Patient's birth date : {{ tagInfo.patientBirthDate }}</span><br>
    </div>
    <div class="tags-right-top">
      <span>Field strength : {{ tagInfo.fieldStrength }}</span><br>
      <span>Scanning sequence : {{ tagInfo.scanningSequence }}</span><br>
      <span>TR : {{ tagInfo.repetitionTime }}</span><br>
      <span>TE : {{ tagInfo.echoTime }}</span><br>
      <span>Flip angle : {{ tagInfo.flipAngle }}</span><br>
      <span>Image dimensions (Y, Z, X) : </span><br><span>{{ tagInfo.imageDimensions }}</span><br>
      <span>Voxel dimensions (Y, Z, X) : </span><br><span>{{ tagInfo.voxelDimensions }}</span><br>
    </div>
    <div class="tags-left-bottom">
      <div class="tags-left-bottom-inner"
           v-if="sliceNum">
        {{sliceNum}}/256
      </div>
    </div>
  </div>
</template>

<script>
  import {mapGetters} from 'vuex'

  import * as busType from '@/util/bus/bus-types'
//  import * as tagType from '@/data/tags'

  export default {
    name: 'TagInfo',
    props: {
      sliceNum: {
        type: Number,
        default: null
      }
    },
    computed: {
      ...mapGetters([
        'tagInfo'
      ])
    },
    data () {
      return {
      }
    },
    created () {
      this.$bus.$on(busType.FILE_UPLOADED, this.dicomFileUploaded)
    },
    methods: {
      dicomFileUploaded (dicomFile) {
//        switch (dicomFile.name) {
//          case 'dicom-001-02.zip':
//            this.tagData = tagType.TAG_001_02
//            break
//          case 'dicom-002-02.zip':
//            this.tagData = tagType.TAG_002_02
//            break
//          case 'dicom-003-02.zip':
//            this.tagData = tagType.TAG_003_02
//            break
//          case 'dicom-004-02.zip':
//            this.tagData = tagType.TAG_004_02
//            break
//          case 'dicom-005-02.zip':
//            this.tagData = tagType.TAG_005_02
//            break
//          default:
//            break;
//        }
      }
    }
  }
</script>

<style lang="scss" scoped>
  .tags-left-top {
    position: absolute;
    left: 30px;
    top: 30px;
    width: 40%;
    height: 40%;
    text-align: left;
    color: #cfcfcf;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .tags-right-top {
    position: absolute;
    top: 30px;
    right: 30px;
    width: 50%;
    height: 40%;
    text-align: right;
    color: #cfcfcf;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .tags-left-bottom {
    position: absolute;
    left: 30px;
    bottom: 30px;
    width: 40%;
    height: 40%;
    text-align: left;
    color: #cfcfcf;

    .tags-left-bottom-inner {
      position: absolute;
      bottom: 0;
    }
  }

  span {
    white-space: nowrap;
  }
</style>
