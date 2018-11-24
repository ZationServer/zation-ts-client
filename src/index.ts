/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

//Api Classes
import {ZationOptions}                 from "./lib/api/zationOptions";
import {RequestAble}                   from "./lib/api/requestAble";
import {ProtocolType}                  from "./lib/helper/constants/protocolType";
import {Zation}                        from "./lib/api/zation";
import {ResponseReactionBox}           from "./lib/api/responseReactionBox";
import {ChannelReactionBox}            from "./lib/api/channelReactionBox";
import {EventReactionBox}              from "./lib/api/eventReactionBox";
import {WsRequest}                     from "./lib/api/wsRequest";
import {HttpRequest}                   from "./lib/api/httpRequest";
import {AuthRequest}                   from "./lib/api/authRequest";
import {ValidationRequest}             from "./lib/api/validationRequest";
import {AuthenticationFailedError}     from "./lib/helper/error/authenticationFailedError";
import {AuthenticationNeededError}     from "./lib/helper/error/authenticationNeededError";
import {ConnectionAbortError}          from "./lib/helper/error/connectionAbortError";
import {ConnectionNeededError}         from "./lib/helper/error/connectionNeededError";
import {DeauthenticationFailedError}   from "./lib/helper/error/deauthenticationFailedError";
import {DeauthenticationNeededError}   from "./lib/helper/error/deauthenticationNeededError";
import {MissingAuthUserGroupError}     from "./lib/helper/error/missingAuthUserGroupError";
import {MissingUserIdError}            from "./lib/helper/error/missingUserIdError";
import {PublishFailedError}            from "./lib/helper/error/publishFailedError";
import {ResultIsMissingError}          from "./lib/helper/error/resultIsMissingError";
import {SignAuthenticationFailedError} from "./lib/helper/error/signAuthenticationFailedError";
import {SubscribeFailedError}          from "./lib/helper/error/subscribeFailedError";

// noinspection JSUnusedGlobalSymbols
/**
 * @description
 * Creates the returnTarget zation client.
 * @param options
 * @param reactionBox
 */
const create = (options ?: ZationOptions,...reactionBox : (ResponseReactionBox | ChannelReactionBox | EventReactionBox)[]) : Zation =>
{
    return new Zation(options,...reactionBox);
};

export = {
    Zation,
    create,
    RequestAble,
    WsRequest,
    HttpRequest,
    AuthRequest,
    ValidationRequest,
    ChannelReactionBox,
    ResponseReactionBox,
    EventReactionBox,
    Response,
    AuthenticationFailedError,
    AuthenticationNeededError,
    ConnectionAbortError,
    ConnectionNeededError,
    DeauthenticationFailedError,
    DeauthenticationNeededError,
    MissingAuthUserGroupError,
    MissingUserIdError,
    PublishFailedError,
    ResultIsMissingError,
    SignAuthenticationFailedError,
    SubscribeFailedError,
    ProtocolType
}



