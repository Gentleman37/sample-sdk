import { LogEvent, CustomerId, BaseUrl, UserProperty, LatitudeAndLongitude } from './types';
declare class GentleSDK {
    private readonly baseUrl;
    private browserId;
    private browserInfo;
    private sessionId;
    private customerId;
    private geolocation;
    private events;
    constructor({ baseUrl, customerId }: {
        baseUrl: BaseUrl;
        customerId?: CustomerId;
    });
    private getLogProperty;
    getUserProperty(): UserProperty;
    getEvents(): LogEvent[];
    resetEvents(): void;
    updateUserId(id: CustomerId): CustomerId;
    updateGeolocation(): Promise<LatitudeAndLongitude | undefined>;
    track<T>({ endPoint, event }: {
        endPoint: string;
        event: LogEvent;
    }): Promise<import("axios").AxiosResponse<T>>;
}
declare type CreateGentleInstance = ({ baseUrl, customerId }: {
    baseUrl: BaseUrl;
    customerId?: CustomerId;
}) => GentleSDK;
declare const createGentleInstance: CreateGentleInstance;
export { createGentleInstance, GentleSDK };
