<template>
  <div>
    <div class="app-sidebar-dimmed-view" id="dimmed-view"
      v-show="!isFileUploaded"></div>
    <aside class="menu app-sidebar">
      <ul class="menu-list">
        <li v-for="(menu, index) in menus"
            class="menu-item"
            :class="{ divider: menu.type == 'divider' }">
          <template v-if="menu.children && menu.children.length">
            <a :aria-expanded="isExpanded(menu)"
               @click="expandMenuToggle(index, menu)">
              <img v-if="menu.meta.icon" :src="`/static/images/icons/svg/${menu.meta.icon}`">
              <div class="menu-item-label">
                <span>{{ menu.meta.label }}</span>
              </div>
              <icon name="angle-down" class="is-angle"></icon>
            </a>
          </template>
          <template v-else>
            <a v-if="menu.type === 'select'"
               :class="{ active: currentSelect.name == menu.name }"
               @click="menuClicked(menu)"
            >
              <img v-if="menu.meta.icon" :src="`/static/images/icons/svg/${menu.meta.icon}`">
              <div>
                <span>{{ menu.meta.label }}</span>
              </div>
            </a>
            <a v-else-if="menu.type === 'action'"
               @click="menuClicked(menu)"
            >
              <img v-if="menu.meta.icon" :src="`/static/images/icons/svg/${menu.meta.icon}`">
              <div>
                <span>{{ menu.meta.label }}</span>
              </div>
            </a>
            <a v-else-if="menu.type === 'toggle'"
               @click="menuClicked(menu)"
            >
              <img v-if="menu.meta.icon" :src="`/static/images/icons/svg/${menu.meta.icon}`">
              <div>
                <span>{{ menu.meta.label }}</span>
              </div>
            </a>
            <!--<a v-else-if="menu.type === 'file'"-->
            <!--&gt;-->
              <!--<input type="file">-->
              <!--<img v-if="menu.meta.icon" :src="`/static/images/icons/svg/${menu.meta.icon}`">-->
              <!--<div>-->
                <!--<span>{{ menu.meta.label }}</span>-->
              <!--</div>-->
            <!--</a>-->
          </template>

          <expanding v-if="menu.children && menu.children.length">
            <ul v-show="isExpanded(menu)">
              <li v-for="subMenu in menu.children"
                  class="submenu-item">
                <a
                  v-if="subMenu.type === 'layout'"
                  :class="{ active: currentLayout.name == subMenu.name }"
                  @click="menuClicked(subMenu)">
                  <img v-if="currentLayout.name == subMenu.name"
                       :src="`/static/images/icons/svg/img-lnb-radio-sel.svg`">
                  <img v-else :src="`/static/images/icons/svg/img-lnb-radio-nor.svg`">
                  <span>{{ subMenu.meta.label }}</span>
                </a>
                <a
                  v-else-if="subMenu.type === 'select'"
                  :class="{ active: currentSelect.name == subMenu.name }"
                  @click="menuClicked(subMenu)">
                  <img v-if="subMenu.meta.icon" :src="`/static/images/icons/svg/${subMenu.meta.icon}`">
                  <span>{{ subMenu.meta.label }}</span>
                </a>
                <a
                  v-else
                  @click="menuClicked(subMenu)">
                  <img v-if="subMenu.meta.icon" :src="`/static/images/icons/svg/${subMenu.meta.icon}`">
                  <span>{{ subMenu.meta.label }}</span>
                </a>
              </li>
            </ul>
          </expanding>
        </li>

      </ul>
    </aside>
  </div>
</template>

<script>
  import {mapGetters, mapState, mapActions} from 'vuex'
  import * as mutationType from '@/store/mutation-types'
  import * as busType from '@/util/bus/bus-types'

  import Expanding from 'vue-bulma-expanding'

  export default {
    name: 'Sidebar',
    data () {
      return {
        isFileUploaded: false
      }
    },
    components: {
      Expanding
    },
    computed: {
      ...mapGetters({
        menus: 'menus'
      }),
      ...mapState({
        currentLayout: 'currentLayout',
        currentSelect: 'currentSelect'
      })
    },
    created () {
      this.$bus.$on(busType.FILE_UPLOADED, () => {
        this.isFileUploaded = true
      })
    },
    methods: {
      ...mapActions([
        'expandMenu',
        'showTagsToggle'
      ]),
      isExpanded (menu) {
        return menu.meta.expanded
      },
      expandMenuToggle (index, menu) {
        this.expandMenu({
          index: index,
          expanded: !menu.meta.expanded
        })
      },
      openSegmentations () {
        var f = document.createElement('input')
        f.style.display = 'none'
        f.type = 'file'
        f.name = 'file'
        document.getElementById('dimmed-view').appendChild(f)
        f.click()
        f.addEventListener('change', () => {
          if (f.files[0]) {
            this.$bus.$emit(busType.FILE_UPLOADED_SEG, f.files[0])
          }
        })
      },
      toggleShowTags (menu) {
        this.$store.commit(mutationType.SET_SHOW_TAGS, !menu.toggle)
        this.showTagsToggle({
          name: menu.name,
          toggle: !menu.toggle
        })
      },
      menuClicked (menu) {
        switch (menu.name) {
          case 'SegmentationResultOveray':
            this.$bus.$emit(busType.SHOW_SEGMENTATION_POPUP)
            break
//          case 'AnalysisReport':
//            this.$bus.$emit(busType.SHOW_ANALYSIS_REPORT_POPUP)
//            break
//          case 'OpenSegmentations':
//            this.openSegmentations()
//            break
          case 'ShowTagsToggle':
            this.toggleShowTags(menu)
            break
          default :
            this.$bus.$emit(busType.MENU_CLICKED, menu)
            break
        }
      }
    }
  }
</script>

<style lang="scss" scoped>
  @import "../../style/bh_style.scss";

  .app-sidebar-dimmed-view {
    position: fixed;
    top: $header-height;
    left: 0;
    bottom: 0;
    width: $sidebar-width;
    height: 100%;
    z-index: 1026;
    background-color: $sidebar-menu-bg-color;
    opacity: 0.9;
  }

  .app-sidebar {
    position: fixed;
    top: $header-height;
    left: 0;
    bottom: 0;
    padding: 0 0 $header-height;
    width: $sidebar-width;
    height: 100%;
    z-index: 1025;
    background-color: $sidebar-menu-bg-color;
    overflow-y: auto;
    overflow-x: hidden;

    .fa-icon {
      margin-top: 8px;
      width: 27px;
      height: 27px;
      color: #787782;
      &.is-angle {
        position: absolute;
        right: 10px;
        transition: transform .3s ease;
      }
    }

    .menu-list {
      overflow-y: auto;
      overflow-x: hidden;

      li a {
        &[aria-expanded="true"] {
          .is-angle {
            transform: rotate(180deg);
          }
        }
        color: $sidebar-menu-label-color;
      }

      a {
        margin: 1px 3px;
        padding: 0;
        height: 44px;

        &:hover {
          background-color: $sidebar-menu-over-bg-color;
          color: $sidebar-menu-over-label-color;
        }
        &:active {
          background-color: $sidebar-menu-press-bg-color;
          color: $sidebar-menu-press-label-color;
        }

        img {
          margin-top: 7px;
          width: 30px;
          height: 30px;
        }
      }

      a.active {
        background-color: $sidebar-menu-select-bg-color;
        color: $sidebar-menu-select-label-color;

        &:hover {
          background-color: $sidebar-menu-over-bg-color;
          color: $sidebar-menu-over-label-color;
        }
        &:active {
          background-color: $sidebar-menu-press-bg-color;
          color: $sidebar-menu-press-label-color;
        }
      }

      li.menu-item {
        a {
          img {
            margin-left: 7px;
          }

          div {
            position: absolute;
            margin-top: -41px;
            padding-right: 8px;
            left: 55px;
            height: 44px;
            width: 190px;
            display: table;

            span {
              display: table-cell;
              vertical-align: middle;
              font-size: 14px;
              color: $sidebar-menu-normal-label-color;
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

      li.divider {
        height: 2px;
        background-color: $sidebar-menu-divider-bg-color;
      }

      /* for submenu */
      li ul {
        margin-top: 0;
        margin-left: 0;
        margin-bottom: 0;
        padding-top: 3px;
        padding-left: 24px;
        padding-bottom: 3px;
        width: 100%;
        border-left: none;
        background-color: $sidebar-submenu-bg-color;

        li.submenu-item {
          margin-top: -1px;
          margin-left: 0;
          padding-left: 0;

          a {
            img {
              margin-left: 5px;
              vertical-align: middle;
            }

            span {
              position: relative;
              top: 3px;
              margin-left: 3px;
              font-size: 14px;
              vertical-align: middle;
            }

            -webkit-touch-callout: none;
            -webkit-user-select: none;
            -khtml-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
          }
        }
      }

/*
      a {
        margin: 3px;
        &:hover {
          background-color: $sidebar-menu-over-bg-color;
          color: $sidebar-menu-over-label-color;
        }
        &:active {
          background-color: $sidebar-menu-press-bg-color;
          color: $sidebar-menu-press-label-color;
        }
      }

      li a {
        &[aria-expanded="true"] {
          .is-angle {
            transform: rotate(180deg);
          }
        }
        color: $sidebar-menu-label-color;
      }

      li a.active {
        background-color: $sidebar-menu-select-bg-color;
        color: $sidebar-menu-select-label-color;
      }

      aside ul {
        background-color: #232228;
      }

      li ul {
        margin: 0 0 0 25px;
        border-left-color: #d8d8d8;
        background-color: #16151a;
      }
*/
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
    background: #787782;
    border-radius: 10px;
  }

  /* Handle on hover */
  ::-webkit-scrollbar-thumb:hover {
    background: #555;
    border-radius: 10px;
  }
</style>
