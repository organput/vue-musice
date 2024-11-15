<template>
  <div class="singer-detail">
    <music-list
      :songs="songs"
      :title="title"
      :pic="pic"
      :loading="loading"
    ></music-list>
  </div>
</template>

<script>
  import { getSingerSongs } from '@/service/singer'
  import { getSongs } from '@/service/song'
  import MusicList from '@/components/music-list/music-list.vue'
  import storage from 'good-storage'
  import { SINGER_KEY } from '@/assets/js/constant.js'

  export default {
    name: 'singer-detail',
    components: {
      MusicList
    },
    props: {
      singer: Object
    },
    data() {
      return {
        songs: [],
        loading: true
      }
    },
    computed: {
      computedSinger() {
        let ret = null
        const singer = this.singer
        if (singer) {
          ret = singer
        } else {
          const cachedSinger = storage.session.get(SINGER_KEY)
          if (cachedSinger && String(cachedSinger.id) === this.$route.params.id) {
            ret = cachedSinger
          }
        }
        return ret
      },
      pic() {
        const singer = this.computedSinger
        return singer && singer.picUrl
      },
      title() {
        const singer = this.computedSinger
        return singer && singer.name
      }
    },
    async created() {
      if (!this.computedSinger) {
        const path = this.$route.matched[0].path
        this.$router.push({
          path
        })
        return
      }
      const songs = await getSingerSongs(this.computedSinger.id)
      const ids = songs.songs.map(song => song.id).join(',')
      const response = await getSongs(ids)
      if (response && response.data) {
        const urls = response.data.map(item => ({
          id: item.id,
          url: item.url,
          time: item.time
        }))
        songs.songs.forEach(song => {
          const urlData = urls.find(url => url.id === song.id)
          if (urlData) {
            song.url = urlData.url
            song.time = urlData.time
            song.picUrl = song.al.picUrl
            song.artist = song.ar.map(artist => artist.name).join('/')
          }
        })
      }
      this.loading = false
      this.songs = songs.songs
    }
  }
</script>

<style lang="scss" scoped>
  .singer-detail {
    position: fixed;
    z-index: 10;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    background: $color-background;
  }
</style>
