import { GentleSDK } from './gentle'

export type BaseUrl = string
export type BrowserId = string | null
export type CustomerId = string | number | null
export type SessionId = string | null
export type ISOTimestamp = string

export type LogEvent = {
  eventName: EventName
  eventProperties: Object
}

export type BrowserInfo = Bowser.Parser.ParsedResult | null

export type LogProperty = {
  clientTime: ISOTimestamp
  sessionId: SessionId
  browserId: BrowserId
  customerId: CustomerId
  browserInfo: BrowserInfo
}

export type UserProperty = {
  browserId: BrowserId
  browserInfo: BrowserInfo
  customerId: CustomerId
  sessionId: SessionId
}

export type EventName = 'login' | 'click' | 'view'

export type GentleSDKClient = InstanceType<typeof GentleSDK>
