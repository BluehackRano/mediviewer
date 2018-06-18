<template>
  <vue-draggable-resizable
    class="help-popup"
    :parent="true"
    :resizable="false"
    :x="0" :y="0" :z="2000"
    :w="450" :h="500">
    <div class="help-popup-inner">
      <div class="help-header">
        <span>HELP</span>
        <img src="/static/images/icons/svg/btn-close-nor.svg"
             @click="closePopup"
             @mousedown="stopMovable">
      </div>
      <div class="help-body">
        <table>
          <thead>
          <tr>
            <th>KEY</th>
            <th>FUNCTION</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="aKey in shortKeys">
            <td>{{aKey.key}}</td>
            <td><span>{{aKey.function}}</span></td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>

  </vue-draggable-resizable>
</template>

<script>
  import * as busType from '@/util/bus/bus-types'

  export default {
    name: 'HelpPopup',
    data () {
      return {
        shortKeys: [
          {key: '0', function: 'Focus on 3D Canvas'},
          {key: '1', function: 'Focus on Axial Canvas'},
          {key: '2', function: 'Focus on Sagittal Canvas'},
          {key: '3', function: 'Focus on Coronal Canvas'},
          {key: 'p', function: 'Pan'},
          {key: '+', function: 'Zoom In '},
          {key: '-', function: 'Zoom Out '},
          {key: 'f', function: 'Fit '},
          {key: 'i', function: 'Invert'},
          {key: 'b', function: 'Brightness Contrast'},
          {key: 'f', function: 'Show/Hide Tag Info'}
        ]
      }
    },
    created () {
    },
    methods: {
      closePopup (e) {
        this.$bus.$emit(busType.SHOW_HELP_POPUP, false)
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

  .help-popup {
    box-shadow: 5px 5px 30px black;
    border-radius: 5px;

    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;

    .help-popup-inner {
      width: 100%;
      height: 100%;
      background-color: #282828;
      border-radius: 5px;
      overflow: hidden;
      border-radius: 5px;

      .help-header {
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

      .help-body {
        position: absolute;
        width: 100%;
        top: 48px;
        bottom: 0;
        padding: 20px;
        background-color: #413f47;
        overflow-y: auto;
        overflow-x: hidden;
        border-bottom-left-radius: 5px;
        border-bottom-right-radius: 5px;
        cursor: default;

        table {
          position: relative;
          width: 100%;
          border: 2px solid #282828;
          border-radius: 3px;
        }

        th {
          background-color: black;
          color: rgba(255,255,255,0.66);
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }

        td {
          background-color: #282828;
          color: rgba(255,255,255,0.66);
        }

        th, td {
          min-width: 120px;
          padding: 10px 20px;
        }
      }
    }
  }
</style>
