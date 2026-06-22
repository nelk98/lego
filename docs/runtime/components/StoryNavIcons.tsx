import type { FunctionalComponent } from 'vue'

const iconAttrs = {
  viewBox: '0 0 24 24',
  fill: 'none',
  'aria-hidden': 'true'
} as const

const strokeAttrs = {
  stroke: 'currentColor',
  'stroke-width': '1.5',
  'stroke-miterlimit': '10',
  'stroke-linecap': 'round',
  'stroke-linejoin': 'round'
} as const

const roundStrokeAttrs = {
  stroke: 'currentColor',
  'stroke-width': '1.5',
  'stroke-linecap': 'round',
  'stroke-linejoin': 'round'
} as const

export const FolderCollapsedIcon: FunctionalComponent = () => (
  <svg {...iconAttrs}>
    <path d="M12.0601 16.5V11.5" {...strokeAttrs} />
    <path d="M14.5 14H9.5" {...strokeAttrs} />
    <path
      d="M2 13.02V7C2 3 3 2 7 2H8.5C10 2 10.33 2.44 10.9 3.2L12.4 5.2C12.78 5.7 13 6 14 6H17C21 6 22 7 22 11"
      {...strokeAttrs}
    />
    <path
      d="M22 14.9902V17.0002C22 21.0002 21 22.0002 17 22.0002H7C3 22.0002 2 21.0002 2 17.0002"
      {...strokeAttrs}
    />
  </svg>
)

export const FolderExpandedIcon: FunctionalComponent = () => (
  <svg {...iconAttrs}>
    <path
      d="M21.3698 18.02L21.2698 19.3C21.1198 20.83 20.9998 22 18.2898 22H5.70977C2.99977 22 2.87977 20.83 2.72977 19.3L2.32977 14.3C2.24977 13.47 2.50977 12.7 2.97977 12.11C2.98977 12.1 2.98977 12.1 2.99977 12.09C3.54977 11.42 4.37977 11 5.30977 11H18.6898C19.6198 11 20.4398 11.42 20.9798 12.07C20.9898 12.08 20.9998 12.09 20.9998 12.1C21.4898 12.69 21.7598 13.46 21.6698 14.3"
      {...strokeAttrs}
    />
    <path
      d="M3.5 11.4303V6.28027C3.5 2.88027 4.35 2.03027 7.75 2.03027H9.02C10.29 2.03027 10.58 2.41027 11.06 3.05027L12.33 4.75027C12.65 5.17027 12.84 5.43027 13.69 5.43027H16.24C19.64 5.43027 20.49 6.28027 20.49 9.68027V11.4703"
      {...strokeAttrs}
    />
    <path d="M9.43018 17H14.5702" {...strokeAttrs} />
  </svg>
)

export const DocsIcon: FunctionalComponent = () => (
  <svg {...iconAttrs}>
    <path
      d="M3 7C3 4 4.5 2 8 2H16C19.5 2 21 4 21 7V17C21 20 19.5 22 16 22H8C4.5 22 3 20 3 17V10.95"
      {...strokeAttrs}
    />
    <path
      d="M15.5 5.98999V9.85999C15.5 10.3 14.98 10.52 14.66 10.23L12.34 8.09003C12.15 7.91003 11.85 7.91003 11.66 8.09003L9.34003 10.23C9.02003 10.52 8.5 10.3 8.5 9.85999V2H15.5"
      {...strokeAttrs}
    />
    <path d="M13.25 14H17.5" {...strokeAttrs} />
    <path d="M9 18H17.5" {...strokeAttrs} />
  </svg>
)

export const ComponentIcon: FunctionalComponent = () => (
  <svg {...iconAttrs}>
    <path
      d="M18.9198 5.54031C20.6198 6.29031 20.6198 7.53031 18.9198 8.28031L13.0198 10.9003C12.3498 11.2003 11.2498 11.2003 10.5798 10.9003L4.67979 8.28031C2.97979 7.53031 2.97979 6.29031 4.67979 5.54031L10.5798 2.92031C11.2498 2.62031 12.3498 2.62031 13.0198 2.92031L14.9398 3.77031"
      {...roundStrokeAttrs}
    />
    <path
      d="M3 11C3 11.84 3.63 12.81 4.4 13.15L11.19 16.17C11.71 16.4 12.3 16.4 12.81 16.17L19.6 13.15C20.37 12.81 21 11.84 21 11"
      {...roundStrokeAttrs}
    />
    <path
      d="M3 16C3 16.93 3.55 17.77 4.4 18.15L11.19 21.17C11.71 21.4 12.3 21.4 12.81 21.17L19.6 18.15C20.45 17.77 21 16.93 21 16"
      {...roundStrokeAttrs}
    />
  </svg>
)

export const VariantIcon: FunctionalComponent = () => (
  <svg {...iconAttrs}>
    <path d="M9.25 9.05078C11.03 9.70078 12.97 9.70078 14.75 9.05078" {...roundStrokeAttrs} />
    <path
      d="M3.31982 10V19.95C3.31982 21.75 4.60982 22.51 6.18982 21.64L11.0698 18.93C11.5898 18.64 12.4298 18.64 12.9398 18.93L17.8198 21.64C19.3998 22.52 20.6898 21.76 20.6898 19.95V5.86C20.6898 3.74 18.9498 2 16.8298 2H7.17982C5.04982 2 3.31982 3.74 3.31982 5.86"
      {...roundStrokeAttrs}
    />
  </svg>
)

export const ChevronIcon: FunctionalComponent = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M8.9101 20.6695C8.7201 20.6695 8.5301 20.5995 8.3801 20.4495C8.0901 20.1595 8.0901 19.6795 8.3801 19.3895L14.9001 12.8695C15.3801 12.3895 15.3801 11.6095 14.9001 11.1295L8.3801 4.60953C8.0901 4.31953 8.0901 3.83953 8.3801 3.54953C8.6701 3.25953 9.1501 3.25953 9.4401 3.54953L15.9601 10.0695C16.4701 10.5795 16.7601 11.2695 16.7601 11.9995C16.7601 12.7295 16.4801 13.4195 15.9601 13.9295L9.4401 20.4495C9.2901 20.5895 9.1001 20.6695 8.9101 20.6695Z"
      fill="currentColor"
    />
  </svg>
)
