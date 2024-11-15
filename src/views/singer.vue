<template>
  <div class="singer" v-loading="!letter.length">
    <index-list
      :data="letter"
      @select="selectSinger"
    />
    <router-view v-slot="{ Component }">
      <transition name="slide">
        <component :is="Component" :singer="selectedSinger" />
      </transition>
    </router-view>
  </div>
</template>

<script>
import { getSinger } from '@/service/singer'
import { pinyin } from 'pinyin-pro'
import storage from 'good-storage'
import { SINGER_KEY } from '@/assets/js/constant.js'

import IndexList from '@/components/base/index-list/index-list.vue'

export default {
  name: 'singer-page',
  components: {
    IndexList
  },
  data() {
    return {
      letter: [],
      selectedSinger: null
    }
  },
  async created() {
    const res = await getSinger()
    const singerList = res.artists
    const singerMap = {
    }
    singerList.forEach((item) => {
      const p = pinyin(item.name)

      if (!p || !p.length) {
        return
      }
      const key = p[0][0].slice(0, 1).toUpperCase()
      if (key) {
        if (!singerMap[key]) {
          singerMap[key] = {
            title: key,
            list: []
          }
        }
        singerMap[key].list.push(item)
      }
    })
    const letterArray = []
    for (const key in singerMap) {
      const item = singerMap[key]
      if (item.title.match(/[a-zA-Z]/)) {
        letterArray.push(item)
      }
    }

    letterArray.sort((a, b) => {
      return a.title.charCodeAt(0) - b.title.charCodeAt(0)
    })
    this.letter = letterArray
    console.log(this.letter)
  },
  methods: {
    selectSinger(singer) {
      this.selectedSinger = singer
      this.cacheSinger(singer)
      this.$router.push({
        path: `/singer/${singer.id}`
      })
    },
    cacheSinger(singer) {
      storage.session.set(SINGER_KEY, singer)
    }
  }
}
</script>

<style lang="scss">
  .singer {
    position: fixed;
    width: 100%;
    top: 88px;
    bottom: 0;
  }
</style>
