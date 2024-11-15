import { useStore } from 'vuex'
import { computed, watch, ref } from 'vue'
import { getLyric } from '@/service/song'
import Lyric from 'lyric-parser'

export default function useLyric(songReady, currentTime) {
  const currentLyric = ref(null)
  const currentTlyric = ref(null)
  const currentLineNum = ref(0)
  // const pureMusicLyric = ref('')
  const lyricScrollRef = ref(null)
  const lyricListRef = ref(null)
  const playingLyric = ref('')
  const store = useStore()
  const currentSong = computed(() => store.getters.currentSong)

  watch(currentSong, async (newSong) => {
    if (!newSong.url || !newSong.id) {
      return
    }
    const scrollComp = lyricScrollRef.value
    if (scrollComp && scrollComp.scroll) {
      scrollComp.scroll.scrollTo(0, 0, 1000)
    }
    stopLyric()
    currentLyric.value = null
    currentTlyric.value = null
    currentLineNum.value = 0
    playingLyric.value = ''

    const lyric = await getLyric(newSong)
    if (lyric?.tlyric?.lyric) {
      store.commit('addSongLyric', {
        song: newSong,
        lyric: lyric.lrc.lyric,
        tlyric: lyric.tlyric.lyric
      })
      currentLyric.value = new Lyric(formatLyric(lyric.lrc.lyric), handleLyric)
      // const hasLyric = currentLyric.value.lines.length
      currentTlyric.value = new Lyric(formatLyric(lyric.tlyric.lyric), handleLyricCN)
    } else {
      store.commit('addSongLyric', {
        song: newSong,
        lyric: lyric.lrc.lyric,
        tlyric: null
      })
      currentLyric.value = new Lyric(lyric.lrc.lyric, handleLyricCN)
    }
    if (songReady.value) {
      playLyric()
    }
  })

  function formatLyric(lyric) {
    const formattedLyrics = lyric.replace(/\[(\d{2}:\d{2}\.\d{2})\d\]/g, (match, p1) => {
      return `[${p1}]`
    })
    return formattedLyrics
  }

  function playLyric() {
    const currentLyricVal = currentLyric.value
    const currentlTyricVal = currentTlyric.value
    if (currentLyricVal) {
      currentLyricVal.seek(currentTime.value * 1000)
    }
    if (currentlTyricVal) {
      currentlTyricVal.seek(currentTime.value * 1000)
    }
  }

  function stopLyric() {
    const currentLyricVal = currentLyric.value
    const currentlTyricVal = currentTlyric.value
    if (currentLyricVal) {
      currentLyricVal.stop()
    }
    if (currentlTyricVal) {
      currentlTyricVal.stop()
    }
  }

  function handleLyricCommon({ lineNum, txt }, isCN = false) {
    currentLineNum.value = lineNum
    if (isCN) {
      playingLyric.value = txt
    }
    const scrollComp = lyricScrollRef.value
    const listEl = lyricListRef.value
    if (!listEl) {
      return
    }
    if (lineNum > 5) {
      const lineEl = listEl.children[lineNum - 5]
      scrollComp.scroll.scrollToElement(lineEl, 1000)
    } else {
      scrollComp.scroll.scrollTo(0, 0, 1000)
    }
  }

  function handleLyric({ lineNum, txt }) {
    handleLyricCommon({ lineNum, txt })
  }

  function handleLyricCN({ lineNum, txt }) {
    handleLyricCommon({ lineNum, txt }, true)
  }

  return {
    playingLyric,
    currentLyric,
    currentTlyric,
    currentLineNum,
    lyricScrollRef,
    lyricListRef,
    playLyric,
    stopLyric
  }
}
