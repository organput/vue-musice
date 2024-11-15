import { get } from './base.js'

export function getRecommend() {
  return get('/banner')
}

export function getAlbumDetail(album) {
  return get(`/playlist/detail?id=${album}`)
}
