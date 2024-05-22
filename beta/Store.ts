/** @format */

import { StoreImpl } from "./store/StoreImpl";
import { IStore, StoreConfiguration } from "./types/Store";

/**
 * Create a new Tianyu Store
 *
 * @returns return a tianyu store instance
 */
export function createStore(config?: StoreConfiguration): IStore {
    return new StoreImpl(config);
}
