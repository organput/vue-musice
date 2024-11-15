<template>
  <div
    class="player"
    v-show="playList.length"
  >
    <transition
      name="normal"
      @enter="enter"
      @after-enter="afterEnter"
      @leave="leave"
      @after-leave="afterLeave"
    >
      <div
        class="normal-player"
        v-show="fullScreen"
      >
        <template v-if="currentSong">
          <div class="background">
            <img :src="currentSong.picUrl">
          </div>
          <div class="top">
            <div
              class="back"
              @click="goBack"
            >
              <i class="icon-back"></i>
            </div>
            <h1 class="title">{{ currentSong.name }}</h1>
            <h2 class="subtitle">{{ currentSong.artist }}</h2>
          </div>
          <div
            class="middle"
            @touchstart.prevent="onMiddleTouchStart"
            @touchmove.prevent="onMiddleTouchMove"
            @touchend.prevent="onMiddleTouchEnd"
          >
            <div
              class="middle-l"
              :style="middleLStyle"
            >
              <div
                class="cd-wrapper"
                ref="cdWrapperRef"
              >
                <div
                  class="cd"
                  ref="cdRef"
                >
                  <img
                    ref="cdImgRef"
                    class="image"
                    :class="cdCls"
                    :src="currentSong.picUrl"
                  >
                </div>
              </div>
              <div class="playing-lyric-wrapper">
                <div class="playing-lyric">{{playingLyric}}</div>
              </div>
            </div>
            <m-scroll
              class="middle-r"
              :style="middleRStyle"
              ref="lyricScrollRef"
            >
              <div class="lyric-wrapper">
                <div v-if="currentLyric" ref="lyricListRef">
                  <div
                    class="text"
                    :class="{'current': currentLineNum === index}"
                    v-for="(line, index) in currentLyric.lines"
                    :key="line.num"
                  >
                    {{ line.txt }}
                    <p
                      v-if="currentTlyric"
                      class="text-cn"
                      :class="{'current': currentLineNum === index}"
                    >
                      {{ currentTlyric.lines[index]?.txt }}
                    </p>
                  </div>
                </div>
              </div>
            </m-scroll>
          </div>
          <div class="bottom">
            <div class="dot-wrapper">
              <span class="dot" :class="{'active': currentShow==='cd'}"></span>
              <span class="dot" :class="{'active': currentShow==='lyric'}"></span>
            </div>
            <div class="progress-wrapper">
              <span class="time time-l">{{ formatTime(currentTime) }}</span>
              <div class="progress-bar-wrapper">
                <progress-bar
                  ref="barRef"
                  :progress="progress"
                  @progress-changing="onProgressChanging"
                  @progress-changed="onProgressChanged"
                ></progress-bar>
              </div>
              <span class="time time-r">{{ formatTime2(currentSong.time) }}</span>
            </div>
            <div class="operators">
              <div class="icon i-left">
                <i :class="modeIcon" @click="changeMode"></i>
              </div>
              <div class="icon i-left" :class="disableCls">
                <i @click="prev" class="icon-prev"></i>
              </div>
              <div class="icon i-center"  :class="disableCls">
                <i @click="togglePlay" :class="playIcon"></i>
              </div>
              <div class="icon i-right" :class="disableCls">
                <i @click="next" class="icon-next"></i>
              </div>
              <div class="icon i-right">
                <i class="icon-not-favorite"></i>
              </div>
            </div>
          </div>
        </template>
      </div>
    </transition>
    <mini-player
      :progress="progress"
      :toggle-play="togglePlay"
    ></mini-player>
    <audio
      ref="audioRef"
      @pause="pause"
      @canplay="ready"
      @timeupdate="updataTime"
      @ended="end"
    ></audio>
  </div>
</template>

<script>
  import { useStore } from 'vuex'
  import { computed, watch, ref, onMounted, nextTick } from 'vue'
  import useMode from './use-mode.js'
  import useCd from './use-cd.js'
  import { formatTime, formatTime2 } from '@/assets/js/util.js'
  import MScroll from '@/components/base/scroll/scroll.vue'
  import ProgressBar from './progress-bar.vue'
  import { PLAY_MODE } from '@/assets/js/constant'
  import useLyric from './use-lyric.js'
  import useMiddleInteractive from './use-middle-interactive.js'
  import MiniPlayer from './mini-player.vue'
  import useAnimation from './use-animation.js'
  import usePlayHistory from './use-play-history'

  export default {
    name: 'm-player',
    components: {
      ProgressBar,
      MScroll,
      MiniPlayer
    },
    setup() {
      const audioRef = ref(null)
      const store = useStore()
      const songReady = ref(false)
      const barRef = ref(null)
      const fullScreen = computed(() => store.state.fullScreen)
      const currentSong = computed(() => store.getters.currentSong)
      const playing = computed(() => store.state.playing)
      const currentIndex = computed(() => store.state.currentIndex)
      const playList = computed(() => store.state.playList)
      const playMode = computed(() => store.state.playMode)
      const currentTime = ref(0)
      let progressChanging = false
      const playIcon = computed(() => {
        return playing.value ? 'icon-pause' : 'icon-play'
      })
      const disableCls = computed(() => {
        return songReady.value ? '' : 'disable'
      })
      const progress = computed(() => {
        return currentTime.value / (currentSong.value.time / 1000)
      })
      const { modeIcon, changeMode } = useMode()
      const { cdCls, cdRef, cdImgRef } = useCd()
      const { stopLyric, currentLyric, currentTlyric, currentLineNum, playLyric, lyricScrollRef, lyricListRef, playingLyric } = useLyric(songReady, currentTime)
      const { currentShow, middleLStyle, middleRStyle, onMiddleTouchStart, onMiddleTouchMove, onMiddleTouchEnd } = useMiddleInteractive()
      const { cdWrapperRef, enter, afterEnter, leave, afterLeave } = useAnimation()
      const { savePlay } = usePlayHistory()

      onMounted(() => {
        const audioEl = audioRef.value
        console.log(playingLyric.value)
        if (audioEl && currentSong.value.url) {
          audioEl.src = currentSong.value.url
          audioEl.play()
        }
        watch(playing, (newPlaying) => {
          if (!songReady.value) {
            return
          }
          const audioEl = audioRef.value
          if (newPlaying) {
            audioEl.play()
            playLyric()
          } else {
            audioEl.pause()
            stopLyric()
          }
        })
        watch(fullScreen, async (newfullScreen) => {
          if (newfullScreen) {
            await nextTick()
            barRef.value.setOffset(progress.value)
          }
        })
      })
      watch(currentSong, (newSong) => {
        songReady.value = false
        const audioEl = audioRef.value
        if (!audioEl || !newSong.id || !newSong.url) {
          return
        }
        currentTime.value = 0
        audioEl.src = newSong.url
        audioEl.play()
        store.commit('setPlayingState', true)
      })

      function goBack() {
        store.commit('setFullScreen', false)
      }
      function togglePlay() {
        if (!songReady.value) {
          return
        }
        store.commit('setPlayingState', !playing.value)
      }
      function pause() {
        store.commit('setPlayingState', false)
      }
      function prev() {
        const list = playList.value
        if (!songReady.value || !list.length) {
          return
        }
        if (list.length === 1) {
          loop()
        } else {
          let index = currentIndex.value - 1
          if (index === -1) {
            index = list.length - 1
          }
          store.commit('setCurrentIndex', index)
        }
      }
      function next() {
        const list = playList.value
        if (!songReady.value || !list.length) {
          return
        }
        if (list.length === 1) {
          loop()
        } else {
          let index = currentIndex.value + 1
          if (index === list.length) {
            index = 0
          }
          store.commit('setCurrentIndex', index)
        }
      }
      function loop() {
        const audioEl = audioRef.value
        audioEl.currentTime = 0
        audioEl.play()
        store.commit('setPlayingState', true)
      }
      function ready() {
        if (songReady.value) {
          return
        }
        songReady.value = true
        playLyric()
        savePlay(currentSong.value)
      }
      function updataTime(e) {
        if (!progressChanging) {
          currentTime.value = e.target.currentTime
        }
      }
      function onProgressChanging(progress) {
        progressChanging = true
        currentTime.value = (currentSong.value.time / 1000) * progress
        playLyric()
        stopLyric()
      }
      function onProgressChanged(progress) {
        progressChanging = false
        audioRef.value.currentTime = currentTime.value = (currentSong.value.time / 1000) * progress
        if (!playing.value) {
          store.commit('setPlayingState', true)
        }
        playLyric()
      }
      function end() {
        currentTime.value = 0
        console.log('end')
        if (playMode.value === PLAY_MODE.loop) {
          loop()
        } else {
          next()
        }
      }
      return {
        cdWrapperRef,
        enter,
        afterEnter,
        leave,
        afterLeave,
        playingLyric,
        barRef,
        playList,
        currentShow,
        middleLStyle,
        middleRStyle,
        onMiddleTouchStart,
        onMiddleTouchMove,
        onMiddleTouchEnd,
        lyricScrollRef,
        lyricListRef,
        currentLyric,
        currentTlyric,
        currentLineNum,
        cdRef,
        cdImgRef,
        cdCls,
        onProgressChanged,
        onProgressChanging,
        currentTime,
        fullScreen,
        currentSong,
        audioRef,
        goBack,
        playIcon,
        togglePlay,
        pause,
        next,
        prev,
        ready,
        disableCls,
        modeIcon,
        changeMode,
        updataTime,
        progress,
        formatTime,
        formatTime2,
        end,
        stopLyric
      }
    }
  }
</script>

<style lang="scss" scoped>
  .player {
    .normal-player {
      position: fixed;
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      z-index: 150;
      background: $color-background;
      .background {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        z-index: -1;
        opacity: 0.6;
        filter: blur(20px);

        img {
          width: 100%;
          height: 100%;
        }
      }
      .top {
        position: relative;
        margin-bottom: 25px;
        padding-top: 10px;
        .back {
          position: absolute;
          top: 10px;
          left: 6px;
          z-index: 50;
        }
        .icon-back {
          display: block;
          padding: 9px;
          font-size: $font-size-large-x;
          color: $color-theme;
          transform: rotate(-90deg);
        }
        .title {
          width: 70%;
          margin: 0 auto;
          line-height: 40px;
          text-align: center;
          @include no-wrap();
          font-size: $font-size-large;
          color: $color-text;
        }
        .subtitle {
          line-height: 20px;
          text-align: center;
          font-size: $font-size-medium;
          color: $color-text;
        }
      }
      .middle {
        position: fixed;
        width: 100%;
        top: 80px;
        bottom: 170px;
        white-space: nowrap;
        font-size: 0;
        .middle-l {
          display: inline-block;
          vertical-align: top;
          position: relative;
          width: 100%;
          height: 0;
          padding-top: 80%;
          .cd-wrapper {
            position: absolute;
            left: 10%;
            top: 20%;
            width: 80%;
            box-sizing: border-box;
            height: 100%;
            .cd {
              width: 100%;
              height: 100%;
              border-radius: 50%;
              img {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
                box-sizing: border-box;
                border-radius: 50%;
                border: 10px solid rgba(255, 255, 255, 0.1);
              }
              .playing {
                animation: rotate 20s linear infinite
              }
            }
          }
          .playing-lyric-wrapper {
            width: 80%;
            margin: 150px auto 0 auto;
            overflow: hidden;
            text-align: center;
            .playing-lyric {
              height: 20px;
              line-height: 20px;
              font-size: $font-size-medium;
              color: $color-text-l;
            }
          }
        }
        .middle-r {
          display: inline-block;
          vertical-align: top;
          width: 100%;
          height: 100%;
          overflow: hidden;
          .lyric-wrapper {
            width: 80%;
            margin: 0 auto;
            overflow: hidden;
            text-align: center;
            .text {
              line-height: 32px;
              color: $color-text-l;
              font-size: $font-size-medium-x;
              &.current {
                color: $color-text;
              }
            }
            .text-cn {
              line-height: 12px;
              margin-bottom: 12px;
              color: $color-text-l;
              font-size: 13px;
              &.current {
                color: $color-text;
              }
            }
            .pure-music {
              padding-top: 50%;
              line-height: 32px;
              color: $color-text-l;
              font-size: $font-size-medium;
            }
          }
        }
      }
      .bottom {
        position: absolute;
        bottom: 50px;
        width: 100%;
        .dot-wrapper {
          text-align: center;
          font-size: 0;
          .dot {
            display: inline-block;
            vertical-align: middle;
            margin: 0 4px;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: $color-text-l;
            &.active {
              width: 20px;
              border-radius: 5px;
              background: $color-text-ll;
            }
          }
        }
        .progress-wrapper {
          display: flex;
          align-items: center;
          width: 80%;
          margin: 0px auto;
          padding: 10px 0;
          .time {
            color: $color-text;
            font-size: $font-size-small;
            flex: 0 0 40px;
            line-height: 30px;
            width: 40px;
            &.time-l {
              text-align: left;
            }
            &.time-r {
              text-align: right;
            }
          }
          .progress-bar-wrapper {
            flex: 1;
          }
        }
        .operators {
          display: flex;
          align-items: center;
          .icon {
            flex: 1;
            color: $color-theme;
            &.disable {
              color: $color-theme-d;
            }
            i {
              font-size: 30px;
            }
          }
          .i-left {
            text-align: right;
          }
          .i-center {
            padding: 0 20px;
            text-align: center;
            i {
              font-size: 40px;
            }
          }
          .i-right {
            text-align: left
          }
          .icon-favorite {
            color: $color-sub-theme;
          }
        }
      }
      &.normal-enter-active, &.normal-leave-active {
        transition: all .6s;
        .top, .bottom {
          transition: all .6s cubic-bezier(0.45, 0, 0.55, 1);
        }
      }
      &.normal-enter-from, &.normal-leave-to {
        opacity: 0;
        .top {
          transform: translate3d(0, -100px, 0);
        }
        .bottom {
          transform: translate3d(0, 100px, 0)
        }
      }
    }
  }
</style>
