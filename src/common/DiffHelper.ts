/** @format */

import { ArrayHelper, ObjectHelper } from "@aitianyu.cn/types";
import { IStoreState, STORE_STATE_INSTANCE } from "src/store/storage/interface/StoreState";
import { DifferenceChangeType, IDifferences } from "src/types/RedoUndoStack";

export function getDifference(pre: IStoreState, next: IStoreState): IDifferences {
    const diffs: IDifferences = {};

    const preStores = pre[STORE_STATE_INSTANCE];
    const nextStores = next[STORE_STATE_INSTANCE];

    const storeTypes = ArrayHelper.merge(Object.keys(preStores), Object.keys(nextStores));
    for (const storeType of storeTypes) {
        // for store state, when the store register a new store type
        // the store type will be updated to ensure contain all store type
        // so the store type that is same between pre and next.
        // and for the difference calc, only save the changes when the instance changed.

        const preStoreInstances = preStores[storeType] || {};
        const nextStoreInstances = nextStores[storeType] || {};

        const preStoreInstanceIds = Object.keys(preStoreInstances);
        const nextStoreInstanceIds = Object.keys(nextStoreInstances);

        // for this loop, to find changed and deleted
        for (const instance of preStoreInstanceIds) {
            // get new state from next state
            const nextState = nextStoreInstances[instance];

            // if next state does not exist, the state is deleted
            const isDeleted = !nextState;
            // if next state is deleted or has value changed, the changed state is true
            const hasChanged =
                isDeleted || ObjectHelper.compareObjects(preStoreInstances[instance], nextState) === "different";

            if (hasChanged) {
                diffs[storeType] = {
                    ...(diffs[storeType] || {}),
                    [instance]: {
                        old: preStoreInstances[instance],
                        new: isDeleted ? undefined : nextState,
                        type: isDeleted ? DifferenceChangeType.Delete : DifferenceChangeType.Change,
                    },
                };
            }
        }

        // for this loop, to find added
        for (const instance of nextStoreInstanceIds) {
            // get new state which are not in old
            if (!preStoreInstances[instance]) {
                // this is pre instance does not exist

                diffs[storeType] = {
                    ...(diffs[storeType] || {}),
                    [instance]: {
                        old: undefined,
                        new: nextStoreInstances[instance],
                        type: DifferenceChangeType.Create,
                    },
                };
            }
        }
    }
    return diffs;
}

export function mergeDiff(
    state: IStoreState,
    diff: IDifferences,
    reverse?: boolean,
    isRedoUndo?: boolean,
): IStoreState {
    const newState = ObjectHelper.clone(state) as IStoreState;

    for (const storeType of Object.keys(diff)) {
        const storeInstances = diff[storeType];

        for (const instanceId of Object.keys(storeInstances)) {
            const diffItem = storeInstances[instanceId];
            if (
                (!reverse && diffItem.type === DifferenceChangeType.Create) ||
                (reverse && diffItem.type === DifferenceChangeType.Delete)
            ) {
                // in normal mode and the change type is create
                // in reverse mode and the change type is delete
                // to do the create

                // if normal create, set the new state as state
                // if delete, set the old state as state
                if (!isRedoUndo) {
                    newState[STORE_STATE_INSTANCE][storeType] = {
                        ...(newState[STORE_STATE_INSTANCE][storeType] || {}),
                        [instanceId]: diffItem.type === DifferenceChangeType.Create ? diffItem.new : diffItem.old,
                    };
                }
            } else if (
                (!reverse && diffItem.type === DifferenceChangeType.Delete) ||
                (reverse && diffItem.type === DifferenceChangeType.Create)
            ) {
                // in normal mode and the change type is delete
                // in reverse mode and the change type is create
                // to do the delete

                if (!isRedoUndo && newState[STORE_STATE_INSTANCE][storeType][instanceId]) {
                    delete newState[STORE_STATE_INSTANCE][storeType][instanceId];
                }
            } else {
                newState[STORE_STATE_INSTANCE][storeType] = {
                    ...(newState[STORE_STATE_INSTANCE][storeType] || {}),
                    [instanceId]: reverse ? diffItem.old : diffItem.new,
                };
            }
        }
    }

    return newState;
}
