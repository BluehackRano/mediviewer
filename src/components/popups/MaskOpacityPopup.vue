<template>
  <vue-draggable-resizable
    class="mask-opacity-popup"
    :parent="true"
    :resizable="false"
    :x="0" :y="400" :z="2000"
    :w="242" :h="376">
    <div class="mask-opacity-popup-inner"
         v-if="maskOpacity >= 0">
      <div class="mask-opacity-header">
        <span>Mask Opacity</span>
        <img src="/static/images/icons/svg/btn-close-nor.svg"
             @click="closePopup"
             @mousedown="stopMovable">
      </div>
      <div class="mask-opacity-body">
        <div class="mask-opacity-body-top"
             @mousedown="stopMovable">
          <a
            :class="{ active: maskOpacity === OPACITY_ZERO }"
            @click="maskOpacityClicked(OPACITY_ZERO)">
            <img :src="`/static/images/icons/svg/img-opacity-0.svg`">
          </a>
          <a
            :class="{ active: maskOpacity === OPACITY_FIFTY }"
            @click="maskOpacityClicked(OPACITY_FIFTY)">
            <img :src="`/static/images/icons/svg/img-opacity-50.svg`">
          </a>
          <a
            :class="{ active: maskOpacity === OPACITY_HUNDRED }"
            @click="maskOpacityClicked(OPACITY_HUNDRED)">
            <img :src="`/static/images/icons/svg/img-opacity-100.svg`">
          </a>
        </div>

        <div class="divider"></div>

        <div class="mask-opacity-body-mid"
             @mousedown="stopMovable">
          <a
            @click="maskOpacitySizeDown()">
            <img :src="`/static/images/icons/svg/btn-size-down.svg`">
          </a>
          <div>
            <span>{{ maskOpacity }}</span>
          </div>
          <a
            @click="maskOpacitySizeUp()">
            <img :src="`/static/images/icons/svg/btn-size-up.svg`">
          </a>
        </div>

        <div class="divider"></div>

        <div class="mask-opacity-body-bottom"
             @mousedown="stopMovable">
          <div class="mask-opacity-visibility-button"
               @click="maskOpacityClicked(OPACITY_ZERO)">
            <span>Mask View Off</span>
          </div>
          <div class="mask-opacity-visibility-button"
               @click="maskOpacityClicked(OPACITY_HUNDRED)">
            <span>Mask View On</span>
          </div>
        </div>

      </div>
    </div>
  </vue-draggable-resizable>
</template>

<script>
  import {mapGetters} from 'vuex'

  import * as busType from '@/util/bus/bus-types'
  import * as mutationType from '@/store/mutation-types'

  export default {
    name: 'MaskOpacity',
    computed: {
      ...mapGetters([
        'maskOpacity'
      ])
    },
    data () {
      return {
        OPACITY_ZERO: 0,
        OPACITY_FIFTY: 50,
        OPACITY_HUNDRED: 100
      }
    },
    methods: {
      maskOpacityClicked (opacity) {
        this.$store.commit(mutationType.SET_MASK_OPACITY, opacity)
        this.$bus.$emit(busType.MASK_OPACITY_CHANGED)
      },
      maskOpacitySizeDown () {
        this.$store.commit(mutationType.SET_MASK_OPACITY, this.maskOpacity - 10)
        this.$bus.$emit(busType.MASK_OPACITY_CHANGED)
      },
      maskOpacitySizeUp () {
        this.$store.commit(mutationType.SET_MASK_OPACITY, this.maskOpacity + 10)
        this.$bus.$emit(busType.MASK_OPACITY_CHANGED)
      },
      closePopup (e) {
        this.$bus.$emit(busType.SHOW_MASK_OPACITY_POPUP, false)
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

  .mask-opacity-popup {
    box-shadow: 5px 5px 30px black;
    border-radius: 5px;

    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;

    .mask-opacity-popup-inner {
      width: 100%;
      height: 100%;
      background-color: #282828;
      border-radius: 5px;
      overflow: hidden;
      border-radius: 5px;

      .mask-opacity-header {
        margin-left: 15px;
        width: 100%;
        height: 48px;
        cursor: move;

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

      .mask-opacity-body {
        position: absolute;
        width: 100%;
        top: 48px;
        bottom: 0;
        background-color: #413f47;
        overflow-y: auto;
        overflow-x: hidden;
        border-bottom-left-radius: 5px;
        border-bottom-right-radius: 5px;
        cursor: default;

        div.divider {
          margin-top: 5px;
          margin-left: 16px;
          width: 210px;
          height: 2px;
          background-color: #383838;
        }

        div.mask-opacity-body-top {
          margin-top: 21px;
          margin-left: 12px;
          width: 220px;
          height: 98px;

          a {
            display: inline-block;
            width: 70px;
            height: 98px;
            border-radius: 5px;
            background-color: #333236;

            img {
              margin-top: 12px;
            }

            &:hover {
              background-color: $button-over-color;
            }
            &:active {
              background-color: $button-select-color;
            }
          }
          a.active {
            background-color: $button-select-color;
          }
        }

        div.mask-opacity-body-mid {
          margin-top: 5px;
          margin-left: 12px;
          width: 220px;
          height: 48px;

          a {
            display: inline-block;
            width: 63px;
            height: 48px;
            border-radius: 5px;
            background-color: #333236;

            img {
              margin: 6px 14px;
            }

            &:hover {
              background-color: $button-over-color;
            }
            &:active {
              background-color: $button-select-color;
            }
          }
          a.active {
            background-color: $button-select-color;
          }

          div {
            display: inline-block;
            margin-left: 0;
            margin-right: 0;
            margin-bottom: 5px;
            width: 84px;
            height: 38px;
            background-color: #1c1a1f;
            border: solid 2px #333236;

            span {
              position: absolute;
              margin-top: 10px;
              width: 84px;
              height: 18px;
              font-family: AppleSDGothicNeo;
              font-size: 15px;
              font-weight: 500;
              line-height: 1.2;
              text-align: center;
              color: #7a7a7a;
              vertical-align:middle;
            }
          }
        }

        div.mask-opacity-body-bottom {
          margin-top: 3px;
          margin-left: 12px;
          width: 220px;
          height: 135px;

          div.mask-opacity-visibility-button {
            position: relative;
            margin-top: 4px;
            width: 214px;
            height: 58px;
            border-radius: 6px;
            background-color: #1c1a1f;
            text-align: center;

            &:hover {
              cursor: pointer;
              background-color: $button-over-color;
            }

            span {
              line-height: 58px;
              font-family: AppleSDGothicNeo;
              font-size: 15px;
              font-weight: 500;
              font-style: normal;
              font-stretch: normal;
              letter-spacing: normal;
              text-align: center;
              color: #cfcfcf;
            }
          }
        }
      }
    }
  }

</style>
