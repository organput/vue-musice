<template>
  <div
    ref="rootRef"
    class="suggest"
    v-loading:[loadingText]="loading"
    v-no-result:[noResultText]="noResult"
  >
    <ul class="suggest-list">
      <li
        class="suggest-item"
        v-if="singer"
        @click="selectSinger(singer)"
      >
        <div class="icon">
          <i class="icon-mine"></i>
        </div>
        <div class="name">
          <p class="text">{{ singer.name }}</p>
        </div>
      </li>
      <li
        class="suggest-item"
        v-for="song in songs"
        :key="song.id"
        @click="selectSong(song)"
      >
        <div class="icon">
          <i class="icon-music"></i>
        </div>
        <div class="name">
          <p class="text">
            {{song.singer}}-{{song.name}}
          </p>
        </div>
      </li>
      <div
        class="suggest-item"
        v-loading:[loadingText]="pullUpLoading"
      ></div>
    </ul>
  </div>
</template>

<script>
  import { ref, watch, computed, nextTick } from 'vue'
  import { getSearch } from '@/service/search'
  import { getSongs, getSongsDetail } from '@/service/song'
  import usePullUpLoad from './use-pull-up-load'

  export default {
    name: 'm-suggest',
    props: {
      query: String,
      showSinger: {
        type: Boolean,
        default: true
      }
    },
    emits: ['select-song', 'select-singer'],
    setup(props, { emit }) {
      const singer = ref(null)
      const songs = ref([])
      const hasMore = ref(true)
      const page = ref(1)
      const loadingText = ref('')
      const limit = ref(30)
      const noResultText = ref('抱歉，暂无搜索结果')
      const manualLoading = ref(false)

      const loading = computed(() => {
        return !singer.value && !songs.value.length
      })

      const noResult = computed(() => {
        return !singer.value && !songs.value.length && !hasMore.value
      })

      const pullUpLoading = computed(() => {
        return isPullUpLoad.value && hasMore.value
      })

      const preventPullUpLoad = computed(() => {
        return loading.value || manualLoading.value
      })

      const { isPullUpLoad, rootRef, scroll } = usePullUpLoad(searchMore, preventPullUpLoad)

      watch(() => props.query, async (newQuery) => {
        if (!newQuery) {
          return
        }
        await searchFirst()
      })

      async function searchFirst() {
        console.log(props.query)
        if (!props.query) {
          return
        }
        page.value = 1
        songs.value = []
        singer.value = null
        hasMore.value = true

        const result = await getSearch(props.query, (page.value - 1) * limit.value, limit.value)
        console.log(result, 2)
        const ids = result.result.songs.map(song => song.id).join(',')
        const response = await getSongs(ids)
        const detail = await getSongsDetail(ids)
        console.log(detail, 3)
        const urls = response.data.map(item => ({
          id: item.id,
          url: item.url,
          time: item.time
        }))
        const picUrls = detail.songs.map(item => ({
          id: item.id,
          picUrl: item.al.picUrl
        }))
        result.result.songs.forEach(song => {
          const urlData = urls.find(url => url.id === song.id)
          const picData = picUrls.find(url => url.id === song.id)
          if (urlData) {
            song.url = urlData.url
            song.time = urlData.time
            song.singer = song.artists.map(artist => artist.name).join('/')
            song.picUrl = picData.picUrl
          }
        })
        songs.value = result.result.songs
        await nextTick()
        await makeItScrollable()
      }

      async function searchMore() {
        if (!hasMore.value || !props.query) {
          return
        }
        page.value++
        const result = await getSearch(props.query, (page.value - 1) * limit.value, limit.value)
        const ids = result.result.songs.map(song => song.id).join(',')
        const res = await getSongs(ids)
        const urls = res.data.map(item => ({
          id: item.id,
          url: item.url,
          time: item.time
        }))
        result.result.songs.forEach(song => {
          const urlData = urls.find(url => url.id === song.id)
          if (urlData) {
            song.url = urlData.url
            song.time = urlData.time
            song.singer = song.artists.map(artist => artist.name).join('/')
          }
        })
        console.log(result, 1)
        songs.value = songs.value.concat(result.result.songs)
        await nextTick()
        await makeItScrollable()
      }

      async function makeItScrollable() {
        if (scroll.value.maxScrollY >= -1) {
          manualLoading.value = true
          await searchMore()
          manualLoading.value = false
        }
      }

      function selectSong(song) {
        emit('select-song', song)
      }

      function selectSinger(singer) {
        emit('select-singer', singer)
      }

      return {
        singer,
        songs,
        loadingText,
        noResultText,
        loading,
        noResult,
        pullUpLoading,
        selectSong,
        selectSinger,
        // pullUpLoad
        rootRef
      }
    }
  }
</script>

<style lang="scss" scoped>
  .suggest {
    height: 100%;
    overflow: hidden;
    .suggest-list {
      padding: 0 30px;
      .suggest-item {
        display: flex;
        align-items: center;
        padding-bottom: 20px;
        .icon {
          flex: 0 0 30px;
          width: 30px;
          [class^="icon-"] {
            font-size: 14px;
            color: $color-text-d;
          }
        }
        .name {
          flex: 1;
          font-size: $font-size-medium;
          color: $color-text-d;
          overflow: hidden;
          .text {
            @include no-wrap();
          }
        }
      }
    }
  }
</style>
