import * as types from '../../mutation-types'

const state = {
  items: [
    {
      visible: false,
      selected: false,
      meta: {
        label: 'Left-Hippocampus',
        icon: 'btn-uncheck-checkbox.svg',
        color: 'rgb(201, 84, 27)'
      }
    },
    {
      visible: false,
      selected: false,
      meta: {
        label: 'Right-Hippocampus',
        icon: 'btn-uncheck-checkbox.svg',
        color: 'rgb(201, 84, 27)'
      }
    },
    {
      visible: false,
      selected: false,
      meta: {
        label: 'ctx-lh-parahippocampal',
        icon: 'btn-uncheck-checkbox.svg',
        color: 'rgb(113, 61, 50)'
      }
    },
    {
      visible: false,
      selected: false,
      meta: {
        label: 'ctx-rh-parahippocampal',
        icon: 'btn-uncheck-checkbox.svg',
        color: 'rgb(113, 61, 50)'
      }
    },
    {
      visible: false,
      selected: false,
      meta: {
        label: 'ctx-lh-entorhinal',
        icon: 'btn-uncheck-checkbox.svg',
        color: 'rgb(190, 248, 136)'
      }
    },
    {
      visible: false,
      selected: false,
      meta: {
        label: 'ctx-rh-entorhinal',
        icon: 'btn-uncheck-checkbox.svg',
        color: 'rgb(190, 248, 136)'
      }
    },
    {
      visible: false,
      selected: false,
      meta: {
        label: 'ctx-lh-isthmuscingulate',
        icon: 'btn-uncheck-checkbox.svg',
        color: 'rgb(199, 156, 83)'
      }
    },
    {
      visible: false,
      selected: false,
      meta: {
        label: 'ctx-rh-isthmuscingulate',
        icon: 'btn-uncheck-checkbox.svg',
        color: 'rgb(199, 156, 83)'
      }
    },
    {
      visible: false,
      selected: false,
      meta: {
        label: 'ctx-lh-posteriorcingulate',
        icon: 'btn-uncheck-checkbox.svg',
        color: 'rgb(236, 36, 69)'
      }
    },
    {
      visible: false,
      selected: false,
      meta: {
        label: 'ctx-rh-posteriorcingulate',
        icon: 'btn-uncheck-checkbox.svg',
        color: 'rgb(236, 36, 69)'
      }
    },
    {
      visible: false,
      selected: false,
      meta: {
        label: 'ctx-lh-fusiform',
        icon: 'btn-uncheck-checkbox.svg',
        color: 'rgb(247, 213, 135)'
      }
    },
    {
      visible: false,
      selected: false,
      meta: {
        label: 'ctx-rh-fusiform',
        icon: 'btn-uncheck-checkbox.svg',
        color: 'rgb(247, 213, 135)'
      }
    },
    {
      visible: false,
      selected: false,
      meta: {
        label: 'ctx-lh-superiortemporal',
        icon: 'btn-uncheck-checkbox.svg',
        color: 'rgb(205, 73, 34)'
      }
    },
    {
      visible: false,
      selected: false,
      meta: {
        label: 'ctx-rh-superiortemporal',
        icon: 'btn-uncheck-checkbox.svg',
        color: 'rgb(205, 73, 34)'
      }
    },
    {
      visible: false,
      selected: false,
      meta: {
        label: 'ctx-lh-supramarginal',
        icon: 'btn-uncheck-checkbox.svg',
        color: 'rgb(109, 111, 171)'
      }
    },
    {
      visible: false,
      selected: false,
      meta: {
        label: 'ctx-rh-supramarginal',
        icon: 'btn-uncheck-checkbox.svg',
        color: 'rgb(109, 111, 171)'
      }
    },
    {
      visible: false,
      selected: false,
      meta: {
        label: 'ctx-lh-precuneus',
        icon: 'btn-uncheck-checkbox.svg',
        color: 'rgb(22, 215, 204)'
      }
    },
    {
      visible: false,
      selected: false,
      meta: {
        label: 'ctx-rh-precuneus',
        icon: 'btn-uncheck-checkbox.svg',
        color: 'rgb(22, 215, 204)'
      }
    }
  ]
}

const getters = {
  segmentations: state => state.items
}

const mutations = {
  [types.SEGMENTATION_VISIBLE_TOGGLE] (state, segItem) {
    if (segItem.index > -1) {
      if (state.items[segItem.index] && state.items[segItem.index].meta) {
        state.items[segItem.index].visible = segItem.visible
      }
    }
  },
  [types.SEGMENTATION_SELECTED_TOGGLE] (state, segItem) {
    if (segItem.index > -1) {
      if (state.items[segItem.index] && state.items[segItem.index].meta) {
        state.items[segItem.index].selected = segItem.selected
      }
    }
  },
  [types.SEGMENTATION_TOGGLE_ALL] (state, show) {
    for (let i = 0; i < state.items.length; i++) {
      state.items[i].visible = show
      state.items[i].selected = show
    }
  }
}

export default {
  state,
  getters,
  mutations
}
