import axios from 'axios'

const vercelURL = 'https://net-iota-three.vercel.app/'

axios.defaults.baseURL = vercelURL

export function get(url, params) {
  return axios.get(url, {
    params
  }).then((res) => {
    const serverData = res.data
    return serverData
  })
}
