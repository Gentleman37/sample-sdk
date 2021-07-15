export declare type BrowserId = string | null;
export declare type CustomerId = string | number | null;
export declare type SessionId = string | null;
export declare type ISOTimestamp = string;
export declare type LogEvent = {
    eventName: EVENT_NAME;
    properties: any;
};
export declare type LogProperty = {
    clientTime: ISOTimestamp;
    sessionId: SessionId;
    browserId: BrowserId;
    customerId: CustomerId;
};
export declare type BrowserInfo = Bowser.Parser.ParsedResult | null;
export declare enum EVENT_NAME {
    LOGIN = "login",
    CLICK = "click",
    VIEW = "view"
}
