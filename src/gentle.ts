import browserHandler from './borwserHandler'
import { BrowserId, BrowserInfo, ClientEvent, CustomerId, EventLog, EVENT_NAME, ISOTimestamp, LogProperty, SessionId } from './types'

class GentleSDK {
  private browserId: BrowserId = null
  private browserInfo: BrowserInfo = null
  private sessionId: SessionId = null
  private customerId: CustomerId = null

  private events: EventLog[] = []

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

  track(event: ClientEvent, customerId?: CustomerId) {
    const userProperty = this.getUserProperty()

    if (event.eventName === EVENT_NAME.LOGIN) {
      if (customerId === undefined) throw new Error('customerId should be provided!')
      this.updateUserInfo(customerId)
    }

    const log: EventLog = { ...event, ...userProperty }
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
    return {
      events: this.events,
    }
  }

  resetEvents() {
    this.events = []
  }
}

export { GentleSDK }
