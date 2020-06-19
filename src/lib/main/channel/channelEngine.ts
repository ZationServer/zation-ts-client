/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import Channel  from "./channel";
import {
    CH_CLIENT_OUTPUT_KICK_OUT,
    CH_CLIENT_OUTPUT_PUBLISH, CHANNEL_START_INDICATOR, ChannelSubscribeRequest,
    ChClientInputAction,
    ChClientInputPackage, ChClientOutputKickOutPackage,
    ChClientOutputPublishPackage
} from "./channelDefinitions";
import {buildFullChId}      from "./channelUtils";
import {Socket}             from "../sc/socket";
import {Logger}             from "../logger/logger";
// noinspection ES6PreferShortImport
import {RawError}           from "../../main/error/rawError";
import {ZationClientConfig} from "../config/zationClientConfig";

export class ChannelEngine
{
    private readonly _channels: Map<string,Set<Channel>> = new Map();
    private readonly _zc: ZationClientConfig;
    private _socket: Socket;

    constructor(zc: ZationClientConfig) {
        this._zc = zc;
    }

    connectToSocket(socket: Socket)
    {
        this._socket = socket;
        this._socket.on(CH_CLIENT_OUTPUT_PUBLISH,(data: ChClientOutputPublishPackage) => {
            const channelSet = this._channels.get(data.i);
            if(channelSet) {
                for(const channel of channelSet) {
                    channel._triggerPublish(data.m,data.e,data.d);
                }
            }
        });

        this._socket.on(CH_CLIENT_OUTPUT_KICK_OUT,(data: ChClientOutputKickOutPackage) => {
            const channelSet = this._channels.get(data.i);
            if(channelSet) {
                for(const channel of channelSet) {
                    channel._triggerKickOut(data.m,data.c,data.d);
                }
            }
        });

        this._socket.on('disconnect',() => {
            for(const channelSet of this._channels.values()) {
                for(const channel of channelSet){
                    channel._triggerConnectionLost();
                }
            }
        });

        const trySubscribePendingHandler = async () => {
            const promises: Promise<void>[] = [];
            const checkedChs = new Set<string>();
            for(const channelSet of this._channels.values()) {
                for(const channel of channelSet){
                    promises.push(channel._resubscribe(checkedChs));
                }
            }
            await Promise.all(promises);
        };
        this._socket.on('connect', trySubscribePendingHandler);
        this._socket.on('authenticate', trySubscribePendingHandler);
    }

    /**
     * Tries to subscribe to a channel.
     * If the subscription is successful it returns the chId and fullChId.
     * @param identifier
     * @param apiLevel
     * @param member
     * @param notTriggerChannel
     */
    trySubscribe(identifier: string,apiLevel?: number,member?: string,notTriggerChannel?: Channel): Promise<{chId: string, fullChId: string}> {
        return new Promise((resolve, reject) => {
            this._socket.emit(CHANNEL_START_INDICATOR,{
                c: identifier,
                ...(member !== undefined ? {m: member} : {}),
                ...(apiLevel !== undefined ? {a: apiLevel} : {}),
            } as ChannelSubscribeRequest,(err,chId: string) => {
                if(err){
                    reject(new RawError('Subscription failed.', err));
                }
                else {
                    //tell others.
                    const fullChId = buildFullChId(chId,member);
                    const channelSet = this._channels.get(chId);
                    if(channelSet){
                        for(const channel of channelSet){
                            if(channel === notTriggerChannel) continue;
                            channel._triggerSubscribtion(fullChId);
                        }
                    }
                    if(this._zc.isDebug()) {
                        Logger.printInfo(`Client subscribed to channel: '${identifier}'${
                            member !== undefined ? ` with member: '${member}'` : ''}.`);
                    }
                    resolve({chId,fullChId});
                }
            })
        });
    }

    register(chId: string,channel: Channel) {
        let channelSet = this._channels.get(chId);
        if(!channelSet) {
            channelSet = new Set<Channel>();
            this._channels.set(chId,channelSet);
        }
        channelSet.add(channel);
    }

    unregister(chId: string,channel: Channel) {
        const channelSet = this._channels.get(chId);
        if(channelSet){
            channelSet.delete(channel);
            if(channelSet.size === 0) {
                this._channels.delete(chId);
            }
        }
    }

    unsubsribe(fullChId: string, sourceChannel: Channel)
    {
        for(const channelSet of this._channels.values()) {
            for(const channel of channelSet){
                if(channel !== sourceChannel && channel._hasSub(fullChId)) return;
            }
        }
        this._socket.emit(fullChId,[ChClientInputAction.Unsubscribe] as ChClientInputPackage);
    }

    /**
     * Unsubscribes all channels.
     */
    unsubscribeAllChannels(identifier?: string) {
        if(identifier != undefined) {
            const searchId = CHANNEL_START_INDICATOR + identifier;
            for(const [chId,channelSet] of this._channels.entries()) {
                if(!chId.startsWith(searchId)) continue;
                for(const channel of channelSet){
                    channel.unsubscribe();
                }
            }
        }
        else {
            for(const channelSet of this._channels.values()) {
                for(const channel of channelSet){channel.unsubscribe();}
            }
        }
    }
}