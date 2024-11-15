<template>
  <div class="recommend" v-loading:[loadingText]="loading">
    <MScroll class="recommend-content">
      <div>
        <div class="slider-wrapper">
          <div class="slider-content">
            <MSlider v-if="sliders.length" :sliders="sliders"></MSlider>
          </div>
        </div>
        <div class="recommend-list">
          <h1 class="list-title" v-show="!loading">精品歌单</h1>
          <ul>
            <li
              v-for="item in albums"
              class="item"
              :key="item.id"
              @click="selectItem(item)"
            >
              <div class="icon">
                <img width="60" height="60" v-lazy="item.coverImgUrl">
              </div>
              <div class="text">
                <h2 class="name">
                  {{ item.name }}
                </h2>
                <p class="title">
                  {{ item.tags }}
                </p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </MScroll>
    <router-view v-slot="{ Component }">
      <transition name="slide">
        <component :is="Component" :singer="selectedAlbum" />
      </transition>
    </router-view>
  </div>
</template>

<script>
  import { getRecommend } from '@/service/recommend'
  import { getList } from '@/service/recList'
  import MSlider from '@/components/base/slider/slider.vue'
  import MScroll from '@/components/base/scroll/scroll.vue'
  import storage from 'good-storage'
  import { ALBUM_KEY } from '@/assets/js/constant'

  export default {
    name: 'recommend-page',
    components: {
      MSlider,
      MScroll
    },
    data() {
      return {
        sliders: [],
        albums: [],
        loadingText: '正在载入...',
        selectedAlbum: null
      }
    },
    computed: {
      loading() {
        return !this.sliders.length && !this.albums.length
      }
    },
    async created() {
      const res = await getRecommend()
      const resList = await getList()
      // console.log(res.banners)
      console.log(resList.playlists)
      this.sliders = res.banners
      this.albums = resList.playlists
    },
    methods: {
      selectItem(album) {
        this.selectedAlbum = album
        this.cacheAlbum(album)
        this.$router.push({
          path: `/recommend/${album.id}`
        })
      },
      cacheAlbum(album) {
        storage.session.set(ALBUM_KEY, album)
      }
    }
  }
</script>

<style lang="scss" scoped>
  .recommend {
    position: fixed;
    width: 100%;
    top: 88px;
    bottom: 0;
    overflow: scroll;
    .recommend-content {
      height: 100%;
      overflow: hidden;
      .slider-wrapper {
        position: relative;
        width: 100%;
        height: 0;
        padding-top: 40%;
        overflow: hidden;
        .slider-content {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
        }
      }
      .recommend-list {
        .list-title {
          height: 65px;
          line-height: 65px;
          text-align: center;
          font-size: $font-size-medium;
          color: $color-theme;
        }
        .item {
          display: flex;
          box-sizing: border-box;
          align-items: center;
          padding: 0 20px 20px 20px;

          .icon {
            flex: 0 0 60px;
            width: 60px;
            padding-right: 20px;
          }
          .text {
            display: flex;
            flex-direction: column;
            justify-content: center;
            flex: 1;
            line-height: 20px;
            overflow: hidden;
            font-size: $font-size-medium;
          }
          .name {
            margin-bottom: 10px;
            color: $color-text;
          }
          .title {
            color: $color-text-d;
          }
        }
      }
    }
  }
</style>
