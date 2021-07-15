import browserHandler from './borwserHandler'
import { BrowserId, BrowserInfo, LogEvent, CustomerId, ISOTimestamp, LogProperty, SessionId } from './types'

class GentleSDK {
  private browserId: BrowserId = null
  private browserInfo: BrowserInfo = null
  private sessionId: SessionId = null
  private customerId: CustomerId = null

  private events: LogEvent[] = []

  constructor(customerId?: CustomerId) {
    if (typeof window === 'undefined') throw new Error('window is undefined!')

    this.browserId = browserHandler.getBrowserId()
    this.browserInfo = browserHandler.getBrowserInfo()
    this.sessionId = browserHandler.getSessionId()
    if (customerId !== undefined) this.customerId = customerId
  }

  private getUserProperty(): LogProperty {
    const clientTime: ISOTimestamp = new Date().toISOString()
    const userProperty = {
      deviceId: this.browserId,
      sessionId: this.sessionId,
      browserId: this.browserId,
      customerId: this.customerId,
      clientTime,
    }

    return userProperty
  }

  updateUserInfo(id: CustomerId) {
    this.customerId = id
  }

  track(event: LogEvent, customerId?: CustomerId) {
    if (event.eventName === 'login') {
      if (customerId === undefined) throw new Error('customerId should be provided!')
      this.updateUserInfo(customerId)
    }

    const userProperty = this.getUserProperty()

    const log: LogEvent & LogProperty = { ...event, ...userProperty }
    this.events.push(log)
    // TODO: 서버로 로그 전송
  }

  getUserInfo() {
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
}

const createGentleInstance: () => GentleSDK = (customerId?: CustomerId) => {
  return new GentleSDK(customerId)
}

export { createGentleInstance, GentleSDK }
