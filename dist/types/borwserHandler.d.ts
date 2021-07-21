import { BrowserId, BrowserInfo, LatitudeAndLongitude, SessionId } from './types';
declare const _default: {
    getBrowserId(): BrowserId;
    getBrowserInfo(): BrowserInfo;
    getSessionId(): SessionId;
    getGeolocation(): Promise<LatitudeAndLongitude>;
};
export default _default;
