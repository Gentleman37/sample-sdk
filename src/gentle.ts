import axios from 'axios'
import browserHandler from './borwserHandler'
import {
  BrowserId,
  BrowserInfo,
  LogEvent,
  CustomerId,
  Timestamp,
  LogProperty,
  SessionId,
  BaseUrl,
  UserProperty,
  LatitudeAndLongitude,
  GentleConfig,
  ReferrerInfo,
  UtmInfo,
} from './types'

class GentleSDK {
  private readonly baseUrl: BaseUrl

  private readonly referrerInfo: ReferrerInfo
  private readonly utmInfo: UtmInfo

  private browserId: BrowserId = null
  private browserInfo: BrowserInfo = null
  private sessionId: SessionId = null
  private customerId: CustomerId = null
  private geolocation: LatitudeAndLongitude = { latitude: null, longitude: null }

  private events: LogEvent[] = []

  constructor({ baseUrl }: GentleConfig) {
    if (typeof window === 'undefined') throw new Error('window is undefined!')

    this.baseUrl = baseUrl

    this.referrerInfo = browserHandler.getReferrerInfo()
    this.utmInfo = browserHandler.getUtmInfo()

    this.browserId = browserHandler.getBrowserId()
    this.browserInfo = browserHandler.getBrowserInfo()
    this.sessionId = browserHandler.getSessionId()
  }

  private getLogProperty(): LogProperty {
    const clientTime: Timestamp = new Date().getTime()
    const logProperty = {
      sessionId: this.sessionId,
      browserId: this.browserId,
      customerId: this.customerId,
      browserInfo: this.browserInfo,
      geolocation: this.geolocation,
      clientTime,
      referrerInfo: this.referrerInfo,
      utmInfo: this.utmInfo,
    }

    return logProperty
  }

  getUserProperty(): UserProperty {
    return {
      browserId: this.browserId,
      browserInfo: this.browserInfo,
      customerId: this.customerId,
      sessionId: this.sessionId,
    }
  }

  getEvents() {
    return this.events
  }

  resetEvents() {
    this.events = []
  }

  updateUserId(id: CustomerId) {
    this.customerId = id
    return this.customerId
  }

  async updateGeolocation() {
    try {
      const location = await browserHandler.getGeolocation()
      this.geolocation = location
      return this.geolocation
    } catch (error) {
      console.log(error)
    }
  }

  async track<T>({ endPoint, event }: { endPoint: string; event: LogEvent }) {
    const logProperty = this.getLogProperty()

    const log: LogEvent & LogProperty = { ...event, ...logProperty }
    this.events.push(log)

    try {
      const res = await axios.post<T>(`${this.baseUrl}${endPoint}`, log)
      return res
    } catch (error) {
      if (error.response) {
        console.error(error.response.data)
      }
    }
  }
}

type CreateGentleInstance = (config: GentleConfig) => GentleSDK

const createGentleInstance: CreateGentleInstance = ({ baseUrl }: GentleConfig) => {
  return new GentleSDK({ baseUrl })
}

export { createGentleInstance, GentleSDK }
