import { computed, defineComponent, ref, type PropType } from 'vue'
import {
  createForm,
  createJsf,
  defineWidget,
  defineSchema,
  dynamic,
  arrayRequiredRule,
  JsfErrorSummary,
  JsfForm,
  minRule,
  useWidgetContext,
  validatorRule,
  webBasicWidgets
} from '@lego/jsf'

import styles from './index.module.css'

type Option = {
  label: string
  value: string
  disabled?: boolean
}

type Stakeholder = {
  name: string
  role: string
  phone: string
}

const jsf = createJsf()
jsf.use(webBasicWidgets())
jsf.registerLazy('customerSelect', () => import('./CustomerSelectWidget'))

jsf.registry.registerOperator('startsWith', (left, right) => {
  return String(left ?? '').startsWith(String(right ?? ''))
})

jsf.registerValidator('mainlandPhone', (value) => {
  if (value == null || value === '') return true
  return /^1\d{10}$/.test(String(value)) || '请输入 11 位大陆手机号'
})

jsf.registerValidator('taxId', (value) => {
  if (value == null || value === '') return true
  return /^[0-9A-Z]{15,20}$/.test(String(value)) || '统一社会信用代码需为 15-20 位大写字母或数字'
})

jsf.registerValidator('positiveMoney', (value) => {
  if (value == null || value === '') return true
  const amount = Number(value)
  return (Number.isFinite(amount) && amount > 0) || '预计金额必须大于 0'
})

jsf.registerValidator('stakeholders', (value) => {
  if (!Array.isArray(value) || value.length === 0) return true

  const invalidIndex = value.findIndex((item) => {
    const row = item as Partial<Stakeholder>
    return !row.name?.trim() || !row.role?.trim() || !/^1\d{10}$/.test(row.phone ?? '')
  })

  return invalidIndex < 0 || `第 ${invalidIndex + 1} 位联系人需填写姓名、角色和 11 位手机号`
})

const positiveMoneyRule = validatorRule('positiveMoney')
const stakeholderRowsRule = validatorRule('stakeholders')

jsf.registerTransformer('centToYuan', (value) => {
  if (value == null || value === '') return ''
  return Number(value) / 100
})

jsf.registerTransformer('yuanToCent', (value) => {
  if (value == null || value === '') return undefined
  return Math.round(Number(value) * 100)
})

jsf.registerDataSource('sourceChannels', async ({ params }): Promise<Option[]> => {
  await new Promise((resolve) => window.setTimeout(resolve, 260))

  if (params.customerType === 'person') {
    return [
      { label: '线上注册', value: 'online-signup' },
      { label: '老客推荐', value: 'offline-referral' },
      { label: '门店咨询', value: 'offline-store' }
    ]
  }

  return [
    { label: '官网线索', value: 'online-web' },
    { label: '行业展会', value: 'offline-expo' },
    { label: '渠道伙伴', value: 'partner' }
  ]
})

// 直接把 WidgetDefinition 写进 schema 的示例；常规业务仍推荐注册名称，便于懒加载和低代码序列化。
const riskBadgeWidget = defineWidget({
  name: 'riskBadge',
  component: defineComponent({
    name: 'RiskBadgeWidget',
    props: {
      modelValue: String
    },
    setup(props) {
      return () => <div class="jsf-risk-badge">风控评级：{props.modelValue || '未评级'}</div>
    }
  })
})

const stakeholderListWidget = defineWidget({
  name: 'stakeholderList',
  component: defineComponent({
    name: 'StakeholderListWidget',
    props: {
      modelValue: {
        type: Array as PropType<Stakeholder[]>,
        default: () => []
      },
      disabled: Boolean,
      readonly: Boolean
    },
    emits: {
      'update:modelValue': (_value: Stakeholder[]) => true,
      blur: () => true
    },
    setup(props, { emit }) {
      const widget = useWidgetContext()
      const rootRef = ref<HTMLElement>()

      const updateRow = (index: number, patch: Partial<Stakeholder>) => {
        const next = props.modelValue.map((item) => ({ ...item }))
        next[index] = { ...next[index], ...patch } as Stakeholder
        emit('update:modelValue', next)
      }

      const addRow = () => {
        emit('update:modelValue', [
          ...props.modelValue,
          { name: '', role: '采购负责人', phone: '' }
        ])
      }

      const removeRow = (index: number) => {
        emit(
          'update:modelValue',
          props.modelValue.filter((_, currentIndex) => currentIndex !== index)
        )
      }

      widget.exposeHandle({
        async focus() {
          rootRef.value?.querySelector<HTMLInputElement>('input')?.focus()
        }
      })

      return () => (
        <div ref={rootRef} class="jsf-stakeholders">
          {props.modelValue.map((item, index) => (
            <div key={index} class="jsf-stakeholders__row">
              <input
                class="l-jsf-control"
                value={item.name}
                placeholder="姓名"
                disabled={props.disabled}
                readonly={props.readonly}
                onInput={(event) =>
                  updateRow(index, { name: (event.target as HTMLInputElement).value })
                }
                onBlur={() => emit('blur')}
              />
              <input
                class="l-jsf-control"
                value={item.role}
                placeholder="角色"
                disabled={props.disabled}
                readonly={props.readonly}
                onInput={(event) =>
                  updateRow(index, { role: (event.target as HTMLInputElement).value })
                }
                onBlur={() => emit('blur')}
              />
              <input
                class="l-jsf-control"
                value={item.phone}
                placeholder="手机号"
                disabled={props.disabled}
                readonly={props.readonly}
                onInput={(event) =>
                  updateRow(index, { phone: (event.target as HTMLInputElement).value })
                }
                onBlur={() => emit('blur')}
              />
              <button
                type="button"
                disabled={props.disabled || props.readonly || props.modelValue.length <= 1}
                onClick={() => removeRow(index)}
              >
                删除
              </button>
            </div>
          ))}
          <button type="button" disabled={props.disabled || props.readonly} onClick={addRow}>
            添加联系人
          </button>
        </div>
      )
    }
  })
})

const baseSchema = defineSchema({
  version: '1.0.0',
  fields: [
    {
      name: 'customer',
      label: '客户资料',
      children: [
        {
          name: 'type',
          label: '客户类型',
          widget: 'radio',
          defaultValue: 'company',
          required: true,
          requiredMessage: '请选择客户类型',
          props: {
            options: [
              { label: '个人客户', value: 'person' },
              { label: '企业客户', value: 'company' }
            ]
          }
        },
        {
          name: 'companyName',
          label: '企业名称',
          helper: '仅客户类型为企业时显示；隐藏时会清空旧值。',
          widget: 'input',
          props: {
            placeholder: '请输入企业名称'
          },
          visible: {
            field: 'customer.type',
            op: 'eq',
            value: 'company'
          },
          required: {
            field: 'customer.type',
            op: 'eq',
            value: 'company'
          },
          requiredMessage: '请输入企业名称',
          rules: [minRule(2, '企业名称至少 2 个字符')],
          behavior: {
            clearValueWhenHidden: true
          }
        },
        {
          name: 'personalName',
          label: '客户姓名',
          widget: 'input',
          props: {
            placeholder: '请输入客户姓名'
          },
          visible: ({ values }) => values.customer?.type === 'person',
          required: ({ values }) => values.customer?.type === 'person',
          requiredMessage: '请输入客户姓名',
          behavior: {
            clearValueWhenHidden: true
          }
        },
        {
          name: 'taxId',
          label: '统一社会信用代码',
          widget: 'input',
          props: {
            placeholder: '例如 91310000MA1K000000'
          },
          visible: {
            field: 'customer.type',
            op: 'eq',
            value: 'company'
          },
          required: {
            allOf: [
              { field: 'customer.type', op: 'eq', value: 'company' },
              { field: 'customer.companyName', op: 'notEmpty' }
            ]
          },
          requiredMessage: '请输入统一社会信用代码',
          rules: ['taxId'],
          behavior: {
            clearValueWhenHidden: true
          }
        },
        {
          name: 'contactName',
          label: dynamic(['customer.type'], ({ values }) =>
            values.customer?.type === 'company' ? '主联系人' : '本人姓名'
          ),
          widget: 'input',
          valueType: 'string',
          props: {
            placeholder: dynamic(['customer.type'], ({ values }) =>
              values.customer?.type === 'company' ? '请输入主联系人' : '请输入本人姓名'
            )
          },
          required: true,
          requiredMessage: '请输入联系人'
        },
        {
          name: 'phone',
          label: '联系电话',
          widget: 'input',
          props: {
            type: 'tel',
            placeholder: '请输入 11 位手机号'
          },
          required: true,
          requiredMessage: '请输入联系电话',
          rules: ['mainlandPhone']
        },
        {
          name: 'customerId',
          label: '关联客户',
          helper: '业务控件通过 registerLazy 按需加载，并暴露自定义 focus 链路。',
          widget: 'customerSelect',
          required: true,
          requiredMessage: '请选择关联客户'
        }
      ]
    },
    {
      name: 'opportunity',
      label: '商机信息',
      children: [
        {
          name: 'sourceChannel',
          label: '线索来源',
          widget: 'select',
          helper: 'options 来自 dataSource，会随客户类型自动重载。',
          props: {
            placeholder: '请选择线索来源'
          },
          dataSource: {
            sourceId: 'sourceChannels',
            params: {
              customerType: dynamic(['customer.type'], ({ values }) =>
                String(values.customer?.type ?? '')
              )
            },
            reloadWhen: ['customer.type']
          },
          bindings: {
            options: {
              type: 'computed',
              code: 'loadSourceChannels(values.customer.type)'
            }
          },
          required: true,
          requiredMessage: '请选择线索来源'
        },
        {
          name: 'channelRemark',
          label: '渠道备注',
          widget: 'input',
          helper: '使用自定义 startsWith 操作符：仅线下渠道显示。',
          props: {
            placeholder: '例如展会展位、推荐人、门店名称'
          },
          visible: {
            allOf: [
              { field: 'opportunity.sourceChannel', op: 'startsWith', value: 'offline' },
              {
                not: { field: 'opportunity.signedContract', op: 'truthy' }
              }
            ]
          },
          required: {
            field: 'opportunity.sourceChannel',
            op: 'startsWith',
            value: 'offline'
          },
          requiredMessage: '请补充线下渠道说明',
          behavior: {
            clearValueWhenHidden: true
          }
        },
        {
          name: 'expectedAmount',
          label: '预计成交金额',
          helper: dynamic(['opportunity.signedContract'], ({ values }) =>
            values.opportunity?.signedContract
              ? '已签约后预计金额锁定。'
              : '用于商机预测，提交时会转换为分。'
          ),
          widget: 'input',
          valueType: 'number',
          props: {
            type: 'number',
            placeholder: '单位：元'
          },
          disabled: ({ values }) => values.opportunity?.signedContract === true,
          required: true,
          requiredMessage: '请输入预计成交金额',
          rules: [positiveMoneyRule]
        },
        {
          name: 'signedContract',
          label: '已签约',
          widget: 'switch',
          defaultValue: false
        },
        {
          name: 'ownerName',
          label: '负责人',
          widget: 'input',
          valueType: 'string',
          required: true,
          requiredMessage: '请输入负责人'
        },
        {
          name: 'riskLevel',
          label: '风险评级',
          widget: riskBadgeWidget,
          defaultValue: 'A-',
          readonly: true,
          helper: '这个字段直接传入 WidgetDefinition，不依赖 registry。'
        },
        {
          name: 'contacts',
          label: dynamic(['customer.type'], ({ values }) =>
            values.customer?.type === 'company' ? '业务联系人' : '协同联系人'
          ),
          widget: stakeholderListWidget,
          valueType: 'array',
          defaultValue: [{ name: '', role: '采购负责人', phone: '' }],
          helper: '数组字段示例：schema 只声明数组值，行级交互由业务 widget 管理。',
          rules: [arrayRequiredRule('请至少维护 1 位联系人'), stakeholderRowsRule]
        },
        {
          name: 'priority',
          label: '重点客户',
          widget: 'switch',
          defaultValue: true
        },
        {
          name: 'remark',
          label: '跟进备注',
          widget: 'textarea',
          props: {
            placeholder: '记录客户背景、采购意向、下一步动作',
            rows: 5
          },
          rules: [
            (value: unknown) => String(value ?? '').length <= 200 || '跟进备注最多 200 个字符'
          ]
        }
      ]
    }
  ]
})

const permissionSchema = defineSchema({
  fields: [
    {
      name: 'opportunity',
      children: [
        {
          name: 'ownerName',
          readonly: true,
          helper: '负责人由权限系统回填，当前用户只能查看。'
        }
      ]
    }
  ]
})

const webPatchSchema = defineSchema({
  fields: [
    {
      name: 'opportunity',
      children: [
        {
          name: 'expectedAmount',
          props: {
            min: 0,
            step: 1000
          }
        }
      ]
    }
  ]
})

const retrieveMappings = [
  { source: 'customer_type', target: 'customer.type' },
  { source: 'company_name', target: 'customer.companyName' },
  { source: 'personal_name', target: 'customer.personalName' },
  { source: 'tax_id', target: 'customer.taxId' },
  { source: 'contact_name', target: 'customer.contactName' },
  { source: 'contact_phone', target: 'customer.phone' },
  { source: 'customer_id', target: 'customer.customerId' },
  { source: 'source_channel', target: 'opportunity.sourceChannel' },
  { source: 'channel_remark', target: 'opportunity.channelRemark' },
  { source: 'expected_amount_cent', target: 'opportunity.expectedAmount', transform: 'centToYuan' },
  { source: 'signed_contract', target: 'opportunity.signedContract' },
  { source: 'owner_name', target: 'opportunity.ownerName' },
  { source: 'risk_level', target: 'opportunity.riskLevel' },
  { source: 'stakeholders', target: 'opportunity.contacts' },
  { source: 'is_priority', target: 'opportunity.priority' },
  { source: 'remark_text', target: 'opportunity.remark' }
]

const formatMappings = [
  { source: 'customer.type', target: 'customer_type' },
  { source: 'customer.companyName', target: 'company_name' },
  { source: 'customer.personalName', target: 'personal_name' },
  { source: 'customer.taxId', target: 'tax_id' },
  { source: 'customer.contactName', target: 'contact_name' },
  { source: 'customer.phone', target: 'contact_phone' },
  { source: 'customer.customerId', target: 'customer_id' },
  { source: 'opportunity.sourceChannel', target: 'source_channel' },
  { source: 'opportunity.channelRemark', target: 'channel_remark' },
  { source: 'opportunity.expectedAmount', target: 'expected_amount_cent', transform: 'yuanToCent' },
  { source: 'opportunity.signedContract', target: 'signed_contract' },
  { source: 'opportunity.ownerName', target: 'owner_name' },
  { source: 'opportunity.riskLevel', target: 'risk_level' },
  { source: 'opportunity.contacts', target: 'stakeholders' },
  { source: 'opportunity.priority', target: 'is_priority' },
  { source: 'opportunity.remark', target: 'remark_text' }
]

const companyApiModel = {
  customer_type: 'company',
  company_name: '',
  personal_name: '',
  tax_id: '',
  contact_name: '陈经理',
  contact_phone: '',
  customer_id: '',
  source_channel: 'offline-expo',
  channel_remark: '',
  expected_amount_cent: 350000,
  signed_contract: false,
  owner_name: 'Nelk',
  risk_level: 'A-',
  stakeholders: [{ name: '', role: '采购负责人', phone: '' }],
  is_priority: true,
  remark_text: 'retrieve/format 会在右侧实时展示。'
}

const personApiModel = {
  customer_type: 'person',
  company_name: '',
  personal_name: '李雷',
  tax_id: '',
  contact_name: '李雷',
  contact_phone: '13800138000',
  customer_id: 'c-1002',
  source_channel: 'online-signup',
  channel_remark: '',
  expected_amount_cent: 88000,
  signed_contract: true,
  owner_name: 'Nelk',
  risk_level: 'B+',
  stakeholders: [{ name: '韩梅梅', role: '家庭成员', phone: '13700137000' }],
  is_priority: false,
  remark_text: '这是通过 setModel 从后端结构重新回填的个人客户。'
}

export default defineComponent({
  name: 'JsfPlaygroundView',
  setup() {
    const version = ref(0)
    const lastSubmit = ref('尚未提交')
    const tracePath = ref('customer.companyName')
    const eventLogs = ref<string[]>([])

    const appendLog = (message: string) => {
      const time = new Date().toLocaleTimeString('zh-CN', { hour12: false })
      eventLogs.value = [`${time} ${message}`, ...eventLogs.value].slice(0, 8)
    }

    const form = createForm({
      schemas: [baseSchema, permissionSchema, webPatchSchema],
      registry: jsf.registry,
      model: companyApiModel,
      retrieve: retrieveMappings,
      format: formatMappings,
      onValuesChange() {
        appendLog('onValuesChange')
      },
      hooks: {
        onFieldChange({ field, value }) {
          appendLog(`change: ${field.path} = ${JSON.stringify(value)}`)
        },
        onValidateEnd({ errors }) {
          appendLog(`validate: ${errors.length} error(s)`)
        },
        onLocateField({ fieldPath }) {
          appendLog(`locate: ${fieldPath}`)
        }
      }
    })

    form.subscribe(() => {
      version.value += 1
    })

    const valuesText = computed(() => {
      version.value
      return JSON.stringify(form.getValues(), null, 2)
    })

    const modelText = computed(() => {
      version.value
      return JSON.stringify(form.getModel(), null, 2)
    })

    const dependencyText = computed(() => {
      version.value
      return JSON.stringify(
        [...form.getDependencyGraph().entries()].map(([field, dependencies]) => ({
          field,
          dependencies: [...dependencies]
        })),
        null,
        2
      )
    })

    const fieldPaths = [...form.schema.fieldMap.keys()]

    const traceText = computed(() => {
      version.value
      const trace = form.getFieldTrace(tracePath.value)
      const resolvedField = trace.resolvedField

      return JSON.stringify(
        {
          field: trace.field
            ? {
                path: trace.field.path,
                label: trace.field.label,
                resolvedLabel: resolvedField?.label,
                widget:
                  typeof resolvedField?.widget === 'string'
                    ? resolvedField.widget
                    : resolvedField?.widget?.name,
                valueType: resolvedField?.valueType,
                required: trace.field.required,
                visible: trace.field.visible,
                disabled: trace.field.disabled,
                readonly: trace.field.readonly,
                resolvedProps: resolvedField?.props,
                bindings: trace.field.bindings
              }
            : undefined,
          value: trace.value,
          state: trace.state,
          errors: trace.errors,
          dependencies: trace.dependencies,
          dataSource: trace.dataSource
        },
        null,
        2
      )
    })

    const validate = async () => {
      const result = await form.validate()
      if (!result.valid) {
        await form.locateField(result.errors[0]!.field)
        lastSubmit.value = `校验失败：${result.errors.length} 个错误`
        return
      }

      lastSubmit.value = JSON.stringify(form.getModel(), null, 2)
    }

    const usePersonModel = () => {
      form.setModel(personApiModel)
      lastSubmit.value = '已通过 setModel 回填个人客户'
    }

    const fillCompanyDraft = () => {
      form.patchValues({
        customer: {
          companyName: '乐高科技',
          taxId: '91310000MA1K000000',
          contactName: '王经理',
          phone: '13900139000',
          customerId: 'c-1001'
        },
        opportunity: {
          sourceChannel: 'offline-expo',
          channelRemark: '上海行业展 A12 展位',
          expectedAmount: 56000,
          contacts: [
            { name: '王经理', role: '采购负责人', phone: '13900139000' },
            { name: '赵工', role: '技术评估', phone: '13600136000' }
          ]
        }
      })
      lastSubmit.value = '已通过 patchValues 填充企业草稿'
    }

    return () => (
      <main class={styles.page}>
        <header class={styles.hero}>
          <div>
            <h1>JSF 动态表单</h1>
            <p>
              客户建档示例：多 Schema、联动、校验、dataSource、异步业务控件、定位链路和
              retrieve/format。
            </p>
          </div>
          <div class={styles.actions}>
            <button type="button" onClick={validate}>
              校验并提交
            </button>
            <button type="button" onClick={fillCompanyDraft}>
              填充企业草稿
            </button>
            <button type="button" onClick={usePersonModel}>
              回填个人客户
            </button>
            <button type="button" onClick={() => form.focusField('customer.customerId')}>
              定位客户控件
            </button>
            <button
              type="button"
              onClick={() => form.setFieldReadonly('opportunity.ownerName', false)}
            >
              解除负责人只读
            </button>
            <button type="button" onClick={() => form.reset()}>
              重置
            </button>
          </div>
        </header>

        <div class={styles.grid}>
          <section class={styles.panel}>
            <h2>表单</h2>
            <JsfErrorSummary form={form} />
            <JsfForm form={form} />
          </section>

          <aside class={[styles.panel, styles.debug]}>
            <h2>运行时数据</h2>
            <div class={styles.traceBar}>
              <strong>field trace</strong>
              <select
                value={tracePath.value}
                onChange={(event) => {
                  tracePath.value = (event.target as HTMLSelectElement).value
                }}
              >
                {fieldPaths.map((path) => (
                  <option key={path} value={path}>
                    {path}
                  </option>
                ))}
              </select>
            </div>
            <pre>{traceText.value}</pre>
            <div>
              <strong>values</strong>
              <pre>{valuesText.value}</pre>
            </div>
            <div>
              <strong>format(model)</strong>
              <pre>{modelText.value}</pre>
            </div>
            <div>
              <strong>last submit</strong>
              <pre>{lastSubmit.value}</pre>
            </div>
            <div>
              <strong>dependency graph</strong>
              <pre>{dependencyText.value}</pre>
            </div>
            <div>
              <strong>hooks</strong>
              <ul class={styles.logs}>
                {eventLogs.value.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </main>
    )
  }
})
