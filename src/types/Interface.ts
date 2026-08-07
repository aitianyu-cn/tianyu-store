/**@format */

import { CreateStoreActionCreator, DestroyStoreActionCreator, IActionProvider, IActionProviderBase } from "./Action";
import { IterableType } from "./Model";
import { ISelectorProviderBase } from "./Selector";

/**
 * Tianyu Store Interface Type
 *
 * Provides a structure for selector and action and support to define the hierarchy
 *
 * @template STATE the store state type of this interface
 */
export interface ITianyuStoreInterface<STATE extends IterableType> extends ITianyuStoreInterfaceImplementation {
    /** Core part of Store Interface which is necessary for each interface implementation */
    core: {
        /** Store create action */
        creator: IActionProvider<STATE, any, any> | CreateStoreActionCreator<STATE, any>;
        /** Store destroy action */
        destroy: IActionProvider<STATE, undefined, undefined> | DestroyStoreActionCreator;
    };
}

/**
 * Tianyu Store Interface Implementation Type
 *
 * Define a iterable Object
 *
 * @template STATE the store state type of this interface implementation
 */
export interface ITianyuStoreInterfaceImplementation<STATE extends IterableType = any> {
    [part: string]:
        | IActionProviderBase<STATE>
        | ISelectorProviderBase<STATE, any>
        | ITianyuStoreInterfaceImplementation
        | undefined;
}

/**
 * Tianyu Store Store Interface Map
 *
 * Combine multi-types store type into this map and to support to search by store type
 */
export interface ITianyuStoreInterfaceMap {
    [storeType: string]: ITianyuStoreInterfaceImplementation | undefined;
}

/**
 * this is for internal using
 *
 * Define an operator list for all applied store interfaces in a store
 */
export interface ITianyuStoreInterfaceList {
    [operatorName: string]: IActionProviderBase<any> | ISelectorProviderBase<any, any>;
}
