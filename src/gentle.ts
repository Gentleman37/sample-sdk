import axios from 'axios'
import browserHandler from './borwserHandler'
import { BrowserId, BrowserInfo, LogEvent, CustomerId, Timestamp, LogProperty, SessionId, BaseUrl, UserProperty } from './types'

class GentleSDK {
  private readonly baseUrl: BaseUrl

  private browserId: BrowserId = null
  private browserInfo: BrowserInfo = null
  private sessionId: SessionId = null
  private customerId: CustomerId = null

  private events: LogEvent[] = []

  constructor({ baseUrl, customerId }: { baseUrl: BaseUrl; customerId?: CustomerId }) {
    if (typeof window === 'undefined') throw new Error('window is undefined!')

    this.baseUrl = baseUrl

    this.browserId = browserHandler.getBrowserId()
    this.browserInfo = browserHandler.getBrowserInfo()
    this.sessionId = browserHandler.getSessionId()
    if (customerId !== undefined) this.customerId = customerId
  }

  private getLogProperty(): LogProperty {
    const clientTime: Timestamp = new Date().getTime()
    const logProperty = {
      sessionId: this.sessionId,
      browserId: this.browserId,
      customerId: this.customerId,
      browserInfo: this.browserInfo,
      clientTime,
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
  }

  async track<T>({ endPoint, event }: { endPoint: string; event: LogEvent }) {
    const userProperty = this.getLogProperty()

    const log: LogEvent & LogProperty = { ...event, ...userProperty }
    this.events.push(log)

    const res = await axios.post<T>(`${this.baseUrl}${endPoint}`, log)
    return res
  }
}

type CreateGentleInstance = ({ baseUrl, customerId }: { baseUrl: BaseUrl; customerId?: CustomerId }) => GentleSDK

const createGentleInstance: CreateGentleInstance = ({ baseUrl, customerId }: { baseUrl: BaseUrl; customerId?: CustomerId }) => {
  return new GentleSDK({ baseUrl, customerId })
}

export { createGentleInstance, GentleSDK }
