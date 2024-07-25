import { defineStore } from 'pinia'
import { ref } from 'vue'

const useAppThemeStore = defineStore('App.Theme', () => {
  const theme = ref<'light' | 'dark' | 'system'>('system')
  const setTheme = (value: 'light' | 'dark' | 'system') => {
    theme.value = value
  }
  return {
    theme,
    setTheme
  }
})

export default useAppThemeStore
