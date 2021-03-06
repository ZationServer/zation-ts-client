/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {ClientOptions}                  from "./lib/core/clientOptions";
import {Client}                         from "./lib/core/client";
import {ResponseReactionBox}            from "./lib/main/controller/response/responseReactionBox";
import {EventReactionBox}               from "./lib/main/event/eventReactionBox";
import {StandardRequest}                from "./lib/main/controller/request/main/standardRequest";
import { ValidationCheckRequest}        from "./lib/main/controller/request/main/validationCheckRequest";
import {
    $all,
    $any,
    $contains,
    $key,
    $matches,
    $not,
    $pair,
    $value
} from "./lib/main/databox/dbApiUtils";
import {
    setMainClient,
    clearMainClient,
    mainClient,
    MainClientManager
} from "./lib/core/mainClientManager";
import {AuthenticationFailedError}      from "./lib/main/error/authenticationFailedError";
import {UndefinedUserIdError}           from "./lib/main/error/undefinedUserIdError";
import {UndefinedAuthUserGroupError}    from "./lib/main/error/undefinedAuthUserGroupError";
import {AuthenticationRequiredError}    from "./lib/main/error/authenticationRequiredError";
import {ConnectionAbortError}           from "./lib/main/error/connectionAbortError";
import {ConnectionRequiredError}        from "./lib/main/error/connectionRequiredError";
import {DeauthenticationFailedError}    from "./lib/main/error/deauthenticationFailedError";
import {TimeoutError, TimeoutType}      from "./lib/main/error/timeoutError";
import {SignAuthenticationFailedError}  from "./lib/main/error/signAuthenticationFailedError";
import {Response}                       from "./lib/main/controller/response/response";
import {AbstractRequestBuilder}         from "./lib/main/controller/request/fluent/abstractRequestBuilder";
import {AuthRequestBuilder}             from "./lib/main/controller/request/fluent/authRequestBuilder";
import {StandardRequestBuilder}         from "./lib/main/controller/request/fluent/standardRequestBuilder";
import {ValidationCheckRequestBuilder}  from "./lib/main/controller/request/fluent/validationCheckRequestBuilder";
import {PresetBackErrorLib}             from "./lib/main/backError/presetBackErrorLib";
import {BackErrorFilter}                from "./lib/main/backError/backErrorFilter";
import {filterBackErrors}               from './lib/main/backError/filterBackErrors';
import {BackError}                      from "./lib/main/backError/backError";
import {AbstractBackErrorFilterBuilder} from "./lib/main/backError/abstractBackErrorFilterBuilder";
import {ErrorName}                      from "./lib/main/definitions/errorName";
import {RawError}                       from "./lib/main/error/rawError";
import {buildKeyArray}                  from "./lib/main/databox/storage/keyArrayUtils";
import DbsHead                          from "./lib/main/databox/storage/components/dbsHead";
import DbStorage, {DataEventReason}     from "./lib/main/databox/storage/dbStorage";
import Databox, {DataboxOptions}        from './lib/main/databox/databox';
import {DbsComparator}                  from "./lib/main/databox/storage/dbsComparator";
import {DbsValueMerger}                 from "./lib/main/databox/storage/dbsMerge";
import {BackErrorWrapperError}          from "./lib/main/backError/backErrorWrapperError";
import DbError                          from "./lib/main/databox/dbError";
import {AbortSignal, AbortTrigger}      from "./lib/main/utils/connectionUtils";
import {AuthRequest}                    from "./lib/main/controller/request/main/authRequest";
import {SpecialController, ValidationCheckPair} from "./lib/main/controller/controllerDefinitions";
import Package                          from "./lib/main/receiver/package/main/package";
import PackageBuilder                   from "./lib/main/receiver/package/fluent/packageBuilder";
import Channel, {UnsubscribeReason}     from "./lib/main/channel/channel";
import TokenStore                       from "./lib/main/tokenStore/tokenStore";
import {createLocalStorageTokenStore}   from "./lib/main/tokenStore/localStorageTokenStore";
import {buildHistoryBasedStrategy}      from './lib/main/databox/reloadStrategy/historyBasedStrategy';
import {buildTimeBasedListStrategy}     from './lib/main/databox/reloadStrategy/timeBasedListStrategy';
import {
    APIDefinition,
    CustomApiDefinition,
    Routes,
    Route
}                                       from './lib/main/definitions/apiDefinition';
import {registerReloadStrategy, ReloadStrategy, ReloadStrategyBuilder} from './lib/main/databox/reloadStrategy/reloadStrategy';

let client = mainClient;
MainClientManager.onMainClientChange(mainClient => client = mainClient);

// noinspection JSUnusedGlobalSymbols
/**
 * @description
 * Creates a client.
 * @param options
 * @param main
 * Indicates if the created client is the main client.
 * The main client can be easily accessed in any file
 * by importing: client from this module.
 * To clear the main client later you can
 * use the function: clearMainClient.
 */
const create = <API extends APIDefinition = APIDefinition,
    TP extends object = any>(options?: ClientOptions, main: boolean = false): Client<API,TP> => {
    return new Client(options,main);
};

export {
    create,
    client,
    setMainClient,
    clearMainClient,
    Client,
    ClientOptions,
    Package,
    StandardRequest,
    AuthRequest,
    ValidationCheckRequest,
    Channel,
    UnsubscribeReason,
    ResponseReactionBox,
    EventReactionBox,
    SpecialController,
    Response,
    UndefinedUserIdError,
    UndefinedAuthUserGroupError,
    AuthenticationFailedError,
    AuthenticationRequiredError,
    ConnectionAbortError,
    ConnectionRequiredError,
    DeauthenticationFailedError,
    TimeoutError,
    TimeoutType,
    SignAuthenticationFailedError,
    PackageBuilder,
    AbstractRequestBuilder,
    AuthRequestBuilder,
    StandardRequestBuilder,
    ValidationCheckRequestBuilder,
    filterBackErrors,
    PresetBackErrorLib,
    BackErrorFilter,
    BackError,
    ValidationCheckPair,
    AbstractBackErrorFilterBuilder,
    ErrorName,
    RawError,
    BackErrorWrapperError,
    buildKeyArray,
    DbsHead,
    DbStorage,
    Databox,
    DataboxOptions,
    DbsComparator,
    DbsValueMerger,
    $not,
    $key,
    $value,
    $pair,
    $all,
    $contains,
    $any,
    $matches,
    DataEventReason,
    DbError,
    AbortTrigger,
    AbortSignal,
    TokenStore,
    createLocalStorageTokenStore,
    ReloadStrategy,
    ReloadStrategyBuilder,
    registerReloadStrategy,
    buildHistoryBasedStrategy,
    buildTimeBasedListStrategy,
    APIDefinition,
    CustomApiDefinition,
    Routes,
    Route
};