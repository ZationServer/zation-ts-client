/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

export class ZationChannel {
    //Zation Main Channels
    static readonly USER_CHANNEL_PREFIX = 'Z_U.';
    static readonly AUTH_USER_GROUP_PREFIX = 'Z_AUG.';
    static readonly DEFAULT_USER_GROUP = 'Z_DUG';
    static readonly ALL = 'Z_ALL';
    static readonly PANEL_IN = 'Z_PI';
    static readonly PANEL_OUT = 'Z_PO';
    //Custom Channels
    static readonly CUSTOM_CHANNEL_PREFIX = 'Z_C.';
    static readonly CUSTOM_CHANNEL_MEMBER_SEPARATOR = '.';
}

export enum ChannelTarget {
    User,Aug,Dug,All,Custom,Panel
}

export enum ChannelEvent {
    Publish,
    KickOut,
    SubscribeFail,
    Subscribe,
    Unsubscribe,
}

export default interface PubData {
    /**
     * The event name.
     */
    e: string,
    /**
     * Published data.
     */
    d: any,
    /**
     * Source socket sid.
     */
    sSid?: string
}