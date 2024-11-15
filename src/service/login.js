import { get } from './base.js'
export function getLogin() {
  return get('/captcha/sent?phone=15949588428')
}
