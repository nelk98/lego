import { defineComponent, ref, watchEffect } from 'vue'
import { useRoute } from 'vue-router'

export default defineComponent({
  setup() {
    const route = useRoute()
    const Comp = ref<any>(null)

    // 监听路由变化，动态加载对应组件
    watchEffect(async () => {
      // 获取 /ui/xxxx 的 xxxx 部分
      const paths = route.path.split('/').filter(Boolean)
      // 只处理 /ui/xxxx 路由
      if (paths[0] === 'ui' && paths[1]) {
        try {
          // 动态导入对应目录下的 index.tsx
          Comp.value = (await import(`./${paths[1]}/index.tsx`)).default
        } catch (e) {
          Comp.value = null
        }
      } else {
        Comp.value = null
      }
    })

    return () => {
      if (Comp.value) {
        return (
          <div>
            <h2>xxx{Comp.value.name}</h2>
            <Comp.value />
          </div>
        )
      }
      return <div>请选择一个 UI 组件</div>
    }
  }
})
