/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {AbstractRequestBuilder} from "./abstractRequestBuilder";
// noinspection ES6PreferShortImport
import {Zation}                 from "../../../../core/zation";
import {AuthRequest}            from "../main/authRequest";

export class AuthRequestBuilder extends AbstractRequestBuilder<AuthRequestBuilder>
{
    private _authData: any = undefined;

    constructor(zation: Zation) {
        super(zation);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Set the authData of the request.
     * @param data
     * @default undefined (equals to {} on server param based input).
     */
    authData(data: any): AuthRequestBuilder {
        this._authData = data;
        return this;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Builds the BaseRequest and returns it.
     * Notice that the request not contains the reactions.
     */
    buildRequest(): AuthRequest {
        const req = new AuthRequest(this._authData);
        req.setApiLevel(this._apiLevel);
        req.setResponseTimeout(this._responseTimeout);
        req.setConnectTimeout(this._connectTimeout);
        return req;
    }

    protected self(): AuthRequestBuilder {
        return this;
    }
}