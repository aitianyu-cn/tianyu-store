/**@format */

import { IInstanceSelector } from "./Selector";

/**
 * Tianyu Store Event Trigger Callback Function
 *
 * @template SELECTOR_RESULT the type of selector returned result
 */
export interface StoreEventTriggerCallback<SELECTOR_RESULT> {
    /**
     * @param oldState the pre-state from selector
     * @param newState the new state from selector
     */
    (oldState: SELECTOR_RESULT | undefined, newState: SELECTOR_RESULT | undefined): void;
}

/**
 * Tianyu Store Listener Instance
 *
 * @template SELECTOR_RESULT the type of selector returned result
 */
export interface IInstanceListener<SELECTOR_RESULT> {
    /** Listener Id of current listener instance */
    id: string;
    /** The selector of current listener */
    selector: IInstanceSelector<SELECTOR_RESULT>;
    /**
     * Listener callback function.
     * Function will be called when the new state and pre-state from selector is changed
     */
    listener: StoreEventTriggerCallback<SELECTOR_RESULT>;
}
