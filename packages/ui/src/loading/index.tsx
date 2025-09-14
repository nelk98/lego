import { computed, defineComponent } from 'vue'
import './style.scss'

export const Loading = defineComponent({
  props: {
    size: Number,
    color: String,
    stroke: Number,
    text: String
  },
  setup(props) {
    const style = computed(() => {
      return {
        '--loading-size': props.size ? props.size + 'px' : undefined,
        '--loading-color': props.color,
        '--loading-stroke': props.stroke ? props.stroke + 'px' : undefined
      }
    })

    return () => {
      return (
        <div class="u_loading" style={style.value}>
          {props.text && <span class="u_loading__text">{props.text}</span>}
        </div>
      )
    }
  }
})
