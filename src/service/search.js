import { get } from './base'

export function getHotKeys() {
  return get('/search/hot')
}

export function getSearch(keywords, offset = 0, limit = 30) {
  return get(`/search?keywords=${keywords}&offset=${offset}&limit=${limit}`)
}
