import { presetUno } from '@unocss/preset-uno'
import transformerVariantGroup from '@unocss/transformer-variant-group'

export default {
  presets: [presetUno()],
  transformers: [transformerVariantGroup()],
  shortcuts: {
    // active: 'bg-green-500 hover:bg-green-600'
  }
}
