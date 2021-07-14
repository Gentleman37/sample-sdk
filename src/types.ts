export type BrowserId = string | null
export type CustomerId = string | number | null
export type SessionId = string | null
export type ISOTimestamp = string

export type ClientEvent = {
  eventName: EVENT_NAME
  properties: any
}

export type LogProperty = {
  clientTime: ISOTimestamp
  sessionId: SessionId
  browserId: BrowserId
  customerId: CustomerId
}

export type EventLog = ClientEvent & LogProperty

export type BrowserInfo = Bowser.Parser.ParsedResult | null

export enum EVENT_NAME {
  LOGIN = 'login',
  CLICK = 'click',
  VIEW = 'view',
}
