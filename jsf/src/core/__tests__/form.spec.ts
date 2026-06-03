import { describe, expect, it } from 'vitest'
import { createForm } from '../form'

function wait(ms = 0): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

describe('form validation feedback', () => {
  it('revalidates a submit-only field once it already has an error', async () => {
    const form = createForm({
      schema: {
        fields: [
          {
            name: 'name',
            required: true,
            requiredMessage: '请输入姓名',
            behavior: {
              validateTrigger: 'submit'
            }
          }
        ]
      }
    })

    const result = await form.submit()
    expect(result.valid).toBe(false)
    expect(form.getFieldState('name')?.errors[0]?.message).toBe('请输入姓名')

    form.setValue('name', 'Ada')
    await wait()

    expect(form.getErrors()).toEqual([])
    expect(form.getFieldState('name')?.errors).toEqual([])
  })

  it('revalidates errored fields affected by dependency changes', async () => {
    const form = createForm({
      schema: {
        fields: [
          {
            name: 'customerType',
            defaultValue: 'company'
          },
          {
            name: 'companyName',
            required: {
              field: 'customerType',
              op: 'eq',
              value: 'company'
            },
            requiredMessage: '请输入企业名称'
          }
        ]
      },
      defaultValues: {
        customerType: 'company',
        companyName: ''
      }
    })

    await form.submit()
    expect(form.getErrors()).toHaveLength(1)
    expect(form.getErrors()[0]?.field).toBe('companyName')

    form.setValue('customerType', 'person')
    await wait()

    expect(form.getErrors()).toEqual([])
    expect(form.getFieldState('companyName')?.required).toBe(false)
    expect(form.getFieldState('companyName')?.errors).toEqual([])
  })

  it('ignores stale async revalidation results', async () => {
    const form = createForm({
      schema: {
        fields: [
          {
            name: 'name',
            rules: [
              {
                async validator(value) {
                  await wait(value === 'bad-again' ? 30 : 1)
                  return value === 'good' || '名称不正确'
                }
              }
            ],
            behavior: {
              validateTrigger: 'submit'
            }
          }
        ]
      },
      defaultValues: {
        name: 'bad'
      }
    })

    await form.submit()
    expect(form.getErrors()).toHaveLength(1)

    form.setValue('name', 'bad-again')
    form.setValue('name', 'good')
    await wait(40)

    expect(form.getErrors()).toEqual([])
    expect(form.getFieldState('name')?.errors).toEqual([])
  })

  it('invalidates pending validation when the value changes before errors are shown', async () => {
    const form = createForm({
      schema: {
        fields: [
          {
            name: 'name',
            rules: [
              {
                async validator(value) {
                  await wait(30)
                  return value === 'good' || '名称不正确'
                }
              }
            ]
          }
        ]
      },
      defaultValues: {
        name: 'bad'
      }
    })

    const pending = form.validateField('name')
    await wait(1)

    form.setValue('name', 'good')
    await pending

    expect(form.getErrors()).toEqual([])
    expect(form.getFieldState('name')?.validating).toBe(false)
    expect(form.getFieldState('name')?.errors).toEqual([])
  })
})
