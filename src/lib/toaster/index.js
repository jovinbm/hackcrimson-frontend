import { Position, Toaster, Intent } from '@blueprintjs/core'

const T = Toaster.create({
  position: Position.BOTTOM,
})

export const info = function(options) {
  T.show({
    timeout: 2000,
    ...options,
    intent: Intent.PRIMARY,
  })
}

export const warn = function(options) {
  T.show({
    timeout: -1,
    ...options,
    intent: Intent.WARNING,
  })
}

export const danger = function(options) {
  T.show({
    timeout: -1,
    ...options,
    intent: Intent.DANGER,
  })
}

export const success = function(options) {
  T.show({
    timeout: 2000,
    ...options,
    intent: Intent.SUCCESS,
  })
}

export default T