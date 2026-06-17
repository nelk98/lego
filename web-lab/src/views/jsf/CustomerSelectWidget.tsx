import { computed, defineComponent, ref, type PropType } from 'vue'
import { defineWidget, useWidgetContext } from '@lego/jsf'

const customers = [
  { label: '星河制造', value: 'c-1001', desc: '企业客户，华东区' },
  { label: '云上零售', value: 'c-1002', desc: '连锁门店，华南区' },
  { label: '北辰物流', value: 'c-1003', desc: '运输调度，华北区' }
]

/**
 * 示例业务 widget。
 *
 * 它不是普通 select：内部有搜索框、候选面板和自定义 activate/focus 行为，用来验证
 * JSF 的定位链路不是只对最深处 input 调 focus。
 */
export default defineWidget({
  name: 'customerSelect',
  value: {
    prop: 'modelValue',
    event: 'update:modelValue'
  },
  defaults: {
    props: {
      placeholder: '请选择客户'
    }
  },
  component: defineComponent({
    name: 'CustomerSelectWidget',
    props: {
      modelValue: String,
      placeholder: String,
      disabled: Boolean,
      readonly: Boolean
    },
    emits: {
      'update:modelValue': (_value: string) => true,
      blur: () => true
    },
    setup(props, { emit }) {
      const widget = useWidgetContext()
      const open = ref(false)
      const keyword = ref('')
      const searchRef = ref<HTMLInputElement>()

      const filtered = computed(() => {
        const text = keyword.value.trim()
        if (!text) return customers
        return customers.filter((item) => item.label.includes(text) || item.desc.includes(text))
      })

      const current = computed(() => customers.find((item) => item.value === props.modelValue))

      widget.exposeHandle({
        async activate() {
          open.value = true
        },
        async focus() {
          open.value = true
          requestAnimationFrame(() => searchRef.value?.focus())
        }
      })

      return () => (
        <div class="jsf-customer-select">
          <button
            class="jsf-customer-select__trigger"
            type="button"
            disabled={props.disabled || props.readonly}
            onClick={() => {
              open.value = !open.value
            }}
            onBlur={() => emit('blur')}
          >
            {current.value ? current.value.label : props.placeholder}
          </button>

          {open.value ? (
            <div class="jsf-customer-select__panel">
              <input
                ref={searchRef}
                value={keyword.value}
                placeholder="搜索客户"
                onInput={(event) => {
                  keyword.value = (event.target as HTMLInputElement).value
                }}
              />
              <div class="jsf-customer-select__list">
                {filtered.value.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => {
                      emit('update:modelValue', item.value)
                      open.value = false
                    }}
                  >
                    <strong>{item.label}</strong>
                    <span>{item.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      )
    }
  })
})
