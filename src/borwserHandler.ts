import { v4 as uuid } from 'uuid'
import Browser from 'bowser'
import { BrowserId, BrowserInfo, LatitudeAndLongitude, SessionId } from './types'

const STORAGE_NAME = 'gentle_brw_id'

export default {
  getBrowserId(): BrowserId {
    const existingID = localStorage.getItem(STORAGE_NAME)
    if (existingID === null || existingID === undefined) {
      const newID = uuid()
      localStorage.setItem(STORAGE_NAME, newID)
      return newID
    }

    return existingID
  },
  getBrowserInfo(): BrowserInfo {
    const { userAgent, language } = window.navigator
    const browser = Browser.parse(userAgent)

    return { ...browser, language }
  },
  getSessionId(): SessionId {
    const existingID = sessionStorage.getItem(STORAGE_NAME)
    if (existingID === null || existingID === undefined) {
      const newID = String(new Date().getTime())
      sessionStorage.setItem(STORAGE_NAME, newID)
      return newID
    }

    return existingID
  },
  getGeolocation(): Promise<LatitudeAndLongitude> {
    const { geolocation } = window.navigator

    if (!geolocation) return Promise.resolve({ latitude: null, longitude: null })

    return new Promise((resolve, reject) => {
      const success = (position: GeolocationPosition) => {
        const { latitude: lat, longitude: long } = position.coords
        const latitude = lat.toFixed(5)
        const longitude = long.toFixed(5)

        resolve({ latitude, longitude })
      }

      const error = (error: GeolocationPositionError) => {
        reject(error)
        console.log(error)
      }

      geolocation.getCurrentPosition(success, error)
    })
  },
}
