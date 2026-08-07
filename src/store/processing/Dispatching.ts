/** @format */

import { MessageBundle } from "src/infra/Message";
import { IInstanceAction, ActionType } from "src/types/Action";
import { IStoreExecution, IStoreManager } from "src/types/Store";
import {
    AnyStoreHandle,
    StoreHandleType,
    StoreActionHandle,
    StoreSelectorHandle,
    StoreExternalObjectHandle,
} from "src/types/StoreHandler";
import { doSelecting, doSelectingWithThrow } from "./Selecting";
import {
    getStoreTypeMatchedInstanceId,
    verifyActionInstances,
    verifyInstanceIdMatchStoreTypeOrParentStoreType,
    verifyInstanceSameAncestor,
} from "./InstanceProcessor";
import { ActionProcessorMap } from "./ActionProcessor";

export async function dispatching(
    executor: IStoreExecution,
    manager: IStoreManager,
    actions: IInstanceAction<any>[],
    /* istanbul ignore next */
    notRedoUndo: boolean = false,
): Promise<IInstanceAction<any>[]> {
    const ranActions: IInstanceAction<any>[] = [];

    const _entity = verifyActionInstances(actions);

    for (const rawAction of actions) {
        const actionImpl = manager.getAction(rawAction.action, !!rawAction.template, rawAction.instanceId);

        // due to in the internal case, there will execute action by action name only
        // reget the action instance to ensure the action valid
        const action = actionImpl(rawAction.instanceId, rawAction.params);
        if (!verifyInstanceIdMatchStoreTypeOrParentStoreType(action.storeType, action.instanceId)) {
            // throw an error when try to use a different store type instance to run action
            throw new Error(
                MessageBundle.getText(
                    "DISPATCHING_ACTION_INSTANCE_NOT_MATCH",
                    action.storeType,
                    action.instanceId.storeType,
                    action.action,
                ),
            );
        }

        ranActions.push(action);

        // execute external processing
        if (actionImpl.external) {
            await actionImpl.external(
                executor.getExternalRegister(action.instanceId, action.actionType === ActionType.CREATE),
            );
        }
        const iterator = actionImpl.handler(action);

        const fnGetNextValue = async (handleResult: AnyStoreHandle) => {
            switch (handleResult.type) {
                case StoreHandleType.ACTION:
                    const subAction = handleResult as StoreActionHandle;
                    verifyInstanceSameAncestor(action.instanceId, subAction.action.instanceId);
                    const subRanActions = await dispatching(executor, manager, [subAction.action], notRedoUndo);
                    ranActions.push(...subRanActions);
                    return subRanActions;
                case StoreHandleType.SELECTOR:
                    const selectedValue = (handleResult as StoreSelectorHandle<any>).shouldThrow
                        ? doSelectingWithThrow(manager, (handleResult as StoreSelectorHandle<any>).selector, false)
                        : doSelecting(manager, (handleResult as StoreSelectorHandle<any>).selector, false);
                    return selectedValue;
                case StoreHandleType.EXTERNAL_OBJ:
                    const externalGetter = (handleResult as StoreExternalObjectHandle<any>).handler(
                        executor.getExternalRegister(action.instanceId),
                    );
                    return externalGetter;

                /* istanbul ignore next */
                default:
                    throw new Error(MessageBundle.getText("DISPATCHING_HANDLER_WITH_UNKNOWN_RESULT"));
            }
        };

        const fnGeneratorRunner = async (value: any) => {
            const result = await iterator.next(value);
            if (result.done) {
                // this is for action done
                if (actionImpl.reducer) {
                    const newState = actionImpl.reducer(
                        executor.getState(
                            getStoreTypeMatchedInstanceId(action.storeType, action.instanceId),
                            action.actionType === ActionType.CREATE,
                        ),
                        result.value,
                    );
                    ActionProcessorMap[action.actionType](executor, manager, action, newState, notRedoUndo);
                }
            } else {
                const handleResult = result.value;
                const nextValue = await fnGetNextValue(handleResult);
                await fnGeneratorRunner(nextValue);
            }
        };

        await fnGeneratorRunner(action);
    }

    return ranActions;
}
