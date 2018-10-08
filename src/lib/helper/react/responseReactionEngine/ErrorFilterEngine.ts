/*
Author: Luca Scaringella
GitHub: LucaCode
©Copyright by Luca Scaringella
 */

import {TaskError}   from "../taskError/taskError";
import {ErrorFilter} from "../../filter/errorFilter";

export class ErrorFilterEngine
{

    static filterErrors(errors : TaskError[],filter : ErrorFilter) : TaskError[]
    {
        if(filter === {}) {
            return errors;
        }

        let cachedFilterErrors = errors;

        if(Array.isArray(filter['name']) || typeof filter['name'] === 'string')
        {
            cachedFilterErrors =
                FilterEngine.getWhoHasOneOfInputVar<TaskError>(cachedFilterErrors,filter['name'],
                    (te) => {return te.getName();});

            if(cachedFilterErrors.length === 0) {
                return [];
            }
        }

        if(Array.isArray(filter['type']) || typeof filter['type'] === 'string')
        {
            cachedFilterErrors =
                FilterEngine.getWhoHasOneOfInputVar<TaskError>(cachedFilterErrors,filter['type'],
                    (te) => {return te.getType();});

            if(cachedFilterErrors.length === 0) {
                return [];
            }
        }

        if(Array.isArray(filter['info']) || typeof filter['info'] === "object")
        {
            cachedFilterErrors =
                FilterEngine.getWhoHasOneOfInputVar<TaskError>
                (
                    cachedFilterErrors,
                    filter['info'],
                    (te) => {return te.getInfo();},
                    FilterHandlerLib.allParamsAreSame
                );

            if(cachedFilterErrors.length === 0) {
                return [];
            }
        }

        if(Array.isArray(filter['infoKey']))
        {
            cachedFilterErrors =
                FilterEngine.getWhoHasOneOfInputVar<TaskError>
                (
                    cachedFilterErrors,
                    filter['infoKey'],
                    (te) => {return te.getInfo();},
                    FilterHandlerLib.objValuesAre
                );

            if(cachedFilterErrors.length === 0) {
                return [];
            }
        }

        if(Array.isArray(filter['infoValue']))
        {
            cachedFilterErrors =
                FilterEngine.getWhoHasOneOfInputVar<TaskError>
                (
                    cachedFilterErrors,
                    filter['infoValue'],
                    (te) => {return te.getInfo();},
                    FilterHandlerLib.objKeysAre
                );

            if(cachedFilterErrors.length === 0) {
                return [];
            }
        }

        return cachedFilterErrors;
    }

}