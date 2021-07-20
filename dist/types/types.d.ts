import { GentleSDK } from './gentle';
export declare type BaseUrl = string;
export declare type BrowserId = string | null;
export declare type CustomerId = string | number | null;
export declare type SessionId = string | null;
export declare type Timestamp = number;
export declare type LogEvent = {
    eventName: EventName;
    eventProperties: Object;
};
export declare type BrowserInfo = {
    language: string;
    browser: Bowser.Parser.Details;
    os: Bowser.Parser.OSDetails;
    platform: Bowser.Parser.PlatformDetails;
    engine: Bowser.Parser.Details;
} | null;
export declare type LogProperty = {
    clientTime: Timestamp;
    sessionId: SessionId;
    browserId: BrowserId;
    customerId: CustomerId;
    browserInfo: BrowserInfo;
};
export declare type UserProperty = {
    browserId: BrowserId;
    browserInfo: BrowserInfo;
    customerId: CustomerId;
    sessionId: SessionId;
};
export declare type EventName = 'login' | 'click' | 'view';
export declare type GentleInstance = InstanceType<typeof GentleSDK>;
