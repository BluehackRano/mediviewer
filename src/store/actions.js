import * as mutationType from './mutation-types'

export default {
  expandMenu: ({ commit }, menuItem) => {
    if (menuItem) {
      menuItem.expanded = menuItem.expanded || false
      commit(mutationType.EXPAND_MENU, menuItem)
    }
  },
  showTagsToggle: ({ commit }, menuItem) => {
    if (menuItem) {
      commit(mutationType.SHOW_TAGS_MENU_TOGGLE, menuItem)
    }
  },
  segmentationVisibleToggle: ({ commit }, segItem) => {
    if (segItem) {
      segItem.visible = segItem.visible || false
      segItem.selected = segItem.visible
      commit(mutationType.SEGMENTATION_SELECTED_TOGGLE, segItem)
      commit(mutationType.SEGMENTATION_VISIBLE_TOGGLE, segItem)
    }
  },
  segmentationSelectedToggle: ({ commit }, segItem) => {
    if (segItem) {
      segItem.selected = segItem.selected || false
      segItem.visible = segItem.selected
      commit(mutationType.SEGMENTATION_SELECTED_TOGGLE, segItem)
      commit(mutationType.SEGMENTATION_VISIBLE_TOGGLE, segItem)
    }
  },
  segmentationToggleAll: ({ commit }, show) => {
    commit(mutationType.SEGMENTATION_TOGGLE_ALL, show)
  }
}
