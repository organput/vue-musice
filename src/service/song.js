import { get } from './base.js'
export function getSongs(id) {
  return get(`/song/url?id=${id}`)
}

export function getSongsDetail(id) {
  return get(`/song/detail?ids=${id}`)
}

export function getLyric(song) {
  const id = song.id
  if (song.lyric) {
    if (song.tlyric) {
      return Promise.resolve({
        lyric: song.lyric,
        tlyric: song.tlyric
      })
    }
    return Promise.resolve(song.lyric)
  }
  return get(`/lyric/new?id=${id}`)
}
