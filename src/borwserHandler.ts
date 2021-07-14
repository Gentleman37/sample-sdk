import { v4 as uuid } from 'uuid'
import Browser from 'bowser'

const STORAGE_NAME = 'gentle_brw_id'

export default {
  getBrowserId() {
    const existingID = localStorage.getItem(STORAGE_NAME)
    if (existingID === null || existingID === undefined) {
      const newID = uuid()
      localStorage.setItem(STORAGE_NAME, newID)
      return newID
    }

    return existingID
  },
  getBrowserInfo() {
    const browser = Browser.parse(window.navigator.userAgent)

    return browser
  },
  getSessionId() {
    const existingID = sessionStorage.getItem(STORAGE_NAME)
    if (existingID === null || existingID === undefined) {
      const newID = String(new Date().getTime())
      sessionStorage.setItem(STORAGE_NAME, newID)
      return newID
    }

    return existingID
  },
}