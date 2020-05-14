/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import {DryBackError} from "../backError/backError";

export const enum SpecialController {
    AuthController
}

export interface ControllerBaseReq {
    /**
     * Controller
     */
    c: string | SpecialController,
    /**
     * ApiLevel
     */
    a?: number
}

export interface ControllerStandardReq extends ControllerBaseReq {
    /**
     * Data
     */
    d?: any
}

export interface ControllerValidationCheckReq extends ControllerBaseReq {
    /**
     * Validation checks
     */
    v: ValidationCheckPair[]
}

export interface ValidationCheckPair {
    /**
     * Path
     */
    0: string | string[],
    /**
     * Value
     */
    1: any
}

/**
 * Successful = errors.length === 0 or undefined
 */
export type ControllerRes = {
    /**
     * Errors
     */
    0: DryBackError[],
    /**
     * Result
     */
    1?: any
} | undefined;

export const CONTROLLER_EVENT = '>';