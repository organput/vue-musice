import MusicList from '@/components/music-list/music-list'
import storage from 'good-storage'
import { getAlbumDetail } from '@/service/recommend'
import { getSongs } from '@/service/song'

export default function createDetailComponent(name, key) {
  return {
    name,
    components: { MusicList },
    props: {
      data: Object
    },
    data() {
      return {
        songs: [],
        loading: true
      }
    },
    computed: {
      computedData() {
        let ret = null
        const data = this.data
        if (data) {
          ret = data
        } else {
          const cached = storage.session.get(key)
          if (cached && (cached.mid || cached.id + '') === this.$route.params.id) {
            ret = cached
          }
        }
        return ret
      },
      pic() {
        const data = this.computedData
        return data && data.coverImgUrl
      },
      title() {
        const data = this.computedData
        return data && (data.name || data.title)
      }
    },
    async created() {
      const data = this.computedData
      if (!data) {
        const path = this.$route.matched[0].path
        this.$router.push({
          path
        })
        return
      }
      const result = await getAlbumDetail(data.id)
      this.songs = result.playlist.tracks
      const ids = result.playlist.tracks.map(song => song.id).join(',')
      const response = await getSongs(ids)
      const urls = response.data.map(item => ({
        id: item.id,
        url: item.url,
        time: item.time
      }))
      this.songs.forEach(song => {
        const urlData = urls.find(url => url.id === song.id)
        if (urlData) {
          song.url = urlData.url
          song.time = urlData.time
          song.picUrl = song.al.picUrl
          song.artist = song.ar.map(artist => artist.name).join('/')
        }
      })
      this.loading = false
    }
  }
}
