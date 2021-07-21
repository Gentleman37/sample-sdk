import { GentleSDK } from './gentle'

export type BaseUrl = string
export type BrowserId = string | null
export type CustomerId = string | number | null
export type SessionId = string | null
export type Timestamp = number

export type LatitudeAndLongitude = {
  latitude: string | null
  longitude: string | null
}

export type LogEvent = {
  eventName: EventName
  eventProperties: Object
}

export type BrowserInfo = {
  language: string
  browser: Bowser.Parser.Details
  os: Bowser.Parser.OSDetails
  platform: Bowser.Parser.PlatformDetails
  engine: Bowser.Parser.Details
} | null

export type LogProperty = {
  clientTime: Timestamp
  sessionId: SessionId
  browserId: BrowserId
  customerId: CustomerId
  browserInfo: BrowserInfo
  geolocation: LatitudeAndLongitude
}

export type UserProperty = {
  browserId: BrowserId
  browserInfo: BrowserInfo
  customerId: CustomerId
  sessionId: SessionId
}

export type EventName = string

export type GentleInstance = InstanceType<typeof GentleSDK>
