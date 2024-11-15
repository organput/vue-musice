import { get } from './base.js'

export function getList() {
  return get('/top/playlist/highquality?limit=10')
}
