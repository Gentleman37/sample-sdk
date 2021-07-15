import { BrowserId, BrowserInfo, LogEvent, CustomerId, SessionId } from './types';
declare class GentleSDK {
    private browserId;
    private browserInfo;
    private sessionId;
    private customerId;
    private events;
    constructor(customerId?: CustomerId);
    private getUserProperty;
    updateUserInfo(id: CustomerId): void;
    track(event: LogEvent, customerId?: CustomerId): void;
    getUserInfo(): {
        browserId: BrowserId;
        browserInfo: BrowserInfo;
        customerId: CustomerId;
        sessionId: SessionId;
    };
    getEvents(): LogEvent[];
    resetEvents(): void;
}
export { GentleSDK };
