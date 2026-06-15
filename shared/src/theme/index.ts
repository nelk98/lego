import { readonly, ref, type Ref } from 'vue'
import {
  PRIMARY_COLOR_NAMES,
  PRIMARY_STEPS,
  type PrimaryColorName,
  type PrimaryStep
} from '../style/palette.meta'

export {
  PRIMARY_COLOR_NAMES,
  PRIMARY_STEPS,
  type PrimaryColorName,
  type PrimaryStep
} from '../style/palette.meta'

export const THEME_MODES = ['light', 'dark'] as const
export type ThemeMode = (typeof THEME_MODES)[number]

export interface ThemeState {
  theme: ThemeMode
  primary: PrimaryColorName
}

export interface ThemeControllerOptions {
  defaultTheme?: ThemeMode
  defaultPrimary?: PrimaryColorName
  storageKey?: string | false
  target?: HTMLElement | (() => HTMLElement | null | undefined)
}

export interface ThemeController {
  theme: Readonly<Ref<ThemeMode>>
  primary: Readonly<Ref<PrimaryColorName>>
  primaryColors: typeof PRIMARY_COLOR_NAMES
  themes: typeof THEME_MODES
  setTheme: (theme: ThemeMode) => void
  setPrimary: (primary: PrimaryColorName) => void
  toggleTheme: () => void
  setState: (state: Partial<ThemeState>) => void
  apply: () => void
}

const DEFAULT_STORAGE_KEY = 'lego.theme'
const DEFAULT_THEME: ThemeMode = 'light'
const DEFAULT_PRIMARY: PrimaryColorName = 'blue'

let activeController: ThemeController | undefined

function isThemeMode(value: unknown): value is ThemeMode {
  return typeof value === 'string' && THEME_MODES.includes(value as ThemeMode)
}

function isPrimaryColorName(value: unknown): value is PrimaryColorName {
  return typeof value === 'string' && PRIMARY_COLOR_NAMES.includes(value as PrimaryColorName)
}

function getDefaultTarget() {
  if (typeof document === 'undefined') return undefined
  return document.documentElement
}

function resolveTarget(target: ThemeControllerOptions['target']) {
  if (typeof target === 'function') return target() ?? undefined
  return target ?? getDefaultTarget()
}

function readStorage(storageKey: string | false): Partial<ThemeState> {
  if (!storageKey || typeof window === 'undefined') return {}
  try {
    const raw = window.localStorage.getItem(storageKey)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as Partial<ThemeState>
    return {
      theme: isThemeMode(parsed.theme) ? parsed.theme : undefined,
      primary: isPrimaryColorName(parsed.primary) ? parsed.primary : undefined
    }
  } catch {
    return {}
  }
}

function writeStorage(storageKey: string | false, state: ThemeState) {
  if (!storageKey || typeof window === 'undefined') return
  window.localStorage.setItem(storageKey, JSON.stringify(state))
}

function readTargetState(target: HTMLElement | undefined): Partial<ThemeState> {
  if (!target) return {}
  return {
    theme: isThemeMode(target.dataset.theme) ? target.dataset.theme : undefined,
    primary: isPrimaryColorName(target.dataset.primary) ? target.dataset.primary : undefined
  }
}

export function createThemeController(options: ThemeControllerOptions = {}): ThemeController {
  const storageKey = options.storageKey ?? DEFAULT_STORAGE_KEY
  const target = resolveTarget(options.target)
  const targetState = readTargetState(target)
  const storedState = readStorage(storageKey)

  const theme = ref<ThemeMode>(
    targetState.theme ?? storedState.theme ?? options.defaultTheme ?? DEFAULT_THEME
  )
  const primary = ref<PrimaryColorName>(
    targetState.primary ?? storedState.primary ?? options.defaultPrimary ?? DEFAULT_PRIMARY
  )

  function currentState(): ThemeState {
    return {
      theme: theme.value,
      primary: primary.value
    }
  }

  function apply() {
    const nextTarget = resolveTarget(options.target)
    if (!nextTarget) return
    nextTarget.dataset.theme = theme.value
    nextTarget.dataset.primary = primary.value
    nextTarget.style.colorScheme = theme.value
  }

  function persistAndApply() {
    apply()
    writeStorage(storageKey, currentState())
  }

  const controller: ThemeController = {
    theme: readonly(theme),
    primary: readonly(primary),
    primaryColors: PRIMARY_COLOR_NAMES,
    themes: THEME_MODES,
    setTheme(nextTheme) {
      theme.value = nextTheme
      persistAndApply()
    },
    setPrimary(nextPrimary) {
      primary.value = nextPrimary
      persistAndApply()
    },
    toggleTheme() {
      theme.value = theme.value === 'dark' ? 'light' : 'dark'
      persistAndApply()
    },
    setState(nextState) {
      if (nextState.theme) theme.value = nextState.theme
      if (nextState.primary) primary.value = nextState.primary
      persistAndApply()
    },
    apply
  }

  persistAndApply()

  return controller
}

export function initTheme(options?: ThemeControllerOptions) {
  activeController = createThemeController(options)
  return activeController
}

export function useTheme(options?: ThemeControllerOptions) {
  if (!activeController) {
    activeController = createThemeController(options)
  }
  return activeController
}

export function swatchTextClass(theme: ThemeMode, step: PrimaryStep): string {
  if (theme === 'light') {
    return step <= 400 ? 'p_color-swatch-text--on-light' : 'p_color-swatch-text--on-dark'
  }
  return step >= 500 ? 'p_color-swatch-text--on-light' : 'p_color-swatch-text--on-dark'
}
