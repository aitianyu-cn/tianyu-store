/**@format */

import { ActionType, IInstanceAction } from "src/types/Action";
import { ExternalObjectHandleFunction } from "src/types/ExternalObject";
import { InstanceId } from "src/types/InstanceId";
import { IInstanceSelector, SelectorResult } from "src/types/Selector";
import {
    StoreActionHandle,
    StoreHandleType,
    StoreSelectorHandle,
    StoreExternalObjectHandle,
} from "src/types/StoreHandler";

export function* doActionWithActioName(
    storeType: string,
    actionName: string,
    instanceId: InstanceId,
    params?: any,
): Generator<StoreActionHandle, StoreActionHandle, StoreActionHandle> {
    const action: IInstanceAction<any> = {
        // action id is not provided here
        id: "",
        // generate action name with the reg
        action: `${storeType}.${actionName}`,
        // create action for general
        actionType: ActionType.ACTION,
        storeType,
        instanceId,
        params,
    };
    return yield { type: StoreHandleType.ACTION, action };
}

/**
 * To create an action generator to execute.
 * This API only valid in Action Handler to support recursive dispatching
 *
 * @param action to be generated action instance
 * @returns return a generator for action
 */
export function* doAction(
    action: IInstanceAction<any>,
): Generator<StoreActionHandle, StoreActionHandle, StoreActionHandle> {
    return yield { type: StoreHandleType.ACTION, action };
}

/**
 * To create a selector generator to execute.
 * This API only valid in Action Handler to support recursive dispatching
 *
 * @param selector to be generated selector instance
 * @returns return a generator for selector
 */
export function* doSelector<RESULT>(
    selector: IInstanceSelector<RESULT>,
): Generator<StoreSelectorHandle<RESULT>, SelectorResult<RESULT>, SelectorResult<RESULT>> {
    return yield { type: StoreHandleType.SELECTOR, selector, shouldThrow: false };
}

/**
 * To create a selector generator to execute.
 * This API only valid in Action Handler to support recursive dispatching
 * An error will be thrown if the selector has error
 *
 * @param selector to be generated selector instance
 * @returns return a generator for selector
 */
export function* doSelectorWithThrow<RESULT>(
    selector: IInstanceSelector<RESULT>,
): Generator<StoreSelectorHandle<RESULT>, RESULT, RESULT> {
    return yield { type: StoreHandleType.SELECTOR, selector, shouldThrow: true };
}

/**
 * To create an external object reader generator to execute.
 * This API only valid in Action Handler to support recursive dispatching
 *
 * @param action to be generated external object reader function
 * @returns return a generator for reading external object
 */
export function* doReadExternal<RESULT>(
    handler: ExternalObjectHandleFunction<RESULT>,
): Generator<StoreExternalObjectHandle<RESULT>, RESULT, RESULT> {
    return yield { type: StoreHandleType.EXTERNAL_OBJ, handler };
}
