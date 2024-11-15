import { get } from './base.js'

export function getSinger() {
  return get('/top/artists?limit=150')
}

export function getSingerDetail(id) {
  return get(`/artist/detail?id=${id}`)
}

export function getSingerSongs(id) {
  return get(`/artist/top/song?id=${id}`)
}
