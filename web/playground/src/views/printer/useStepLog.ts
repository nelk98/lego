import { ref } from 'vue'

export type StepStatus = 'pending' | 'ok' | 'error'

export interface StepLog {
  id: number
  time: string
  label: string
  status: StepStatus
  detail?: string
}

function formatTime() {
  return new Date().toLocaleTimeString('zh-CN', { hour12: false })
}

export function useStepLog() {
  const steps = ref<StepLog[]>([])
  let stepSeq = 0

  function clearSteps() {
    steps.value = []
    stepSeq = 0
  }

  function pushStep(label: string, status: StepStatus = 'pending', detail?: string) {
    const id = ++stepSeq
    steps.value = [...steps.value, { id, time: formatTime(), label, status, detail }]
    return id
  }

  function settleStep(id: number, status: 'ok' | 'error', detail?: string) {
    steps.value = steps.value.map((s) =>
      s.id === id ? { ...s, status, detail: detail ?? s.detail } : s
    )
  }

  function stepColor(status: StepStatus) {
    if (status === 'ok') return '#15803d'
    if (status === 'error') return '#dc2626'
    return '#a16207'
  }

  return { steps, clearSteps, pushStep, settleStep, stepColor }
}

export type StepLogApi = ReturnType<typeof useStepLog>
