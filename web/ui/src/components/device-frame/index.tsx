import {
  computed,
  defineComponent,
  mergeProps,
  useAttrs,
  type PropType,
  type StyleValue
} from 'vue'
import mpMenuUrl from './mp-menu.svg'
import './style.scss'

export interface DeviceFrameSafeArea {
  top: number
  bottom: number
}

export interface DeviceFrameCapsule {
  width: number
  height: number
  top: number
  right: number
  left: number
  bottom: number
}

export interface DeviceFrameModel {
  name: string
  width: number
  height: number
  dpr: number
  statusBarHeight: number
  safeArea: DeviceFrameSafeArea
  capsule: DeviceFrameCapsule
}

export const DEVICE_FRAME_MODELS = [
  {
    name: 'iPhone SE 2/3',
    width: 375,
    height: 667,
    dpr: 2,
    statusBarHeight: 20,
    safeArea: {
      top: 20,
      bottom: 0
    },
    capsule: {
      width: 87,
      height: 32,
      top: 24,
      right: 7,
      left: 281,
      bottom: 56
    }
  },
  {
    name: 'iPhone 14 Pro / 15 / 15 Pro / 16',
    width: 393,
    height: 852,
    dpr: 3,
    statusBarHeight: 59,
    safeArea: {
      top: 59,
      bottom: 34
    },
    capsule: {
      width: 87,
      height: 32,
      top: 63,
      right: 7,
      left: 299,
      bottom: 95
    }
  },
  {
    name: 'iPhone 12 / 13 / 14',
    width: 390,
    height: 844,
    dpr: 3,
    statusBarHeight: 47,
    safeArea: {
      top: 47,
      bottom: 34
    },
    capsule: {
      width: 87,
      height: 32,
      top: 51,
      right: 7,
      left: 296,
      bottom: 83
    }
  }
] as const satisfies readonly DeviceFrameModel[]

export type DeviceFrameModelName = (typeof DEVICE_FRAME_MODELS)[number]['name']
export type DeviceFrameModelInput = DeviceFrameModelName | DeviceFrameModel

export const DEFAULT_DEVICE_FRAME_MODEL = DEVICE_FRAME_MODELS[1]
export const DEVICE_FRAME_MODEL_NAMES = DEVICE_FRAME_MODELS.map(
  (model) => model.name
) as DeviceFrameModelName[]

export const DEVICE_FRAME_MODEL_MAP = DEVICE_FRAME_MODELS.reduce(
  (map, model) => {
    map[model.name] = model
    return map
  },
  {} as Record<DeviceFrameModelName, DeviceFrameModel>
)

const DEVICE_FRAME_BEZEL_SIZE = 10

export function resolveDeviceFrameModel(model?: DeviceFrameModelInput): DeviceFrameModel {
  if (!model) return DEFAULT_DEVICE_FRAME_MODEL
  if (typeof model === 'string') {
    return (
      (DEVICE_FRAME_MODEL_MAP as Record<string, DeviceFrameModel | undefined>)[model] ??
      DEFAULT_DEVICE_FRAME_MODEL
    )
  }
  return model
}

function createFrameStyle(model: DeviceFrameModel, scale: number, background: string) {
  const outerWidth = (model.width + DEVICE_FRAME_BEZEL_SIZE * 2) * scale
  const outerHeight = (model.height + DEVICE_FRAME_BEZEL_SIZE * 2) * scale

  return {
    '--device-frame-width': `${model.width}px`,
    '--device-frame-height': `${model.height}px`,
    '--device-frame-outer-width': `${outerWidth}px`,
    '--device-frame-outer-height': `${outerHeight}px`,
    '--device-frame-bezel-size': `${DEVICE_FRAME_BEZEL_SIZE}px`,
    '--device-frame-dpr': String(model.dpr),
    '--device-frame-scale': String(scale),
    '--device-frame-screen-bg': background,
    '--device-status-bar-height': `${model.statusBarHeight}px`,
    '--device-safe-area-top': `${model.safeArea.top}px`,
    '--device-safe-area-bottom': `${model.safeArea.bottom}px`,
    '--safe-area-inset-top': `${model.safeArea.top}px`,
    '--safe-area-inset-bottom': `${model.safeArea.bottom}px`,
    '--device-capsule-width': `${model.capsule.width}px`,
    '--device-capsule-height': `${model.capsule.height}px`,
    '--device-capsule-top': `${model.capsule.top}px`,
    '--device-capsule-right': `${model.capsule.right}px`,
    '--device-capsule-left': `${model.capsule.left}px`,
    '--device-capsule-bottom': `${model.capsule.bottom}px`
  } as StyleValue
}

export const DeviceFrame = defineComponent({
  name: 'DeviceFrame',
  inheritAttrs: false,
  props: {
    model: {
      type: [String, Object] as PropType<DeviceFrameModelInput>,
      default: DEFAULT_DEVICE_FRAME_MODEL.name
    },
    scale: {
      type: Number,
      default: 1,
      validator: (value: number) => value > 0
    },
    background: {
      type: String,
      default: '#ffffff'
    },
    showStatusBar: {
      type: Boolean,
      default: true
    },
    showCapsule: {
      type: Boolean,
      default: true
    }
  },
  setup(props, { slots }) {
    const attrs = useAttrs()
    const model = computed(() => resolveDeviceFrameModel(props.model))
    const frameStyle = computed(() => createFrameStyle(model.value, props.scale, props.background))

    return () => (
      <div
        {...mergeProps(
          {
            class: 'c-device-frame',
            style: frameStyle.value,
            'data-device-model': model.value.name,
            'data-device-dpr': model.value.dpr
          },
          attrs
        )}
      >
        <div class="c-device-frame__shell">
          <div class="c-device-frame__screen">
            <div class="c-device-frame__viewport">
              {slots.default?.({
                model: model.value,
                safeArea: model.value.safeArea,
                capsule: model.value.capsule
              })}
            </div>

            {props.showStatusBar && (
              <div class="c-device-frame__status-bar" aria-hidden="true">
                {slots.statusBar?.({ model: model.value }) ?? (
                  <>
                    <span class="c-device-frame__time">9:41</span>
                    <span class="c-device-frame__status-icons">
                      <span class="c-device-frame__signal" />
                      <span class="c-device-frame__wifi" />
                      <span class="c-device-frame__battery" />
                    </span>
                  </>
                )}
              </div>
            )}

            {props.showCapsule && (
              <img
                class="c-device-frame__capsule"
                src={mpMenuUrl}
                width={model.value.capsule.width}
                height={model.value.capsule.height}
                alt=""
                aria-hidden="true"
                draggable={false}
              />
            )}
          </div>
        </div>
      </div>
    )
  }
})

export default DeviceFrame
