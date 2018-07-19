const DivideDisplay = {
  name: 'DivideDisplay',
  type: 'expand',
  meta: {
    label: 'Divide Display',
    icon: 'img-over-05-divide-display.svg',
    expanded: false
  },
  children: [
    {
      name: '1By1',
      type: 'layout',
      meta: {
        label: '1 X 1',
        icon: 'img-lnb-radio-sel-pre.svg'
      }
    },
    {
      name: '2By2',
      type: 'layout',
      meta: {
        label: '2 X 2',
        icon: 'img-lnb-radio-nor-pre.svg'
      }
    }
    // ,
    // {
    //   name: '3By3',
    //   meta: {
    //     label: '3 X 3',
    //     icon: 'icon-layout-3x3',
    //     type: 'layout'
    //   }
    // }
  ]
}

const ExpandDisplay = {
  name: 'ExpandDisplay',
  type: 'expand',
  meta: {
    label: 'Expand Display',
    icon: 'img-over-20-expand-display.svg',
    expanded: false
  },
  children: [
    {
      name: 'Expand',
      type: 'action',
      meta: {
        label: 'Expand',
        icon: 'img-over-21-expand.svg'
      }
    },
    {
      name: 'Restore',
      type: 'action',
      meta: {
        label: 'Restore',
        icon: 'img-over-22-unfocus.svg'
      }
    }
  ]
}

const FlipdDisplay = {
  name: 'FlipdDisplay',
  type: 'expand',
  meta: {
    label: 'Flip Display',
    icon: 'img-over-23-flip-display.svg',
    expanded: false
  },
  children: [
    {
      name: 'Horizontal',
      type: 'action',
      meta: {
        label: 'Horizontal',
        icon: 'img-over-24-flip-horizontally.svg'
      }
    },
    {
      name: 'Vertical',
      type: 'action',
      meta: {
        label: 'Vertical',
        icon: 'img-over-25-flip-vertically.svg'
      }
    }
  ]
}

export { DivideDisplay, ExpandDisplay, FlipdDisplay }
