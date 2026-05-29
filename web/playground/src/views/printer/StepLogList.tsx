import { defineComponent, type PropType } from 'vue'
import type { StepLog, StepStatus } from './useStepLog'

export default defineComponent({
  name: 'StepLogList',

  props: {
    steps: {
      type: Array as PropType<StepLog[]>,
      required: true
    },
    emptyHint: {
      type: String,
      default: '点击上方按钮后，这里会显示每一步的执行情况'
    },
    stepColor: {
      type: Function as PropType<(status: StepStatus) => string>,
      required: true
    }
  },

  setup(props) {
    return () => (
      <div style="margin-top: 16px;">
        <div style="font-weight: 600; margin-bottom: 8px;">操作步骤</div>
        {props.steps.length === 0 ? (
          <p style="color: #999; font-size: 13px; margin: 0;">{props.emptyHint}</p>
        ) : (
          <ol
            style={{
              margin: 0,
              padding: '12px 12px 12px 28px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '13px',
              lineHeight: 1.6,
              maxHeight: '280px',
              overflowY: 'auto'
            }}
          >
            {props.steps.map((s) => (
              <li key={s.id} style={{ marginBottom: '6px', color: props.stepColor(s.status) }}>
                <span style="color: #64748b; margin-right: 6px;">[{s.time}]</span>
                <strong>{s.label}</strong>
                {s.status === 'pending' && ' …'}
                {s.status === 'ok' && ' ✓'}
                {s.status === 'error' && ' ✗'}
                {s.detail && (
                  <div style="color: #475569; font-weight: normal; margin-top: 2px; padding-left: 4px;">
                    {s.detail}
                  </div>
                )}
              </li>
            ))}
          </ol>
        )}
      </div>
    )
  }
})
