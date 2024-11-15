import axios from 'axios'

const baseURL = 'http://localhost:3000/'

axios.defaults.baseURL = baseURL

export function get(url, params) {
  return axios.get(url, {
    params
  }).then((res) => {
    const serverData = res.data
    return serverData
  })
}
