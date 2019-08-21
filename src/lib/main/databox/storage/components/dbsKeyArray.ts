/*
Author: Luca Scaringella
GitHub: LucaCode
Copyright(c) Luca Scaringella
 */

import DbsComponent, {DbsComponentType, isDbsComponent, isDbsKeyArray, MergeResult, ModifyLevel} from "./dbsComponent";
import DbDataParser                                         from "../dbDataParser";
import DbUtils                                              from "../../dbUtils";
import DbsSimplePathCoordinator                             from "./dbsSimplePathCoordinator";
import {dbsMerger, DbsValueMerger, defaultValueMerger}      from "../dbsMergerUtils";
import {DbsComparator}                                      from "../dbsComparator";
import {RawKeyArray}                                        from "../keyArrayUtils";
import {deepEqual}                                          from "../../../utils/deepEqual";

export default class DbsKeyArray extends DbsSimplePathCoordinator implements DbsComponent {

    private readonly data : any[];
    private readonly componentStructure : any[];
    private readonly keyMap : Map<string,number>;
    private readonly timestampMap : Map<string,number> = new Map<string, number>();
    private valueMerger : DbsValueMerger = defaultValueMerger;
    private comparator : DbsComparator | undefined = undefined;
    private hasCompartor : boolean = false;

    constructor(rawData : RawKeyArray) {
        super();

        this.data = [];
        this.componentStructure = [];
        this.keyMap = new Map<string, number>();

        this.buildKeyArray(rawData);
    }

    /**
     * Builds the keyArray from the raw data.
     * @param raw
     */
    private buildKeyArray(raw : RawKeyArray) {
        const array = raw.___a___;
        const rawKeyKey = raw.k;
        const rawValueKey = raw.v;
        const withValue = typeof rawValueKey === 'string';

        let item;
        let itemKey;
        let tmpI;
        let parsed;
        let i = 0;
        for(let j = 0; j < array.length; j++){
            item = array[j];
            if(typeof item === 'object'){
                itemKey = item[rawKeyKey].toString();
                tmpI = this.keyMap.get(itemKey);
                if(tmpI === undefined){
                    tmpI = i;
                    this.keyMap.set(item[rawKeyKey].toString(),i);
                    i++;
                }

                parsed = DbDataParser.parse(withValue ? item[rawValueKey as string] : item);
                this.componentStructure[tmpI] = parsed;
                this.data[tmpI] = isDbsComponent(parsed) ? parsed.getData() : parsed;
            }
        }
    }

    get dbsComponent(){return true;}
    get dbsComponentType(){return DbsComponentType.dbsKeyArray}

    /**
     * Sorts the key array if a comparator is provided.
     * @return if the data has changed.
     */
    sort() : boolean {
        if(this.hasCompartor){
            let dataChanged = false;
            const tmpArray : {i : number,k : string,v : any}[] = [];
            for (let [k, i] of this.keyMap.entries()){
                tmpArray[i] = {i,k,v : this.data[i]};
            }
            tmpArray.sort(((a, b) => (this.comparator as DbsComparator)(a.v,b.v)));

            let wrapper : {i : number,k : string,v : any};
            let targetIndex;
            const tmpData = this.data.slice();
            this.data.length = 0;
            const tmpComponentStructure = this.componentStructure.slice();
            this.componentStructure.length = 0;
            for(let i = 0; i < tmpArray.length; i++){
                wrapper = tmpArray[i];
                dataChanged = dataChanged || wrapper.i !== i;
                targetIndex = wrapper.i;
                this.keyMap.set(wrapper.k,i);
                this.data[i] = tmpData[targetIndex];
                this.componentStructure[i] = tmpComponentStructure[targetIndex];
            }
            return dataChanged;
        }
        return false;
    }

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
        if(comparator !== undefined){
            if(comparator !== this.comparator){
                this.comparator = comparator;
                this.hasCompartor = true;
                return this.sort();
            }
        }
        else {
            this.comparator = undefined;
            this.hasCompartor = false;
        }
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
        for(let i = 0; i < this.componentStructure.length; i++){
            value = this.componentStructure[i];
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
        return this.keyMap.has(key);
    }

    /**
     * Returns a value with a key.
     * @param key
     * @private
     */
    private getComponentValue(key : string) : any {
        const index = this.keyMap.get(key);
        return index !== undefined ?
            this.componentStructure[index] : undefined;
    }

    /**
     * Returns the dbs component on this
     * key or undefined if it not exists.
     * @param key
     */
    _getDbsComponent(key: string): DbsComponent | undefined {
        const component = this.getComponentValue(key);
        return isDbsComponent(component) ? component : undefined;
    }

    /**
     * Returns a copy of the data.
     */
    getDataCopy() : Record<string,any> {
        const data : any[] = [];
        let value;
        for(let i = 0; i < this.componentStructure.length; i++){
            value = this.componentStructure[i];
            data[i] = isDbsComponent(value) ? value.getDataCopy() : value;
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
        if(isDbsKeyArray(newValue)){
            let mainDc : boolean = false;
            newValue.forEachPair((key, value, componentValue, timestamp) => {
                const index = this.keyMap.get(key);
                if(index !== undefined){
                    const {mergedValue,dataChanged} = dbsMerger(this.componentStructure[index],componentValue,this.valueMerger);
                    mainDc = mainDc || dataChanged;
                    this.componentStructure[index] = mergedValue;
                    this.data[index] = isDbsComponent(mergedValue) ? mergedValue.getData() : mergedValue;
                }
                else {
                    this.pushWithComponentValue(key,value,componentValue);
                    mainDc = true;
                }
                if(timestamp !== undefined && DbUtils.isNewerTimestamp(this.timestampMap.get(key),timestamp)){
                    this.timestampMap.set(key,timestamp);
                }
            });
            return {mergedValue : this,dataChanged : mainDc};
        }
        return {mergedValue : newValue,dataChanged : true};
    }

    /**
     * Pushes new key-value pair at the end.
     * Or if a comparator function is provided,
     * it will push the item in the correct sorted position.
     * @param key
     * @param value
     */
    private push(key : string,value : any) {
        const componentValue = DbDataParser.parse(value);
        this.pushWithComponentValue
        (key,isDbsComponent(componentValue) ? componentValue.getData() : componentValue,componentValue);
    }

    /**
     * Pushes new key-value pair at the end.
     * Or if a comparator function is provided,
     * it will push the item in the correct sorted position.
     * @param key
     * @param value
     * @param componentValue
     */
    private pushWithComponentValue(key : string,value : any,componentValue : any) {
        if(this.hasCompartor){
            const sortInIndex = this.data.findIndex((item) =>
                (this.comparator as DbsComparator)(value,item) <= 0);

            if(sortInIndex > -1){
                this.pushBeforeWithComponentValue(sortInIndex,key,value,componentValue);
                return;
            }
        }
        //fallback
        this.componentStructure.push(componentValue);
        this.data.push(value);
        this.keyMap.set(key,this.componentStructure.length - 1);
    }

    /**
     * Pushes a new key-value pair before a key.
     * @param pushKey
     * @param key
     * @param value
     */
    private pushBefore(pushKey : string,key : string,value : any) {
        const index = this.keyMap.get(pushKey);
        if(index !== undefined){
            this.pushBeforeIndex(index,key,value);
        }
    }

    /**
     * Pushes a new key-value pair before a index.
     * @param index
     * @param key
     * @param value
     */
    private pushBeforeIndex(index : number,key : string,value : any) {
        const parsed = DbDataParser.parse(value);
        this.pushBeforeWithComponentValue(index,key,isDbsComponent(parsed) ? parsed.getData() : parsed,parsed);
    }

    /**
     * Pushes a new key-value pair before a index.
     * @param index
     * @param key
     * @param value
     * @param componentValue
     */
    private pushBeforeWithComponentValue(index : number,key : string,value : any,componentValue : any) {
        this.componentStructure.splice(index,0,componentValue);
        this.data.splice(index,0,value);

        //update keyMap
        for (let [key, i] of this.keyMap.entries()){
            if(i >= i){
                this.keyMap.set(key,++i);
            }
        }
        this.keyMap.set(key,index);
    }

    /**
     * Deletes a value from this key array.
     * @param key
     */
    private deleteValue(key : string) {
        const index = this.keyMap.get(key);
        if(index !== undefined){
            this.componentStructure.splice(index,1);
            this.data.splice(index,1);

            //update keyMap
            this.keyMap.delete(key);
            for (let [key, i] of this.keyMap.entries()){
                if(i > index){
                    this.keyMap.set(key,--i);
                }
            }
        }
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
        if (!this.hasKey(key) && DbUtils.checkTimestamp(this.getTimestamp(key),timestamp)) {
            if(ifContains !== undefined){
                if(!this.hasKey(ifContains)){return false;}
                this.comparator === undefined ? this.pushBefore(ifContains,key,value) : this.push(key,value)
            }
            else {
                this.push(key,value);
            }
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
        const index = this.keyMap.get(key);
        if (index !== undefined && DbUtils.checkTimestamp(this.getTimestamp(key),timestamp)) {
            let ml = ModifyLevel.DATA_TOUCHED;
            const parsed = DbDataParser.parse(value);
            const newData = isDbsComponent(parsed) ? parsed.getData() : parsed;
            if(checkDataChange && !deepEqual(newData,this.data[index])){
                ml = ModifyLevel.DATA_CHANGED;
            }
            if(this.hasCompartor){
                //sort in the correct position
                this.deleteValue(key);
                this.pushWithComponentValue(key,newData,parsed);
            }
            else {
                this.componentStructure[index] = parsed;
                this.data[index] = newData;
            }
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
            this.deleteValue(key);
            this.timestampMap.set(key,timestamp);
            return true;
        }
        return false;
    }

    /**
     * For each pair in this dbsKeyArray.
     * @param func
     */
    forEachPair(func : (key : string,value : any,componentValue : any,timestamp : number | undefined) => void) : void {
        for (let [key, value] of this.keyMap.entries()){
           func(key,this.data[value],this.componentStructure[value],this.timestampMap.get(key));
        }
    }
}