import { LogEvent, CustomerId, BaseUrl, UserProperty } from './types';
declare class GentleSDK {
    readonly baseUrl: BaseUrl;
    private browserId;
    private browserInfo;
    private sessionId;
    private customerId;
    private events;
    constructor({ baseUrl, customerId }: {
        baseUrl: BaseUrl;
        customerId?: CustomerId;
    });
    private getLogProperty;
    updateUserInfo(id: CustomerId): void;
    track<T>({ endPoint, event }: {
        endPoint: string;
        event: LogEvent;
    }): Promise<import("axios").AxiosResponse<T>>;
    getUserProperty(): UserProperty;
    getEvents(): LogEvent[];
    resetEvents(): void;
}
declare type CreateGentleInstance = ({ baseUrl, customerId }: {
    baseUrl: BaseUrl;
    customerId?: CustomerId;
}) => GentleSDK;
declare const createGentleInstance: CreateGentleInstance;
export { createGentleInstance, GentleSDK };
