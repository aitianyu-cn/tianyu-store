/** @format */

import { InstanceId } from "src/types/InstanceId";
import { SelectorFactor } from "../SelectorFactor";
import { IStoreState, STORE_STATE_INSTANCE, STORE_STATE_SYSTEM } from "./interface/StoreState";
import { InstanceIdImpl } from "../impl/InstanceIdImpl";
import { IRedoUndoStack, STORE_STATE_EXTERNAL_REDOUNDO_STACK } from "./interface/RedoUndoStack";

export const GetInstanceExist = SelectorFactor.makeParameterSelector<IStoreState, InstanceId, boolean>(function (
    state,
    instanceId,
) {
    if (InstanceIdImpl.isAncestor(instanceId)) {
        return true;
    }

    const storeType = instanceId.storeType;
    const instanceId2String = instanceId.toString();

    return Boolean(state[STORE_STATE_INSTANCE][storeType]?.[instanceId2String]);
});

export const GetParentInstance = SelectorFactor.makeParameterSelector<
    IStoreState,
    InstanceId,
    InstanceId | null,
    boolean
>(
    function (state, instanceId, isRedoUndo) {
        let parentString: string | null = null;
        if (!isRedoUndo) {
            parentString = state[STORE_STATE_SYSTEM].instanceMap.parentMap[instanceId.toString()];
        } else {
            const parentIns = instanceId.parent;
            if (InstanceIdImpl.isAncestor(parentIns)) {
                parentString = null;
            } else {
                const storeType = parentIns.storeType;
                const parentInsString = parentIns.toString();
                if (state[STORE_STATE_INSTANCE][storeType]?.[parentInsString]) {
                    parentString = parentInsString;
                }
            }
        }

        return parentString ? new InstanceIdImpl(parentString) : null;
    },
    function (register) {
        const redoUndoStack = register.get<IRedoUndoStack>(STORE_STATE_EXTERNAL_REDOUNDO_STACK);
        return Boolean(redoUndoStack?.canRedo);
    },
);

export const GetChildInstances = SelectorFactor.makeParameterSelector<IStoreState, InstanceId, InstanceId[], boolean>(
    function (state, instanceId, isRedoUndo) {
        const childIns: InstanceId[] = [];
        if (!isRedoUndo) {
            for (const child of state[STORE_STATE_SYSTEM].instanceMap.childrenMap[instanceId.toString()] || []) {
                childIns.push(new InstanceIdImpl(child));
            }
        } else {
            for (const storeType of Object.keys(state[STORE_STATE_INSTANCE])) {
                const storeIns = state[STORE_STATE_INSTANCE][storeType];
                for (const instanceString of Object.keys(storeIns)) {
                    const ins = new InstanceIdImpl(instanceString);
                    if (ins.parent.equals(instanceId)) {
                        childIns.push(ins);
                    }
                }
            }
        }

        return childIns;
    },
    function (register) {
        const redoUndoStack = register.get<IRedoUndoStack>(STORE_STATE_EXTERNAL_REDOUNDO_STACK);
        return Boolean(redoUndoStack?.canRedo);
    },
);
