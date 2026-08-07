/** @format */

import { IterableType } from "src/types/Model";
import { IStoreInstanceSystemState } from "src/types/Store";

export const STORE_STATE_SYSTEM = "tianyu-store";
export const STORE_STATE_INSTANCE = "instances";

export const STORE_STATE_EXTERNAL_STOREAGE = "tianyu-store-entity-external-storage";

export interface IStoreInstanceState {
    [instanceId: string]: any;
}

export interface IStoreInstance {
    [storeType: string]: IStoreInstanceState;
}

export interface IStoreState extends IterableType {
    [STORE_STATE_SYSTEM]: IStoreInstanceSystemState;
    [STORE_STATE_INSTANCE]: IStoreInstance;
}
