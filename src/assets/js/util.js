export function shuffle(source) {
  const ar = source.slice()
  for (let i = ar.length - 1; i >= 0; i--) {
    const randomInt = getRandomInt(i)
    swap(ar, randomInt, i)
  }
  return ar
}

function getRandomInt(max) {
  return Math.floor(Math.random() * (max + 1))
}

function swap(ar, i, j) {
  const t = ar[i]
  ar[i] = ar[j]
  ar[j] = t
}

export function formatTime(interval) {
  interval = interval | 0
  const minute = ((interval / 60 | 0) + '').padStart(2, '0')
  const second = (interval % 60 + '').padStart(2, '0')
  return `${minute}:${second}`
}

export function formatTime2(milliseconds) {
  const minutes = Math.floor(milliseconds / 60000)
  const seconds = Math.floor((milliseconds % 60000) / 1000)
  return `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`
}
