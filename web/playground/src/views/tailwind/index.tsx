import { defineComponent } from 'vue'

import './style.scss'

const colorSamples = [
  {
    name: 'Theme class',
    className: 'text-primary bg-bg-0 border-border',
    previewClass: 'text-primary bg-bg-0 border-border',
    code: 'class="text-primary bg-bg-0 border-border"'
  },
  {
    name: 'Scale token',
    className: 'text-primary-500 bg-bg-1 border-line-2',
    previewClass: 'text-primary-500 bg-bg-1 border-line-2',
    code: 'class="text-primary-500 bg-bg-1 border-line-2"'
  },
  {
    name: 'CSS variable',
    className: 'text-[--color-primary] bg-[--color-bg-2] border-[--color-border]',
    previewClass: 'text-[--color-primary] bg-[--color-bg-2] border-[--color-border]',
    code: 'class="text-[--color-primary] bg-[--color-bg-2] border-[--color-border]"'
  },
  {
    name: 'SCSS variable',
    className: 'p_tailwind-scss-demo',
    previewClass: 'p_tailwind-scss-demo',
    code: '.demo { color: $color-primary; background: $color-bg-1; }'
  }
] as const

const textSamples = [
  ['text-text-0', 'Text 0'],
  ['text-text-1', 'Text 1'],
  ['text-text-2', 'Text 2'],
  ['text-text-3', 'Text 3'],
  ['text-text-muted', 'Muted']
] as const

const bgSamples = [
  ['bg-bg-0', 'BG 0'],
  ['bg-bg-1', 'BG 1'],
  ['bg-bg-2', 'BG 2'],
  ['bg-bg-3', 'BG 3'],
  ['bg-bg-4', 'BG 4']
] as const

export default defineComponent({
  name: 'TailwindView',
  setup() {
    return () => (
      <main class="p_tailwind">
        <section class="p_tailwind-hero">
          <div class="bg-primary-500">/./.</div>
          <div class="min-w-0">
            <h1 class="m-0 text-8 font-700 leading-tight text-text-0">UnoCSS theme tokens</h1>
            <p class="m-0 mt-2 max-w-720px text-4 leading-7 text-text-2">
              SCSS variables, CSS variables, and Uno theme classes all read from shared style
              tokens.
            </p>
          </div>
          <div class="flex shrink-0 gap-2">
            <button class="h-9 rounded-md border border-primary px-4 text-3.5 font-600 text-primary transition-colors hover:bg-primary-hover hover:text-primary-foreground">
              Outline
            </button>
            <button class="h-9 rounded-md bg-primary px-4 text-3.5 font-600 text-primary-foreground transition-colors hover:bg-primary-hover active:bg-primary-active">
              Primary
            </button>
          </div>
        </section>

        <section class="p_tailwind-panel">
          <div class="p_tailwind-panel-heading group">
            <h2>Color usage</h2>
            <span class="group-[.active]:text-red">theme class / arbitrary variable / SCSS</span>
          </div>
          <div class="p_tailwind-grid">
            {colorSamples.map((sample) => (
              <article key={sample.name} class="p_tailwind-card">
                <div class={['p_tailwind-preview border', sample.previewClass]}>
                  <span>{sample.name}</span>
                </div>
                <div class="p_tailwind-card-body">
                  <strong>{sample.name}</strong>
                  <code>{sample.code}</code>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section class="p_tailwind-panel">
          <div class="p_tailwind-panel-heading">
            <h2 class="xxx text-primary-100">Token scale</h2>
            <span>text / background / border</span>
          </div>
          <div class="p_tailwind-scale">
            <div class="p_tailwind-scale-column">
              {textSamples.map(([className, label]) => (
                <div key={className} class={['p_tailwind-row', className]}>
                  <span>{label}</span>
                  <code>{className}</code>
                </div>
              ))}
            </div>
            <div class="p_tailwind-scale-column">
              {bgSamples.map(([className, label]) => (
                <div key={className} class={['p_tailwind-row border border-line-3', className]}>
                  <span>{label}</span>
                  <code>{className}</code>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section class="p_tailwind-panel">
          <div class="p_tailwind-panel-heading">
            <h2>Composition</h2>
            <span>mixed class and SCSS tokens</span>
          </div>
          <div class="p_tailwind-compose">
            <div class="rounded-md border border-border bg-bg-0 p-4">
              <div class="mb-3 flex items-center justify-between gap-3">
                <div>
                  <strong class="block text-4 text-text-0">Theme-aware block</strong>
                  <span class="text-3.5 text-text-2">
                    Uno classes follow data-theme and data-primary.
                  </span>
                </div>
                <span class="rounded-full bg-primary px-3 py-1 text-3 font-600 text-primary-foreground">
                  primary
                </span>
              </div>
              <div class="grid gap-2 sm:grid-cols-3">
                <div class="rounded-md bg-bg-1 p-3 text-text-1">bg-bg-1</div>
                <div class="rounded-md bg-bg-2 p-3 text-text-1">bg-bg-2</div>
                <div class="rounded-md bg-[--color-bg-3] p-3 text-[--color-text-0]">
                  arbitrary vars
                </div>
              </div>
            </div>
            <div class="p_tailwind-scss-panel group/card">
              <strong class="group-hover/card:text-red">SCSS token panel</strong>
              <span>$color-primary / $color-bg-1 / $color-border</span>
            </div>
          </div>
        </section>
      </main>
    )
  }
})
