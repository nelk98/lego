import {
  UiSelect,
  type UiSelectModelValue,
  type UiSelectOption,
  type UiSelectOptionGroup,
  type UiSelectOptionInput,
  type UiSelectValueType
} from '../../shadcn/select'

export type SelectValueType = UiSelectValueType
export type SelectModelValue = UiSelectModelValue
export type SelectOption<T extends SelectValueType = SelectValueType> = UiSelectOption<T>
export type SelectOptionGroup<T extends SelectValueType = SelectValueType> = UiSelectOptionGroup<T>
export type SelectOptionInput<T extends SelectValueType = SelectValueType> = UiSelectOptionInput<T>

export const Select = UiSelect

export default Select
