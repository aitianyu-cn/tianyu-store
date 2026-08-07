/** @format */

import { InstanceId } from "src/types/InstanceId";
import { InstanceIdImpl } from "../impl/InstanceIdImpl";
import { MessageBundle } from "src/infra/Message";
import { TIANYU_STORE_INSTANCE_BASE_ENTITY_STORE_TYPE } from "src/types/Defs";
import { IInstanceAction, ActionType } from "src/types/Action";

export function getStoreTypeMatchedInstanceId(storeType: string, instanceId: InstanceId): InstanceId {
    if (instanceId.storeType === storeType) {
        return instanceId;
    }
    const instancePair = instanceId.structure();
    let index = instancePair.length - 1;
    for (; index >= 0; --index) {
        if (instancePair[index].storeType === storeType) {
            break;
        }
    }

    if (index < 0) {
        throw new Error(
            MessageBundle.getText("RUNNING_STORE_TYPE_INSTANCE_NOT_MATCH", storeType, instanceId.toString()),
        );
    }

    return new InstanceIdImpl(instancePair.slice(0, index + 1));
}

export function verifyInstanceSameAncestor(...s: InstanceId[]): string {
    if (s.length === 0) {
        return "";
    }

    const first = s[0];
    let other = s[0];
    const differentAncestor = s.some((value) => {
        other = value;
        return first.entity !== value.entity;
    });

    if (differentAncestor) {
        // to throw error when the two instance belongs to different ancestor
        throw new Error(MessageBundle.getText("DISPATCHING_ACTIONS_DIFFERENT_ANCESTOR", first.entity, other.entity));
    }

    return first.entity;
}

export function verifyInstanceIdMatchStoreTypeOrParentStoreType(storeType: string, instanceId: InstanceId): boolean {
    if (!instanceId.isValid()) {
        return false;
    }

    let instance = instanceId;
    while (!InstanceIdImpl.isAncestor(instance)) {
        if (instance.storeType === storeType) {
            return true;
        }

        instance = instance.parent;
    }

    return storeType === TIANYU_STORE_INSTANCE_BASE_ENTITY_STORE_TYPE;
}

export function verifyActionInstances(s: IInstanceAction<any>[]): string {
    const actionCount = s.length;
    const instanceIds = s.map((value) => {
        if (!value.instanceId.isValid()) {
            // throw an error when redo undo operation is not atom
            throw new Error(
                MessageBundle.getText("DISPATCHING_INSTANCE_ID_NOT_VALID", value.action, value.instanceId.toString()),
            );
        }

        if (actionCount > 1 && (value.actionType === ActionType.REDO || value.actionType === ActionType.UNDO)) {
            // throw an error when redo undo operation is not atom
            throw new Error(MessageBundle.getText("DISPATCHING_REDO_UNDO_NOT_ATOM", value.action));
        }

        if (
            actionCount > 1 &&
            InstanceIdImpl.isAncestor(value.instanceId) &&
            (value.actionType === ActionType.CREATE || value.actionType === ActionType.DESTROY)
        ) {
            // throw an error when create or destroy an entity is not atom
            throw new Error(MessageBundle.getText("DISPATCHING_SYSTEM_LIFECYCLE_NOT_ATOM", value.action));
        }

        return value.instanceId;
    });

    return verifyInstanceSameAncestor(...instanceIds);
}
