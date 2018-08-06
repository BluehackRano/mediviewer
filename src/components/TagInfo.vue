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
    <div class="tags-bottom">
      <div class="tags-bottom-inner"
           v-if="sliceNum">
        {{sliceNum}}/256
      </div>
    </div>
    <template v-if="canvasId">
      <template v-if="canvasId === 'layout-1-2' || canvasId === 'layout-2-2'">
        <div class="left-bottom">
          <div class="left-bottom-inner"
               v-if="sliceNum">
            <template v-if="flip === true">
              {{ left }}
            </template>
            <template v-else-if="flip === false">
              {{ right }}
            </template>
          </div>
        </div>
        <div class="right-bottom">
          <div class="right-bottom-inner"
               v-if="sliceNum">
            <template v-if="flip === true">
              {{ right }}
            </template>
            <template v-else-if="flip === false">
              {{ left }}
            </template>
          </div>
        </div>
      </template>
    </template>
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
      },
      canvasId: {
        type: String,
        default: null
      }
    },
    computed: {
      ...mapGetters([
        'tagInfo',
        'focusedCanvas'
      ])
    },
    data () {
      return {
        flip: true,
        left: 'L',
        right: 'R'
      }
    },
    created () {
      this.$bus.$on(busType.FILE_UPLOADED, this.dicomFileUploaded)
      this.$bus.$on(busType.FLIP_HORIZONTAL, this.flipHorizontal)
      this.$bus.$on(busType.RESET_TAG_INFO, this.resetTagInfo)
    },
    methods: {
      resetTagInfo () {
        this.flip = true
      },
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
      },
      flipHorizontal () {
        console.log(this.canvasId)
        console.log(this.flip)
        if (this.canvasId === this.focusedCanvas.id) {
          this.flip = !this.flip
        }
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

  .tags-bottom {
    position: absolute;
    left: 0;
    bottom: 30px;
    width: 100%;
    height: 40%;
    color: #cfcfcf;

    .tags-bottom-inner {
      position: absolute;
      width: 100%;
      bottom: 0;
      text-align: center;
    }
  }

  .left-bottom {
    position: absolute;
    left: 30px;
    bottom: 30px;
    width: 40%;
    height: 40%;
    color: #cfcfcf;

    .left-bottom-inner {
      position: absolute;
      width: 100%;
      bottom: 0;
      text-align: left;
      font-family: AppleSDGothicNeo;
      font-size: 15px;
      font-weight: 800;
      font-style: normal;
      font-stretch: normal;
      letter-spacing: normal;
      color: #4a90e2;
    }
  }

  .right-bottom {
    position: absolute;
    right: 30px;
    bottom: 30px;
    width: 40%;
    height: 40%;
    color: #cfcfcf;

    .right-bottom-inner {
      position: absolute;
      width: 100%;
      bottom: 0;
      text-align: right;
      font-family: AppleSDGothicNeo;
      font-size: 15px;
      font-weight: 800;
      font-style: normal;
      font-stretch: normal;
      letter-spacing: normal;
      color: #4a90e2;
    }
  }

  span {
    white-space: nowrap;
  }
</style>
