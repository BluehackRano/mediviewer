<template>
  <vue-draggable-resizable
    class="seg-popup"
    :parent="true"
    :x="250" :y="125" :z="2000"
    :w="350" :h="500"
    :minw="350" :minh="500">
    <div class="seg-popup-inner">
      <div class="seg-header">
        <span>Segmentation Result Overay</span>
        <img src="/static/images/icons/svg/btn-close-nor.svg"
          @click="closePopup"
          @mousedown="stopMovable">
      </div>
      <div class="seg-list">
        <div class="seg-list-item"
          v-for="(segmentation, index) in segmentations"
          >
          <div class="seg-list-item-inner"
            :class="[{ even: index % 2 == 0 }, { selected: segmentation.selected }]"
            @click="segmentationItemClicked($event, index, segmentation)"
            @mousedown="stopMovable">
            <img v-show="segmentation.visible" :src="`/static/images/icons/svg/btn-check-checkbox.svg`"
                 @click="setSegmentationVisible($event, index, segmentation)">
            <img v-show="segmentation.visible === false" :src="`/static/images/icons/svg/btn-uncheck-checkbox.svg`"
                 @click="setSegmentationVisible($event, index, segmentation)">
            <span>{{ segmentation.meta.label }}</span>
            <div class="seg-color"
              :style="{ backgroundColor: segmentation.meta.color }"
              ></div>
          </div>
        </div>
      </div>
      <div class="seg-footer">
        <div class="show-all"
             @click="segmentationToggleAll(true)">
          <span>Show All</span>
        </div>
        <div class="divider"></div>
        <div class="hide-all"
             @click="segmentationToggleAll(false)">
          <span>Hide All</span>
        </div>
      </div>
    </div>
  </vue-draggable-resizable>
</template>

<script>
  import {mapGetters, mapActions} from 'vuex'
  import * as busType from '@/util/bus/bus-types'

  export default {
    name: 'SegmentationPopup',
    computed: {
      ...mapGetters({
        segmentations: 'segmentations'
      })
    },
    methods: {
      ...mapActions([
        'segmentationVisibleToggle',
        'segmentationSelectedToggle',
        'segmentationToggleAll'
      ]),
      closePopup (e) {
        this.$bus.$emit(busType.SHOW_SEGMENTATION_POPUP, false)
        e.stopPropagation()
      },
      stopMovable (e) {
        e.stopPropagation()
      },
      segmentationItemClicked (event, index, segmentation) {
        this.segmentationSelectedToggle({
          index: index,
          selected: !segmentation.selected
        })
        event.stopPropagation()
      },
      setSegmentationVisible (event, index, segmentation) {
//        console.log(`segmentationToggle : ${index}`)
        this.segmentationVisibleToggle({
          index: index,
          visible: !segmentation.visible
        })
        event.stopPropagation()
      }
    }
  }
</script>

<style lang="scss" scoped>
  @import "../../style/bh_style.scss";

  .seg-popup {
    box-shadow: 5px 5px 30px black;
    border-radius: 5px;

    .seg-popup-inner {
      width: 100%;
      height: 100%;
      background-color: #282828;
      border-radius: 5px;
      overflow: hidden;

      .seg-header {
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

      .seg-list {
        position: absolute;
        width: 100%;
        top: 48px;
        bottom: 50px;
        background-color: #383838;
        overflow-y: auto;
        overflow-x: hidden;
        border-bottom-left-radius: 5px;
        border-bottom-right-radius: 5px;

        .seg-list-item {
          width: 100%;
          height: 50px;

          .seg-list-item-inner {
            margin: 0 1px;
            width: 100%;
            height: 48px;
            border-radius: 5px;
            background-color: #383838;

            img {
              margin-left: 5px;
              vertical-align: middle;
            }
            span {
              position: relative;
              display: inline-block;
              max-width: 60%;
              color: white;
              vertical-align: middle;
            }
            div.seg-color {
              position: absolute;
              margin-top: 20px;
              width: 54px;
              height: 8px;
              right: 32px;
              /*background-color: orange;*/
              display: inline;
              border-radius: 5px;
            }

            &:hover {
              cursor: pointer;
              background-color: $button-over-color;
            }
            &:active {
              cursor: pointer;
              background-color: $button-press-color;
            }
          }
          .seg-list-item-inner.even {
            background-color: #323232;

            &:hover {
              cursor: pointer;
              background-color: $button-over-color;
            }
            &:active {
              cursor: pointer;
              background-color: $button-press-color;
            }
          }
          .seg-list-item-inner.selected {
            background-color: $button-select-color;

            &:hover {
              cursor: pointer;
              background-color: $button-over-color;
            }
            &:active {
              cursor: pointer;
              background-color: $button-press-color;
            }
          }
        }
      }

      .seg-footer {
        position: absolute;
        bottom: 0;
        width: 100%;
        height: 50px;
        background-color: #696969;
        border-bottom-left-radius: 5px;
        border-bottom-right-radius: 5px;

        .show-all {
          position: absolute;
          width: 50%;
          height: 50px;
          border-bottom-left-radius: 5px;
          background-color: #696969;
          text-align: center;
          cursor: pointer;
          color: #ffffff;

          &:hover {
            color: #383838;
          }

          span {
            line-height: 50px;
            font-family: AppleSDGothicNeo;
            font-size: 15px;
            font-weight: bold;
            letter-spacing: 0;
          }
        }

        .hide-all {
          position: absolute;
          left: 50%;
          width: 50%;
          height: 50px;
          border-bottom-right-radius: 5px;
          background-color: #696969;
          text-align: center;
          cursor: pointer;
          color: #ffffff;

          &:hover {
            color: #383838;
          }

          span {
            line-height: 50px;
            font-family: AppleSDGothicNeo;
            font-size: 15px;
            font-weight: bold;
            letter-spacing: 0;
          }
        }

        .divider {
          position: absolute;
          left: 50%;
          margin-left: -1px;
          margin-top: 7px;
          width: 2px;
          height: 35px;
          background-color: #4d4d4d;
          text-align: center;
        }
      }

      /* width */
      ::-webkit-scrollbar {
        width: 10px;
      }

      /* Track */
      ::-webkit-scrollbar-track {
        background: #3b3a40;
      }

      /* Handle */
      ::-webkit-scrollbar-thumb {
        background: #696969;
        border-radius: 10px;
      }

      /* Handle on hover */
      ::-webkit-scrollbar-thumb:hover {
        background: #555;
        border-radius: 10px;
        cursor: pointer;
      }

      -webkit-touch-callout: none;
      -webkit-user-select: none;
      -khtml-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
    }
  }
</style>
