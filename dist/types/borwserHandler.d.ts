import Browser from 'bowser';
declare const _default: {
    getBrowserId(): string;
    getBrowserInfo(): {
        language: string;
        browser: Browser.Parser.Details;
        os: Browser.Parser.OSDetails;
        platform: Browser.Parser.PlatformDetails;
        engine: Browser.Parser.Details;
    };
    getSessionId(): string;
};
export default _default;
