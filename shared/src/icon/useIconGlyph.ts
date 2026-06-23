import { computed, onMounted, watch } from 'vue'
import { parseIconName } from './parseName'
import { codeToChar, cssIconContentVarFromCode, getLibraryUrl } from './registry'
import { useFontLoader } from './useFontLoader'

export function useIconGlyph(getName: () => string, getLibrary?: () => string | undefined) {
  const parsed = computed(() => parseIconName(getName(), getLibrary?.() || undefined))
  const configUrl = computed(() => getLibraryUrl(parsed.value.library))
  const loader = useFontLoader(() => configUrl.value)

  const icon = computed(() => {
    const config = loader.config.value
    if (!config || !configUrl.value) return null
    return config.icons.find((item) => item.id === parsed.value.iconId) ?? null
  })

  const iconCode = computed(() => icon.value?.code ?? '')
  const iconChar = computed(() => (iconCode.value ? codeToChar(iconCode.value) : ''))
  const iconContent = computed(() => cssIconContentVarFromCode(iconCode.value))
  const fontFamily = computed(() => loader.config.value?.font.family ?? '')
  const ready = computed(
    () => !!configUrl.value && !!icon.value && !!iconChar.value && !!fontFamily.value
  )

  async function ensureLoad() {
    if (!configUrl.value) return
    await loader.load()
  }

  onMounted(() => {
    ensureLoad().catch(() => undefined)
  })

  watch(configUrl, (url) => {
    if (!url) return
    ensureLoad().catch(() => undefined)
  })

  return {
    parsed,
    configUrl,
    loading: loader.loading,
    error: loader.error,
    icon,
    iconCode,
    iconChar,
    iconContent,
    fontFamily,
    ready,
    ensureLoad
  }
}
