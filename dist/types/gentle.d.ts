import { BrowserId, BrowserInfo, ClientEvent, CustomerId, EventLog, SessionId } from './types';
declare class GentleSDK {
    private browserId;
    private browserInfo;
    private sessionId;
    private customerId;
    private events;
    constructor(customerId?: CustomerId);
    private getUserProperty;
    updateUserInfo(id: CustomerId): void;
    track(event: ClientEvent, customerId?: CustomerId): void;
    getUserInfo(): {
        browserId: BrowserId;
        browserInfo: BrowserInfo;
        customerId: CustomerId;
        sessionId: SessionId;
    };
    getEvents(): {
        events: EventLog[];
    };
    resetEvents(): void;
}
export { GentleSDK };
