<template>
  <div id="app-content-area">
    <sidebar></sidebar>
    <section class="viewer-area">
      <div class="container is-fluid is-marginless app-content">

        <div class="layout-area">
          <div id="layout-1-1" class="layouts"
               ref="layout1By1"
               v-if="currentLayout.name === '1By1' || currentLayout.name === '2By2' || currentLayout.name === '3By'"
               :class="{ active: $refs.layout1By1 === focusedCanvas }"
               :style="layout_1_1.style"
               @mousemove="onMouseMove"
               @mousedown.left="mousedownLeft"
               @mousedown.middle="mousedownMiddle"
               @mousedown.right="mousedownRight"
               @mouseup.left="mouseupLeft"
               @mouseup.middle="isMouseDown = false, mouseLastPosition = {}"
               @mouseup.right="isMouseDown = false, mouseLastPosition = {}"
               @mouseenter="isMouseDown = false, mouseLastPosition = {}"
               @mouseleave="isMouseDown = false, mouseLastPosition = {}"
               @mouseout="isMouseDown = false, mouseLastPosition = {}"
          >
            <tag-info
              class="tags-info-view"
              v-show="showTags"
            ></tag-info>

            <div class="loading-spinner-dimmed-view"
                 v-if="loadingSpinner.loading"
                 @mousedown="$event.stopPropagation()"
            >
              <clip-loader
                :loading="loadingSpinner.loading"
                :color="loadingSpinner.color"
                :size="loadingSpinner.size"
              ></clip-loader>
            </div>
          </div>

          <div id="layout-1-2" class="layouts"
               ref="layout1By2"
               v-show="currentLayout.name === '2By2' || currentLayout.name === '3By'"
               :class="{ active: $refs.layout1By2 === focusedCanvas }"
               :style="layout_1_2.style"
               @mousemove="onMouseMove"
               @mousedown.left="mousedownLeft"
               @mousedown.middle="mousedownMiddle"
               @mousedown.right="mousedownRight"
               @mouseup.left="mouseupLeft"
               @mouseup.middle="isMouseDown = false, mouseLastPosition = {}"
               @mouseup.right="isMouseDown = false, mouseLastPosition = {}"
               @mouseenter="isMouseDown = false, mouseLastPosition = {}"
               @mouseleave="isMouseDown = false, mouseLastPosition = {}"
               @mouseout="isMouseDown = false, mouseLastPosition = {}"
          >
            <tag-info
              class="tags-info-view"
              v-show="showTags"
              :sliceNum="slice_r1"
              :canvasId="'layout-1-2'"
            ></tag-info>

            <div class="loading-spinner-dimmed-view"
                 v-if="loadingSpinner.loading"
                 @mousedown="$event.stopPropagation()"
            >
              <clip-loader :loading="loadingSpinner.loading" :color="loadingSpinner.color"
                           :size="loadingSpinner.size"></clip-loader>
            </div>
          </div>
          <div id="layout-2-1" class="layouts"
               ref="layout2By1"
               v-show="currentLayout.name === '2By2' || currentLayout.name === '3By'"
               :class="{ active: $refs.layout2By1 === focusedCanvas }"
               :style="layout_2_1.style"
               @mousemove="onMouseMove"
               @mousedown.left="mousedownLeft"
               @mousedown.middle="mousedownMiddle"
               @mousedown.right="mousedownRight"
               @mouseup.left="mouseupLeft"
               @mouseup.middle="isMouseDown = false, mouseLastPosition = {}"
               @mouseup.right="isMouseDown = false, mouseLastPosition = {}"
               @mouseenter="isMouseDown = false, mouseLastPosition = {}"
               @mouseleave="isMouseDown = false, mouseLastPosition = {}"
               @mouseout="isMouseDown = false, mouseLastPosition = {}"
          >
            <tag-info
              class="tags-info-view"
              v-show="showTags"
              :sliceNum="slice_r2"
            ></tag-info>

            <div class="loading-spinner-dimmed-view"
                 v-if="loadingSpinner.loading"
                 @mousedown="$event.stopPropagation()"
            >
              <clip-loader :loading="loadingSpinner.loading" :color="loadingSpinner.color"
                           :size="loadingSpinner.size"></clip-loader>
            </div>
          </div>

          <div id="layout-2-2" class="layouts"
               ref="layout2By2"
               v-show="currentLayout.name === '2By2' || currentLayout.name === '3By'"
               :class="{ active: $refs.layout2By2 === focusedCanvas }"
               :style="layout_2_2.style"
               @mousemove="onMouseMove"
               @mousedown.left="mousedownLeft"
               @mousedown.middle="mousedownMiddle"
               @mousedown.right="mousedownRight"
               @mouseup.left="mouseupLeft"
               @mouseup.middle="isMouseDown = false, mouseLastPosition = {}"
               @mouseup.right="isMouseDown = false, mouseLastPosition = {}"
               @mouseenter="isMouseDown = false, mouseLastPosition = {}"
               @mouseleave="isMouseDown = false, mouseLastPosition = {}"
               @mouseout="isMouseDown = false, mouseLastPosition = {}"
          >
            <tag-info
              class="tags-info-view"
              v-show="showTags"
              :sliceNum="slice_r3"
              :canvasId="'layout-2-2'"
            ></tag-info>

            <div class="loading-spinner-dimmed-view"
                 v-if="loadingSpinner.loading"
                 @mousedown="$event.stopPropagation()"
            >
              <clip-loader :loading="loadingSpinner.loading" :color="loadingSpinner.color"
                           :size="loadingSpinner.size"></clip-loader>
            </div>
          </div>
        </div>
      </div>

      <VuePageVisibility @documentInactive="documentInactive" @documentActive="documentActive" ></VuePageVisibility>
    </section>
  </div>
</template>

<script>
  import {mapState, mapGetters, mapActions} from 'vuex'
  import VuePageVisibility from 'vue-page-visibility-awesome'

  import * as mutationType from '@/store/mutation-types'
  import * as busType from '@/util/bus/bus-types'

  import * as Medic3D from '@/lib/medic3d/'

  import Sidebar from '@/components/layout/Sidebar'
  import ClipLoader from '@/components/lib/ClipLoader'
  import TagInfo from '@/components/TagInfo'

  export default {
    name: 'DicomViewer',
    components: {
      VuePageVisibility,
      Sidebar,
      ClipLoader,
      TagInfo
    },
    computed: {
      ...mapState({
        currentLayout: 'currentLayout',
        currentMenu: 'currentMenu',
        focusedCanvas: 'focusedCanvas',
        showTags: 'showTags'
      }),
      ...mapGetters([
        'showAnalysisReportPopup',
        'menus'
      ])
    },
    data () {
      return {
        uploadedFile: null,
        layout_1_1: {},
        layout_1_2: {},
        layout_2_1: {},
        layout_2_2: {},
        mouseLastPosition: {},
        mouseTimer: null,
        mousemove_ok: true,
        isMousedown: false,
        dicomfiles: null,
        r0: {},
        mode: null,
        loadingSpinner: {
          loading: false,
          color: '#cfcfcf',
          size: '50px'
        },
        widgets: [],
        slice_r1: 122,    // temporary
        slice_r2: 122,    // temporary
        slice_r3: 122,    // temporary
        dicom_name: null,
        baseURI: 'http://210.116.109.40:3000'
      }
    },
    created () {
      this.$bus.$on(busType.MENU_CLICKED, this.menuClicked)
      this.$bus.$on(busType.FILE_UPLOADED, this.setUploadedFile)
      this.$bus.$on(busType.FILE_UPLOADED_SEG, this.loadSegmentation)
      this.$bus.$on(busType.MASK_OPACITY_CHANGED, this.maskOpacityChanged)
      this.$bus.$on(busType.SET_MASK_VISIBILITY, this.maskVisibilityChanged)

      this.mouseTimer = setInterval(() => {
        this.mousemove_ok = true
      }, 100)
    },
    mounted () {
//      console.log('### Mounted');
      this.initLayouts()
    },
    methods: {
      ...mapActions([
        'showAnalysisReportPopupToggle'
      ]),
      documentInactive(){
        console.log("documentInactive")
        Medic3D.pause()
      },
      documentActive(){
        console.log("documentActive")
        Medic3D.resume()
      },
      setUploadedFile (uploadedFile) {
//        console.log('setUploadedFile')
        var temp = uploadedFile.name.split('.');
        this.dicom_name = temp[0];
        this.$store.commit(mutationType.SET_SHOW_TAGS, false)
        this.loadingSpinner.loading = true
        this.uploadedFile = uploadedFile
        Medic3D.loadZip(uploadedFile, this.eventDispatcher)
          .then((state) => {
            // to need more time for rendering
//            console.log('Load completed~~~~~~`');
            this.loadingSpinner.loading = false
            this.$store.commit(mutationType.SET_SHOW_TAGS, true)

            this.parseDicomTags()

            this.setLayoutsSize()
          })
          .catch((err) => {
            console.log('An error : ' + err);
            this.loadingSpinner.loading = false
          })
        Medic3D.init();
        // disable view control
        Medic3D.CameraCtrl(false);
      },
      loadSegmentation (uploadFile) {
        this.loadingSpinner.loading = true
        window.setTimeout(() => {
          this.loadingSpinner.loading = false
        }, 5000)
//        console.log(uploadFile);

        Medic3D.loadSegmentation(uploadFile, true);
        // Todo : assign (slice, segmentation)
      },
      initLayouts () {
        this.setLayoutsWithMenuName({name: '2By2'});
      },
      setLayoutsWithMenuName (layout) {
        if (layout.name === '1By1') {
          this.$store.commit('SET_LAYOUT_TYPE', layout)

          this.layout_1_1.style = {
            top: 0,
            left: 0,
            right: 0,
            bottom: 0
          }
        } else if (layout.name === '2By2') {
          this.$store.commit('SET_LAYOUT_TYPE', layout)

          this.layout_1_1.style = {
            top: 0,
            left: 0,
            right: '50%',
            bottom: '50%'
          }
          this.layout_1_2.style = {
            top: 0,
            left: '50%',
            right: 0,
            bottom: '50%'
          }
          this.layout_2_1.style = {
            top: '50%',
            left: 0,
            right: '50%',
            bottom: 0
          }
          this.layout_2_2.style = {
            top: '50%',
            left: '50%',
            right: 0,
            bottom: 0
          }
        }
      },
      setLayoutsSize () {
        let canvas0 = document.getElementById('0')
        canvas0.style.width = '100%'
        canvas0.style.height = '100%'

        let dicomCanvas1 = document.getElementById('1')
        let maskCanvas11 = document.getElementById('11')
        let maskCanvas12 = document.getElementById('12')
        let maskCanvas13 = document.getElementById('13')
        let maskCanvas14 = document.getElementById('14')
        dicomCanvas1.style.width = '100%'
        dicomCanvas1.style.height = '100%'
        maskCanvas11.style.width = '100%'
        maskCanvas11.style.height = '100%'
        maskCanvas12.style.width = '100%'
        maskCanvas12.style.height = '100%'
        maskCanvas13.style.width = '100%'
        maskCanvas13.style.height = '100%'
        maskCanvas14.style.width = '100%'
        maskCanvas14.style.height = '100%'

        let dicomCanvas2 = document.getElementById('2')
        let maskCanvas21 = document.getElementById('21')
        let maskCanvas22 = document.getElementById('22')
        let maskCanvas23 = document.getElementById('23')
        let maskCanvas24 = document.getElementById('24')
        dicomCanvas2.style.width = '100%'
        dicomCanvas2.style.height = '100%'
        maskCanvas21.style.width = '100%'
        maskCanvas21.style.height = '100%'
        maskCanvas22.style.width = '100%'
        maskCanvas22.style.height = '100%'
        maskCanvas23.style.width = '100%'
        maskCanvas23.style.height = '100%'
        maskCanvas24.style.width = '100%'
        maskCanvas24.style.height = '100%'

        let dicomCanvas3 = document.getElementById('3')
        let maskCanvas31 = document.getElementById('31')
        let maskCanvas32 = document.getElementById('32')
        let maskCanvas33 = document.getElementById('33')
        let maskCanvas34 = document.getElementById('34')
        dicomCanvas3.style.width = '100%'
        dicomCanvas3.style.height = '100%'
        maskCanvas31.style.width = '100%'
        maskCanvas31.style.height = '100%'
        maskCanvas32.style.width = '100%'
        maskCanvas32.style.height = '100%'
        maskCanvas33.style.width = '100%'
        maskCanvas33.style.height = '100%'
        maskCanvas34.style.width = '100%'
        maskCanvas34.style.height = '100%'
      },
      menuClicked (menu) {
        if (menu.type === 'layout') {
          this.setLayoutsWithMenuName(menu)
        } else if (menu.type === 'select') {
          this.$store.commit(mutationType.SELECT_MENU, menu)
          this.doSelect(menu);
        } else if (menu.type === 'action') {
          // case
          // reference to /store/modules/menus/index.js가 전체 메뉴. menu.name.*** 형식으로 실제 선택/클릭 확인 가능
          this.$store.commit(mutationType.SELECT_MENU, menu)
          this.doAction(menu);
        }
//        console.log('Focused CANVAS : ')
//        console.log(this.focusedCanvas)
      },
      mouseOver (e) {
//        console.log(`MouseOver : `)
//        console.log(e.target)
      },
      onScroll (e) {
//        console.log('scrolling')
      },
      onMouseMove (event) {
        // Todo : prohibit event propagation
        this.doAnnotation(event);
        if (this.isMouseDown && this.mousemove_ok) {
          this.mousemove_ok = false
          if (typeof (this.mouseLastPosition.x) !== 'undefined') {
            var deltaX = this.mouseLastPosition.x - event.clientX
            var deltaY = this.mouseLastPosition.y - event.clientY
            if (Math.abs(deltaX) > Math.abs(deltaY) && deltaX > 0) {
              // left
//              console.log(`Left \ndeltaX : ${deltaX} / deltaY : ${deltaY}`)
            } else if (Math.abs(deltaX) > Math.abs(deltaY) && deltaX < 0) {
              // right
//              console.log(`Right \ndeltaX : ${deltaX} / deltaY : ${deltaY}`)
            } else if (Math.abs(deltaY) > Math.abs(deltaX) && deltaY > 0) {
              // up
//              console.log(`Up \ndeltaX : ${deltaX} / deltaY : ${deltaY}`)
            } else if (Math.abs(deltaY) > Math.abs(deltaX) && deltaY < 0) {
              // down
//              console.log(`Down \ndeltaX : ${deltaX} / deltaY : ${deltaY}`)
            }

            if (this.mode === 'BrightnessContrast' || this.mode === 'WindowLevel') {
//              console.log('adjust brightnesscontrast');
              Medic3D.adjustBrightness(deltaX);
            }
          }
          this.mouseLastPosition = {
            x: event.clientX,
            y: event.clientY
          }
        }
      },
      mousedownLeft (e) {
//        console.log('Left Mousedown')
        this.isMouseDown = true
        this.$store.commit(mutationType.SELECT_CANVAS, e.target.parentElement)
        this.doAnnotation(event);
      },
      mousedownMiddle (e) {
//        console.log('Middle Mousedown')
        this.isMouseDown = true
        this.$store.commit(mutationType.SELECT_CANVAS, e.target.parentElement)
      },
      mousedownRight (e) {
//        console.log('Right Mousedown')
        this.isMouseDown = true
        this.$store.commit(mutationType.SELECT_CANVAS, e.target.parentElement)
      },
      doAction (menu) {
        this.mode = null;

        let selectId = null;
//        if (!this.focusedCanvas) {
//          // unselected
//          return
//        } else {
//          if (this.focusedCanvas.id === null) {
//            // unselected
//            return
//          }
//          selectId = this.focusedCanvas.id;
//        }
        Medic3D.CameraCtrl(false);

        let fileName = null
        switch (menu.name) {

          case 'BrainRoiSegmentation':
//            console.log('#BrainRoiSegmentation')
            console.log(`baseURI: ${this.baseURI}`)
            fileName = null
            if (this.dicom_name) {
              fileName = this.dicom_name
            }
            if (!fileName) {
              alert('Error: No input Dicom file.')
              return
            }
            console.log(fileName)
            this.fetchBrainRoiSegmentation(fileName)
            break;
          case 'SegmentationResultOveray':
//            console.log('#SegmentationResultOveray')
            if (!Medic3D.getReports() || Medic3D.getReports().length === 0) {
              alert('Error: No segmentation data.')
              return
            }
            break;
          case 'AnalysisReport':
            if (!this.dicom_name) {
              alert('Error: No dicom data.')
              return
            }
            console.log(`fileid = ${this.dicom_name}.nii`)
            const reportUrl = 'http://210.116.109.40:3004/api/report?filename='
            window.open(`${reportUrl}${this.dicom_name}.nii`)
            // window.open(`${this.baseURI}/report?fileid=${this.dicom_name}.nii`)
//            if (!this.showAnalysisReportPopup) {
//              if (!Medic3D.getReports() || Medic3D.getReports().length === 0) {
//                alert('Error: No segmentation data.')
//                return
//              }
//              this.$store.commit(mutationType.SET_CHART_REPORTS, this.setChartImage())
//              this.captureDicomImage()
//              this.showAnalysisReportPopupToggle(!this.showAnalysisReportPopup)
//            }
            break;
          case 'OpenSegmentations':
//            console.log('#OpenSegmentations')
            console.log(`baseURI: ${this.baseURI}`)
            fileName = null
            if (this.dicom_name) {
              fileName = this.dicom_name
            }
            if (!fileName) {
              alert('Error: No input Dicom file.')
              return
            }
            console.log(fileName)
            this.fetchOpenSegmentations(fileName)
            break;
          case 'SaveAsDerived':
//            console.log('#SaveAsDerived')
            break;
          case 'Reload':
//            console.log('#Reload')
            break;
          case 'LoadAnnotation':
//            console.log('#LoadAnnotation')
            break;
          case 'Invert':
//            console.log('#Invert')
            Medic3D.Invert();
            break;

          /**
           * Selecting display needed.
           */
          case 'Expand':
            if (!this.focusedCanvas || !this.focusedCanvas.id) {
              alert('Please select a Display.')
              return
            }
            console.log('#Expand')
            selectId = this.focusedCanvas.id
            this.expandDisplay(selectId)
            break
          case 'Restore':
            if (!this.focusedCanvas || !this.focusedCanvas.id) {
              alert('Please select a Display.')
              return
            }
            console.log('#Restore')
            selectId = this.focusedCanvas.id
            this.expandDisplay(selectId)
            this.restoreDisplay(selectId)
            break
          case 'Horizontal':
            if (!this.focusedCanvas || !this.focusedCanvas.id) {
              alert('Please select a Display.')
              return
            }
            if (this.focusedCanvas.id === 'layout-1-1') {
              alert('Please select a Non-3D Display.')
              return
            }
            console.log('#Horizontal')
            this.$bus.$emit(busType.FLIP_HORIZONTAL)
            Medic3D.Horizontal(this.focusedCanvas.id);
            break
          case 'Vertical':
            if (!this.focusedCanvas || !this.focusedCanvas.id) {
              alert('Please select a Display.')
              return
            }
            if (this.focusedCanvas.id === 'layout-1-1') {
              alert('Please select a Non-3D Display.')
              return
            }
            Medic3D.Vertical(this.focusedCanvas.id);
            console.log('#Vertical')
            break
          case 'MaskOpacity':
            if (!this.focusedCanvas || !this.focusedCanvas.id) {
              alert('Please select a Display.')
              return
            }
            if (this.focusedCanvas.id === 'layout-1-1') {
              alert('Please select a Non-3D Display.')
              return
            }
            console.log('#MaskOpacity')
            if (!this.focusedCanvas.opacity) {
              if (state.focusedCanvas.opacity !== 0) {
                state.focusedCanvas.opacity = 100
              }
            }
            this.$store.commit(mutationType.SET_MASK_OPACITY, this.focusedCanvas.opacity)
            this.$bus.$emit(busType.SHOW_MASK_OPACITY_POPUP, true)
            break;
          case 'ZoomIn':
            if (!this.focusedCanvas || !this.focusedCanvas.id) {
              alert('Please select a Display.')
              return
            }
            if (this.focusedCanvas.id === 'layout-1-1') {
              alert('Please select a Non-3D Display.')
              return
            }
//            console.log('#ZoomIn')
            selectId = this.focusedCanvas.id
            Medic3D.Zoom(selectId, false);
            break;
          case 'ZoomOut':
            if (!this.focusedCanvas || !this.focusedCanvas.id) {
              alert('Please select a Display.')
              return
            }
            if (this.focusedCanvas.id === 'layout-1-1') {
              alert('Please select a Non-3D Display.')
              return
            }
//            console.log('#ZoomOut')
            selectId = this.focusedCanvas.id
            Medic3D.Zoom(selectId, true);
            break;
          case 'Fit':
            if (!this.focusedCanvas || !this.focusedCanvas.id) {
              alert('Please select a Display.')
              return
            }
            if (this.focusedCanvas.id === 'layout-1-1') {
              alert('Please select a Non-3D Display.')
              return
            }
//            console.log('#Fit')
            selectId = this.focusedCanvas.id
            Medic3D.Fit(selectId);
            break;
          case 'OneToOne':
//            console.log('#OneToOne')
            break;

          default:
//            console.log('#Unknow action menu')
        }
      },
      doSelect (menu) {
        this.mode = menu.name;
        Medic3D.CameraCtrl(false);
        switch (menu.name) {
          case 'Pan':
//            console.log('#Pan')
            Medic3D.CameraCtrl(true);
            break;
          case 'Stack':
//            console.log('#Stack')
            break;
          case 'WindowLevel':
//            console.log('#WindowLevel')
            break;
          case 'Ruler':
//            console.log('#Ruler')
            break;
          case 'PolyRuler':
//            console.log('#PolyRuler')
            break;
          case 'Protractor':
//            console.log('#Protractor')
            break;
          case 'BrightnessContrast':
//            console.log('#BrightnessContrast');
            break;
          default:
            this.mode = null;
        }
      },
      doToggle (menu) {
        switch (menu.name) {
          case 'ShowTagsToggle':
//            console.log('#ShowTagsToggle')
            break;
        }
      },
      eventDispatcher (event) {
        console.log(JSON.stringify(event, null, 2))
        switch (event.type) {
          case 'slice':
            this.updateSliceNo(event)
            break;
        }
      },
      updateSliceNo (event) {
        switch (event.view) {
          case 'r1':
            this.slice_r1 = event.slice
            break;
          case 'r2':
            this.slice_r2 = event.slice
            break;
          case 'r3':
            this.slice_r3 = event.slice
            break;
        }
      },
      mouseupLeft (event) {
        this.isMouseDown = false;
        this.mouseLastPosition = {}
        this.doAnnotation(event);
      },
      doAnnotation (event) {
        let selectId;
        if (!this.focusedCanvas) {
          // unselected
        } else {
          if (this.focusedCanvas.id === null) {
            // unselected
          }
          selectId = this.focusedCanvas.id;
        }
        switch (this.mode) {
          case 'Ruler':
          case 'PolyRuler':
          case 'Protractor':
            Medic3D.doAnnotation(selectId, this.mode, event);
            break;
          default:
//            console.log('Not Annotation mode');
        }
      },
      fetchBrainRoiSegmentation (fileName) {
        this.loadingSpinner.loading = true
        const formData = new FormData()
        const baseURI = this.baseURI
        const url = `http://${location.host}/static/nii/${fileName}.nii`
        fetch(url, { method: 'get' })
          .then(res => (console.log(res), res.blob()))
          .then(res => new File([res], `${fileName}.nii`))
          .then(res => formData.append('data', res))
          .then(res => {
            return fetch(
              `${baseURI}/analysis/nii/again`,
              { method: 'post', body: formData }
            )
          })
          .then(res => {
            this.$http.get(`${baseURI}/analysis/result/${fileName}.nii`)
              .then((result) => {
                if (result.data) {
                  if (result.data.is_completed) {
                    this.setReportState(result.data)
                    this.loadAutoSegmentation(result.data.download_url, fileName)
                  } else {
                    console.log('Loading ...')
                    let anInterval = setInterval(() => {
                      this.$http.get(`${baseURI}/analysis/result/${fileName}.nii`)
                        .then((result) => {
                          if (result.data) {
                            if (result.data.is_completed) {
                              clearInterval(anInterval)
                              console.log(result)
                              this.loadAutoSegmentation(result.data.download_url, fileName)
                              this.setReportState(result.data)
                            } else {
                              console.log('Polling for result data ...')
                            }
                          }
                        })
                        .catch((error) => {
                          this.loadingSpinner.loading = false
                        })
                    }, 10000)
                  }
                }
              })
              .catch((error) => {
                this.loadingSpinner.loading = false
              })
          })
          .catch((error) => {
            this.loadingSpinner.loading = false
          })
      },
      fetchOpenSegmentations (fileName) {
        this.loadingSpinner.loading = true
        this.fetchBrainRoiSegmentation(fileName)
        // this.fetchBrainRoiSegmentation(fileName)
        // this.loadAutoSegmentation(null, fileName)
//        const baseURI = this.baseURI
//        this.$http.get(`${baseURI}/analysis/result/${fileName}.nii`)
//          .then((result) => {
//            if (result.data) {
//              if (result.data.is_completed) {
//                console.log(result)
//                this.loadAutoSegmentation(result.data.download_url)
//                this.setReportState(result.data)
//              } else {
//                this.fetchBrainRoiSegmentation(fileName)
//              }
//            }
//          })
//          .catch((error) => {
//            this.loadingSpinner.loading = false
//          })
      },
      loadAutoSegmentation (url, fileName) {
       Medic3D.loadSegmentationLocal(url, fileName)
//        Medic3D.loadSegmentationLocal('http://210.116.109.38:20012/zip?fileid=' + fileId, true)
//        Medic3D.loadSegmentationLocal('http://' + location.host + '/static/org.zip', fileName)
          .then(() => {
            this.loadingSpinner.loading = false
          })
          .catch((error) => {
            this.loadingSpinner.loading = false
          });
      },
      setReportState (data) {
        this.$store.commit(mutationType.SET_REPORT, data)
      },
      parseDicomTags () {
        Medic3D.parseDicomTags()
          .then((parser) => {
            this.$store.commit(mutationType.SET_TAG_INFO, {
              studyId: parser.studyInstanceUID() || '-',
              studyDate: parser.studyDate() || '-',
              patientName: parser.patientName() || '-',
              patientId: parser.patientID() || '-',
              patientSex: parser.patientSex() || '-',
              patientBirthDate: parser.patientBirthdate() || '-',
              fieldStrength: parser.studyDate() || '-',
              scanningSequence: parser.studyDate() || '-',
              repetitionTime: parser.studyDate() || '-',
              echoTime: parser.studyDate() || '-',
              flipAngle: parser.studyDate() || '-',
              imageDimensions: parser.studyDate() || '-',
              voxelDimensions: parser.studyDate() || '-'
            })
          })
      },
      setChartImage () {
        var reports = [];
        for (let i = 0; i < Medic3D.getReports().length; i++) {
          let dat = Medic3D.getReports()[i] // reports[0];
          let base64 = btoa(String.fromCharCode(...new Uint8Array(dat)));
          reports.push('data:image/png;base64,' + base64)
        }
        return reports
      },
      captureDicomImage () {
        var canvas1 = document.getElementById('1')
        var dicomImage1 = canvas1.toDataURL()
        var segImage1 = this.getSegImageWithDicomCanvasId('1')

        var canvas2 = document.getElementById('2')
        var dicomImage2 = canvas2.toDataURL()
        var segImage2 = this.getSegImageWithDicomCanvasId('2')

        var canvas3 = document.getElementById('3')
        var dicomImage3 = canvas3.toDataURL()
        var segImage3 = this.getSegImageWithDicomCanvasId('3')

        this.$store.commit(mutationType.SET_CAPTURED_IMAGE, {
          layout1: {
            dicom: dicomImage1,
            seg: segImage1
          },
          layout2: {
            dicom: dicomImage2,
            seg: segImage2
          },
          layout3: {
            dicom: dicomImage3,
            seg: segImage3
          }
        })
      },
      getSegImageWithDicomCanvasId (anId) {
        if (anId === '1') {
          return this.getSegImageWithSegCanvasIdAndSliceNum(anId, this.slice_r1)
        } else if (anId === '2') {
          return this.getSegImageWithSegCanvasIdAndSliceNum(anId, this.slice_r2)
        } else if (anId === '3') {
          return this.getSegImageWithSegCanvasIdAndSliceNum(anId, this.slice_r3)
        }
        return null
      },
      getSegImageWithSegCanvasIdAndSliceNum (anId, sliceNum) {
        var segCanvas = null
        var segImage = null
        var segId
        if (sliceNum >= 0 && sliceNum < 64) {
          segId = anId.concat('1')
        } else if (sliceNum >= 64 && sliceNum < 128) {
          segId = anId.concat('2')
        } else if (sliceNum >= 128 && sliceNum < 192) {
          segId = anId.concat('3')
        } else if (sliceNum >= 192 && sliceNum < 256) {
          segId = anId.concat('4')
        }
        segCanvas = document.getElementById(segId)
        if (segCanvas) {
          segImage = segCanvas.toDataURL('image/png', 1.0)
        }
        return segImage
      },
      maskOpacityChanged () {
        let canvasId = this.focusedCanvas.id
        let dicomCanvas = null
        let maskCanvas1 = null
        let maskCanvas2 = null
        let maskCanvas3 = null
        let maskCanvas4 = null
        if (canvasId === 'layout-1-2') {
          dicomCanvas = document.getElementById('1')
          maskCanvas1 = document.getElementById('11')
          maskCanvas2 = document.getElementById('12')
          maskCanvas3 = document.getElementById('13')
          maskCanvas4 = document.getElementById('14')
        } else if (canvasId === 'layout-2-1') {
          dicomCanvas = document.getElementById('2')
          maskCanvas1 = document.getElementById('21')
          maskCanvas2 = document.getElementById('22')
          maskCanvas3 = document.getElementById('23')
          maskCanvas4 = document.getElementById('24')
        } else if (canvasId === 'layout-2-2') {
          dicomCanvas = document.getElementById('3')
          maskCanvas1 = document.getElementById('31')
          maskCanvas2 = document.getElementById('32')
          maskCanvas3 = document.getElementById('33')
          maskCanvas4 = document.getElementById('34')
        }

        if (dicomCanvas && maskCanvas1 && maskCanvas2 && maskCanvas3 && maskCanvas4) {
//          dicomCanvas.style.opacity = this.focusedCanvas.opacity / 100
          maskCanvas1.style.opacity = this.focusedCanvas.opacity / 100
          maskCanvas2.style.opacity = this.focusedCanvas.opacity / 100
          maskCanvas3.style.opacity = this.focusedCanvas.opacity / 100
          maskCanvas4.style.opacity = this.focusedCanvas.opacity / 100
        } else {
          console.log('No Masking Canvas !')
        }
      },
      maskVisibilityChanged (visibility) {
        console.log(visibility)
      },
      expandDisplay (selectId) {
        if (selectId === 'layout-1-1') {
          this.menus.forEach((value, index) => {
            if (value.name === 'DivideDisplay') {
              this.setLayoutsWithMenuName(this.menus[index].children[0])
              return
            }
          })
        } else {
          let layout_1_1 = document.getElementById('layout-1-1')
          let layout_1_2 = document.getElementById('layout-1-2')
          let layout_2_1 = document.getElementById('layout-2-1')
          let layout_2_2 = document.getElementById('layout-2-2')
          layout_1_1.style.visibility = 'hidden'
          layout_1_2.style.visibility = 'hidden'
          layout_2_1.style.visibility = 'hidden'
          layout_2_2.style.visibility = 'hidden'

          if (selectId === 'layout-1-2') {
            layout_1_2.style.visibility = 'visible'
            layout_1_2.style.top = 0
            layout_1_2.style.left = 0
            layout_1_2.style.right = 0
            layout_1_2.style.bottom = 0
          } else if (selectId === 'layout-2-1') {
            layout_2_1.style.visibility = 'visible'
            layout_2_1.style.top = 0
            layout_2_1.style.left = 0
            layout_2_1.style.right = 0
            layout_2_1.style.bottom = 0
          } else if (selectId === 'layout-2-2') {
            layout_2_2.style.visibility = 'visible'
            layout_2_2.style.top = 0
            layout_2_2.style.left = 0
            layout_2_2.style.right = 0
            layout_2_2.style.bottom = 0
          }
        }
      },
      restoreDisplay (selectId) {
        if (selectId === 'layout-1-1') {
          this.menus.forEach((value, index) => {
            if (value.name === 'DivideDisplay') {
              this.setLayoutsWithMenuName(this.menus[index].children[1])
              return
            }
          })
        } else {
          let layout_1_1 = document.getElementById('layout-1-1')
          let layout_1_2 = document.getElementById('layout-1-2')
          let layout_2_1 = document.getElementById('layout-2-1')
          let layout_2_2 = document.getElementById('layout-2-2')

          if (selectId === 'layout-1-2') {
            layout_1_2.style.visibility = 'visible'
            layout_1_2.style.top = 0
            layout_1_2.style.left = '50%'
            layout_1_2.style.right = 0
            layout_1_2.style.bottom = '50%'
          } else if (selectId === 'layout-2-1') {
            layout_2_1.style.visibility = 'visible'
            layout_2_1.style.top = '50%'
            layout_2_1.style.left = 0
            layout_2_1.style.right = '50%'
            layout_2_1.style.bottom = 0
          } else if (selectId === 'layout-2-2') {
            layout_2_2.style.visibility = 'visible'
            layout_2_2.style.top = '50%'
            layout_2_2.style.left = '50%'
            layout_2_2.style.right = 0
            layout_2_2.style.bottom = 0
          }
          layout_1_1.style.visibility = 'visible'
          layout_1_2.style.visibility = 'visible'
          layout_2_1.style.visibility = 'visible'
          layout_2_2.style.visibility = 'visible'
        }
      }
    }
  }
</script>

<style lang="scss" scoped>
  @import "../style/bh_style.scss";

  #app-content-area {
  }

  .viewer-area {
    padding: 0;
    padding-top: $header-height;
    padding-left: $sidebar-width;
    width: 100vw;
    height: 100vh;
    background-color: #000000;

    .app-content {
      height: 100%;

      .layout-area {
        margin: 0;
        right: 0;
        bottom: 0;
        width: 100%;
        height: 100%;

        .layouts {
          position: absolute;
          padding: 0;
          border: 3px solid #424242;
          background-color: $layouts-bg-color;
          overflow: hidden;
          /*display: none;*/

          .tags-info-view {
            position: absolute;
            width: 100%;
            height: 100%;
            z-index: 1999;
            pointer-events: none;

            -webkit-touch-callout: none;
            -webkit-user-select: none;
            -khtml-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
          }

          .loading-spinner-dimmed-view {
            position: absolute;
            width: 100%;
            height: 100%;
            background-color: black;
            opacity: 0.8;
            z-index: 1999;

            .v-spinner {
              position: absolute;
              left: 50%;
              bottom: 50%;
              margin-left: -25px;
              margin-bottom: -30px;
            }
          }
        }

        .active {
          border-color: #583edb;
        }
      }
    }
  }
</style>
