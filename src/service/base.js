import axios from 'axios'

const baseURL = 'https://net-iota-three.vercel.app/'

axios.defaults.baseURL = baseURL

export function get(url, params) {
  return axios.get(url, {
    params
  }).then((res) => {
    const serverData = res.data
    return serverData
  })
}
