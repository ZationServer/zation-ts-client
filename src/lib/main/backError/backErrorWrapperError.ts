/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {BackError}             from "./backError";
import {ErrorFilterEngine}     from "./errorFilterEngine";
import {BackErrorFilter}       from "./backErrorFilter";

export class BackErrorWrapperError extends Error
{
    private readonly rawError: Error;
    private readonly backErrors: BackError[] = [];

    constructor(message: string,rawError: Error)
    {
        super(message);
        this.rawError = rawError;
        const rawBackErrors = rawError['backErrors'];
        if (Array.isArray(rawBackErrors)) {
            let tmpRawBackError;
            for(let i = 0; i < rawBackErrors.length; i++) {
                tmpRawBackError = rawBackErrors[i];
                if(typeof tmpRawBackError === 'object') this.backErrors.push(new BackError(tmpRawBackError));
            }
        }
    }

    // noinspection JSUnusedGlobalSymbols
    getRawError(): Error {
        return this.rawError;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Returns the backErrors of the error.
     */
    getBackErrors(): BackError[] {
        return this.backErrors;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Returns the raw error code.
     */
    get code(): any {
        return this.rawError['code'];
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Returns the error name.
     */
    get name(): string {
        return this.rawError.name;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @description
     * Filter the BackErrors.
     * @example
     * -FilterExamples-
     * For errors with the name:
     * {name: 'errorName1'}
     * For errors with the names:
     * {name: ['errorName1','errorName2']}
     * For errors with the group:
     * {group: 'errorGroup1'}
     * For errors with the groups:
     * {group: ['errorGroup1','errorGroup2']}
     * For errors with the type:
     * {type: 'errorType1'}
     * For errors with the types:
     * {type: ['errorType1','errorType2']}
     * For errors with has all keys and values in the info:
     * {info: {path: 'name', value: 'value'}}
     * For errors with has at least one of all keys and values in the info:
     * {info: [{path: 'name'},{path: 'firstName'}]}
     * For errors with the info key:
     * {infoKey: 'path'}
     * For errors with at least one of the info keys:
     * {infoKey: ['path','value']}
     * For errors with all of the info keys:
     * {infoKey: [['path','value']]}
     * For errors with the info value:
     * {infoValue: 'name'}
     * For errors with at least one of the info values:
     * {infoValue: ['name','firstName']}
     * For errors with all of the info values:
     * {infoValue: [['value1','value2']]}
     * For custom errors:
     * {custom: true}
     * For non-custom errors:
     * {custom: false}
     * You can combine all of this properties.
     * @param filter
     * The purpose of this param is to filter the BackErrors errors.
     * Look in the examples how you can use it.
     * You also can add more than one filter.
     * The filter are linked with OR so the filtered errors
     * of each filter are countend together.
     */
    filterBackErrors(filter: BackErrorFilter[]): BackError[] {
        return ErrorFilterEngine.filterErrors(this.backErrors,filter);
    }
}

