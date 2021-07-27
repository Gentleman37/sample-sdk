import { v4 as uuid } from 'uuid'
import Browser from 'bowser'
import { BrowserId, BrowserInfo, LatitudeAndLongitude, ReferrerInfo, SessionId, UtmInfo } from './types'

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
  getUtmInfo() {
    const utmInfo: UtmInfo = {
      utm_campaign: null,
      utm_content: null,
      utm_medium: null,
      utm_source: null,
      utm_term: null,
    }

    const params = new URLSearchParams(window.location.search)

    utmInfo.utm_campaign = params.get('utm_campaign')
    utmInfo.utm_content = params.get('utm_content')
    utmInfo.utm_medium = params.get('utm_medium')
    utmInfo.utm_source = params.get('utm_source')
    utmInfo.utm_term = params.get('utm_term')

    return utmInfo
  },
  getReferrerInfo() {
    const { referrer } = window.document

    const referrerInfo: ReferrerInfo = {
      referrer: referrer || null,
      referring_domain: referrer.split('/')[2] || null,
    }

    return referrerInfo
  },
}
