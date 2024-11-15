<template>
  <m-header />
  <m-tab />
  <router-view :style="viewStyle" />
  <m-player></m-player>
</template>

<script>
  import Header from '@/components/header/header.vue'
  import MTab from '@/components/tab/tab.vue'
  import MPlayer from '@/components/player/player.vue'
  import { mapState } from 'vuex'
  export default {
    components: {
      MHeader: Header,
      MTab,
      MPlayer
    },
    computed: {
      viewStyle() {
        const bottom = this.playList.length ? '60px' : 0
        return {
          bottom
        }
      },
      ...mapState([
        'playList'
      ])
    }
  }
</script>

<style lang="scss">
</style>
