/** @format */

import { IInstanceAction } from "./Action";
import { ExternalObjectHandleFunction } from "./ExternalObject";
import { IInstanceSelector } from "./Selector";

/**
 * Define a store dispatching handler handle type
 * This enum declared which types are supported during action dispatching
 */
export enum StoreHandleType {
    /** Action type, to execute an action and refresh the state */
    ACTION,
    /** Selector type, to execute a selector and return the value from selector */
    SELECTOR,
    /**
     * External Object Reader type to execute an external object reader
     * and return the value from external reader function
     */
    EXTERNAL_OBJ,
}

/**
 * Define Store Action Handle interface
 * This handle used for inner action dispatching during action handling
 */
export interface StoreActionHandle {
    /** indicates action handle type */
    type: StoreHandleType.ACTION;
    /** provides action instance */
    action: IInstanceAction<any>;
}

/**
 * Define Store Selector Handle interface
 * This handle used for inner selector dispatching during action handling
 */
export interface StoreSelectorHandle<RESULT> {
    /** indicates selector handle type */
    type: StoreHandleType.SELECTOR;
    /** provides selector instance */
    selector: IInstanceSelector<RESULT>;
    /** flag indicates the select should throw an error when receiving missing type */
    shouldThrow?: boolean;
}

/**
 * Define Store External Object Reader Handle interface
 * This handle used for inner external object reader dispatching during action handling
 */
export interface StoreExternalObjectHandle<RESULT> {
    /** indicates external object reader handle type */
    type: StoreHandleType.EXTERNAL_OBJ;
    /** provides external object reader processing function */
    handler: ExternalObjectHandleFunction<RESULT>;
}

/** Define a mix type of action, selector and external object reader handle */
export type AnyStoreHandle = StoreActionHandle | StoreSelectorHandle<any> | StoreExternalObjectHandle<any>;
