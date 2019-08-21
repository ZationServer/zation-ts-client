/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import DbsComponent, {DbsComponentType, isDbsComponent, isDbsObject, MergeResult, ModifyLevel} from "./dbsComponent";
import DbDataParser                                     from "../dbDataParser";
import DbUtils                                          from "../../dbUtils";
import DbsSimplePathCoordinator                         from "./dbsSimplePathCoordinator";
import {dbsMerger, DbsValueMerger, defaultValueMerger}  from "../dbsMergerUtils";
import {DbsComparator}                                  from "../dbsComparator";
import {deepEqual}                                      from "../../../utils/deepEqual";

export default class DbsObject extends DbsSimplePathCoordinator implements DbsComponent {

    private readonly data : Record<string,any>;
    private readonly componentStructure : Record<string,any>;
    private readonly keys : Set<string>;
    private readonly timestampMap : Map<string,number> = new Map<string, number>();
    private valueMerger : DbsValueMerger = defaultValueMerger;

    constructor(rawData : Record<string,any>) {
        super();

        this.keys = new Set<string>(Object.keys(rawData));
        this.data = {};
        this.componentStructure = {};

        let parsed;
        for (let key of this.keys.values()) {
            parsed = DbDataParser.parse(rawData[key]);
            this.componentStructure[key] = parsed;
            this.data[key] = isDbsComponent(parsed) ? parsed.getData() : parsed;
        }
    }

    get dbsComponent(){return true;}
    get dbsComponentType(){return DbsComponentType.dbsObject}

    /**
     * Sets the value merger of this component.
     * Undefined will reset the valueMerger.
     * @param valueMerger
     */
    setValueMerger(valueMerger : DbsValueMerger | undefined) : void {
        this.valueMerger = valueMerger || defaultValueMerger;
    }

    /**
     * Sets the comparator of this component.
     * Undefined will reset the comparator.
     * @return if the data has changed.
     * @param comparator
     */
    setComparator(comparator : DbsComparator | undefined) : boolean {
        return false;
    }

    /**
     * Creates a loop for each DbsComponent in the complete structure.
     * Also includes the component from which you call the method.
     * @param func
     */
    forEachComp(func: (comp: DbsComponent) => void): void {
        func(this);
        let value;
        for(let key of this.keys.values()){
            value = this.componentStructure[key];
            if(isDbsComponent(value)){
                value.forEachComp(func);
            }
        }
    }

    /**
     * Returns the time on this key or if
     * it does not exist a 0.
     * @param key
     */
    private getTimestamp(key : string) : number {
        const timestamp = this.timestampMap.get(key);
        return timestamp !== undefined ? timestamp : 0;
    }

    /**
     * Returns if the key exists.
     * @param key
     */
    private hasKey(key : string) : boolean {
        return key in this.componentStructure;
    }

    /**
     * Returns the dbs component on this
     * key or undefined if it not exists.
     * @param key
     */
    _getDbsComponent(key: string): DbsComponent | undefined {
        const component = this.componentStructure[key];
        return isDbsComponent(component) ? component : undefined;
    }

    /**
     * Returns a copy of the data.
     */
    getDataCopy() : Record<string,any> {
        const data = {};
        let value;
        for(let key of this.keys.values()){
            value = this.componentStructure[key];
            data[key] = isDbsComponent(value) ? value.getDataCopy() : value;
        }
        return data;
    }

    /**
     * Returns the data.
     */
    getData() {
        return this.data;
    }

    /**
     * Merge this dbs component with the new component.
     * @param newValue
     */
    meregeWithNew(newValue: any) : MergeResult {
        if(isDbsObject(newValue)){
            let mainDc : boolean = false;
            newValue.forEachPair((key, value, componentValue, timestamp) => {
                if(this.hasKey(key)){
                    const {mergedValue,dataChanged} = dbsMerger(this.componentStructure[key],componentValue,this.valueMerger);
                    mainDc = mainDc || dataChanged;
                    this.componentStructure[key] = mergedValue;
                    this.data[key] = isDbsComponent(mergedValue) ? mergedValue.getData() : mergedValue;
                }
                else {
                    this.data[key] = value;
                    this.componentStructure[key] = componentValue;
                    mainDc = true;
                }
                this.keys.add(key);
                if(timestamp !== undefined && DbUtils.isNewerTimestamp(this.timestampMap.get(key),timestamp)){
                    this.timestampMap.set(key,timestamp);
                }
            });
            return {mergedValue : this,dataChanged : mainDc};
        }
        return {mergedValue : newValue,dataChanged : true};
    }

    /**
     * Insert process.
     * @return if the action was fully executed. (Data changed)
     * @param key
     * @param value
     * @param timestamp
     * @param ifContains
     * @private
     */
    _insert(key: string, value: any, timestamp : number,ifContains ?: string): boolean {
        if(ifContains !== undefined && !this.hasKey(ifContains)){
            return false;
        }

        if (!this.hasKey(key) && DbUtils.checkTimestamp(this.getTimestamp(key),timestamp)) {
            const parsed = DbDataParser.parse(value);
            this.componentStructure[key] = parsed;
            this.data[key] = isDbsComponent(parsed) ? parsed.getData() : parsed;

            this.keys.add(key);

            this.timestampMap.set(key,timestamp);
            return true;
        }
        return false;
    }

    /**
     * Update process.
     * @return the modify level.
     * @param key
     * @param value
     * @param timestamp
     * @param checkDataChange
     * @private
     */
    _update(key: string, value: any, timestamp : number,checkDataChange : boolean): ModifyLevel {
        if (this.hasKey(key) && DbUtils.checkTimestamp(this.getTimestamp(key),timestamp)) {
            let ml = ModifyLevel.DATA_TOUCHED;
            const parsed = DbDataParser.parse(value);
            const newData = isDbsComponent(parsed) ? parsed.getData() : parsed;
            if(checkDataChange && !deepEqual(newData,this.data[key])){
                ml = ModifyLevel.DATA_CHANGED;
            }
            this.componentStructure[key] = parsed;
            this.data[key] = newData;

            this.timestampMap.set(key,timestamp);
            return ml;
        }
        return ModifyLevel.NOTHING;
    }

    /**
     * Delete process.
     * @return if the action was fully executed. (Data changed)
     * @param key
     * @param timestamp
     * @private
     */
    _delete(key: string, timestamp : number): boolean {
        if (this.hasKey(key) && DbUtils.checkTimestamp(this.getTimestamp(key),timestamp)) {
            delete this.data[key];
            delete this.componentStructure[key];
            this.keys.delete(key);
            this.timestampMap.set(key,timestamp);
            return true;
        }
        return false;
    }

    /**
     * For each pair in this dbsObject.
     * @param func
     */
    forEachPair(func : (key : string,value : any,componentValue : any,timestamp : number | undefined) => void) : void {
        for(let key of this.keys.values()){
            func(key,this.data[key],this.componentStructure[key],this.timestampMap.get(key));
        }
    }
}