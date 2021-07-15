export type BrowserId = string | null
export type CustomerId = string | number | null
export type SessionId = string | null
export type ISOTimestamp = string

export type LogEvent = {
  eventName: EventName
  properties: any
}

export type LogProperty = {
  clientTime: ISOTimestamp
  sessionId: SessionId
  browserId: BrowserId
  customerId: CustomerId
}

export type BrowserInfo = Bowser.Parser.ParsedResult | null

export type EventName = 'login' | 'click' | 'view'
