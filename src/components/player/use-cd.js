import { useStore } from 'vuex'
import { computed, watch, ref } from 'vue'

export default function useCD() {
  const store = useStore()
  const playing = computed(() => store.state.playing)
  const cdRef = ref(null)
  const cdImgRef = ref(null)
  const cdCls = computed(() => {
    return playing.value ? 'playing' : ''
  })
  watch(playing, (newPlaying) => {
    if (!newPlaying) {
      syncTransform(cdRef.value, cdImgRef.value)
    }
  })

  function syncTransform(wrapper, inner) {
    const wrapperTransform = getComputedStyle(wrapper).transform
    const innerTransform = getComputedStyle(inner).transform
    wrapper.style.transform = wrapperTransform === 'none' ? innerTransform : innerTransform.concat(' ', wrapperTransform)
  }

  return {
    cdCls,
    cdRef,
    cdImgRef
  }
}
