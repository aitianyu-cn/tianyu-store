/** @format */

import { ObjectHelper } from "@aitianyu.cn/types";
import { mergeDiff } from "src/common/DiffHelper";
import { MessageBundle } from "src/infra/Message";
import { ActionType, IInstanceAction } from "src/types/Action";
import { IExternalObjectRegister } from "src/types/ExternalObject";
import { InstanceId } from "src/types/InstanceId";
import { IStoreExecution } from "src/types/Store";
import { ExternalRegister } from "../modules/ExternalRegister";
import { RedoUndoStackImpl } from "../storage/RedoUndoStackImpl";
import { STORE_STATE_EXTERNAL_REDOUNDO_STACK, IRedoUndoStack } from "../storage/interface/RedoUndoStack";
import { IStoreState, STORE_STATE_SYSTEM, STORE_STATE_INSTANCE } from "../storage/interface/StoreState";
import { InstanceIdImpl } from "./InstanceIdImpl";
import { InstanceParentHolder } from "../modules/InstanceParentHolder";
import { DifferenceChangeType, IDifferences } from "src/types/RedoUndoStack";
import { isChangesEmpty } from "src/utils/ObjectUtils";

interface IStoreChangeInstance {
    [storeType: string]: {
        [instanceId: string]: {
            state: any;
            type: DifferenceChangeType;
            redoUndo: boolean;
            record: boolean;
        };
    };
}

export class StoreInstanceImpl implements IStoreExecution {
    // external object will not be redo/undo
    // even it is created, only when the whole store instance is destroied or delete it manually,
    // the external objects are always kept
    private externalObjectMap: Map<string, IExternalObjectRegister>;
    private parentChildHolder: InstanceParentHolder;
    private storeState: IStoreState;
    private instanceId: InstanceId;

    private changeCache: IStoreChangeInstance;
    private diffCache: IDifferences;

    public constructor(state: IStoreState, instanceId: InstanceId) {
        this.storeState = state;
        this.changeCache = {};
        this.diffCache = {};
        this.instanceId = instanceId;

        this.externalObjectMap = new Map<string, IExternalObjectRegister>();
        this.parentChildHolder = new InstanceParentHolder();

        // to init the root external register
        const externalRegister = new ExternalRegister();
        if (this.storeState[STORE_STATE_SYSTEM].config.redoUndo) {
            externalRegister.add(STORE_STATE_EXTERNAL_REDOUNDO_STACK, new RedoUndoStackImpl());
        }
        this.externalObjectMap.set(instanceId.toString(), externalRegister);
    }

    public getRecentChanges(): IDifferences {
        const redoUndoStack = this.externalObjectMap
            .get(this.instanceId.toString())
            ?.get(STORE_STATE_EXTERNAL_REDOUNDO_STACK) as IRedoUndoStack | undefined;
        return redoUndoStack?.getCurrent() || {};
    }

    public getHistories(): { histroy: IDifferences[]; index: number } {
        const redoUndoStack = this.externalObjectMap
            .get(this.instanceId.toString())
            ?.get(STORE_STATE_EXTERNAL_REDOUNDO_STACK) as IRedoUndoStack | undefined;
        return redoUndoStack?.getHistroies() || /* istanbul ignore next */ { histroy: [], index: -1 };
    }

    public addStoreType(storeType: string): void {
        if (!this.storeState[STORE_STATE_INSTANCE][storeType]) {
            this.storeState[STORE_STATE_INSTANCE][storeType] = {};
        }
    }

    public getRawState(): IStoreState {
        return ObjectHelper.clone(this.storeState);
    }

    getExternalRegister(instanceId: InstanceId, creating?: boolean): IExternalObjectRegister {
        const externalObject = this.externalObjectMap.get(instanceId.toString());
        if (!externalObject) {
            throw new Error(MessageBundle.getText("STORE_INSTANCE_EXTRERNAL_MANAGER_NOT_FOUND", instanceId.toString()));
        }

        return externalObject;
    }
    getState(instanceId: InstanceId, creating?: boolean) {
        if (InstanceIdImpl.isAncestor(instanceId)) {
            // if the instance id indicates an entity it self
            // return whole store state

            return this.storeState;
        }

        const instanceId2String = instanceId.toString();
        const storeType = instanceId.storeType;
        if (!storeType) {
            throw new Error(MessageBundle.getText("INSTANCE_ID_NOT_VALID", instanceId2String));
        }

        const cachedState = this.changeCache[storeType]?.[instanceId2String];
        if (cachedState?.type === DifferenceChangeType.Delete) {
            // instance is deleted and it does not be able to be used
            throw new Error(MessageBundle.getText("STORE_INSTANCE_USE_DELETED", storeType, instanceId2String));
        }

        const instances = this.storeState[STORE_STATE_INSTANCE][storeType];
        const ins = cachedState?.state || instances[instanceId2String];
        if (!ins && !creating) {
            throw new Error(MessageBundle.getText("STORE_INSTANCE_NOT_EXIST", instanceId2String));
        }

        return ins;
    }

    getOriginState(instanceId: InstanceId) {
        if (InstanceIdImpl.isAncestor(instanceId)) {
            // if the instance id indicates an entity it self
            // return whole store state

            return this.storeState;
        }

        const instanceId2String = instanceId.toString();
        const storeType = instanceId.storeType;
        if (!storeType) {
            throw new Error(MessageBundle.getText("INSTANCE_ID_NOT_VALID", instanceId2String));
        }

        const instances = this.storeState[STORE_STATE_INSTANCE][storeType];
        const ins = instances[instanceId2String];
        if (!ins) {
            throw new Error(MessageBundle.getText("STORE_INSTANCE_NOT_EXIST", instanceId2String));
        }

        return ins;
    }

    applyChanges(): IDifferences {
        let redoUndoSupport = true;
        let recordRedoUndo = true;
        const diff: IDifferences = this.diffCache;
        this.diffCache = {};

        if (isChangesEmpty(diff)) {
            const changes = this.changeCache;
            this.changeCache = {};
            for (const storyType of Object.keys(changes)) {
                const instances = changes[storyType];
                for (const insId of Object.keys(instances)) {
                    const changeItem = instances[insId];
                    const oldState = this.storeState[STORE_STATE_INSTANCE][storyType]?.[insId];
                    if (ObjectHelper.compareObjects(oldState, changeItem.state) === "different") {
                        // ensure the state is changed
                        if (!diff[storyType]) {
                            diff[storyType] = {};
                        }
                        diff[storyType][insId] = {
                            new: changeItem.state,
                            old: oldState,
                            type: changeItem.type,
                        };
                    }

                    if (changeItem.type === DifferenceChangeType.Create) {
                        this.parentChildHolder.createInstance(
                            new InstanceIdImpl(insId),
                            this.storeState[STORE_STATE_SYSTEM].instanceMap,
                        );
                    }

                    // this is for state redo/undo checking
                    // when there is a view action
                    // should clean all redo/undo stack due to the state is could not be navigated
                    redoUndoSupport = redoUndoSupport && changeItem.redoUndo;

                    // this is for state redo/undo recording checking
                    // when there is a redo/undo action
                    // should not to record the state change again
                    recordRedoUndo = recordRedoUndo && changeItem.record;
                }
            }
        } else {
            recordRedoUndo = false;
        }

        this.storeState = mergeDiff(this.storeState, diff);
        this.parentChildHolder.applyChanges(this.storeState[STORE_STATE_SYSTEM].instanceMap);

        const redoUndoStack = this.externalObjectMap
            .get(this.instanceId.toString())
            ?.get(STORE_STATE_EXTERNAL_REDOUNDO_STACK) as IRedoUndoStack | undefined;
        if (redoUndoSupport) {
            recordRedoUndo && redoUndoStack?.record(diff);
        } else {
            redoUndoStack?.resetRedoUndo();
        }

        return diff;
    }
    discardChanges(): void {
        this.changeCache = {};
        this.parentChildHolder.discardChanges();
    }
    pushStateChange(
        storeType: string,
        instanceId: string,
        actionType: ActionType,
        newState: any,
        notRedoUndo: boolean,
    ): void {
        if (!this.changeCache[storeType]) {
            this.changeCache[storeType] = {};
        }

        const redoUndo = !notRedoUndo && actionType !== ActionType.VIEW_ACTION;
        const record = actionType !== ActionType.REDO && actionType !== ActionType.UNDO;

        this.changeCache[storeType][instanceId] = {
            state: newState,
            type:
                actionType === ActionType.CREATE
                    ? DifferenceChangeType.Create
                    : actionType === ActionType.DESTROY
                    ? DifferenceChangeType.Delete
                    : DifferenceChangeType.Change,
            redoUndo,
            record,
        };

        if (actionType === ActionType.CREATE) {
            // for create new instance, to create a new external object manager
            this.externalObjectMap.set(instanceId, new ExternalRegister());
        }

        if (actionType === ActionType.DESTROY) {
            // for destroy instance, to destroy its children
            const instances = this.parentChildHolder.removeInstance(
                instanceId,
                this.storeState[STORE_STATE_SYSTEM].instanceMap,
            );
            for (const insId of instances) {
                const ins = new InstanceIdImpl(insId);
                const storeType = ins.storeType;
                this.changeCache[storeType][insId] = {
                    state: undefined,
                    type: DifferenceChangeType.Delete,
                    redoUndo,
                    record,
                };
            }
        }
    }

    pushDiffChange(diff: IDifferences): void {
        this.diffCache = diff;
    }

    validateActionInstance(action: IInstanceAction<any>): void {
        //
    }
}
