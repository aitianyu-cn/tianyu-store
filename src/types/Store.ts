/**@format */

import { IStoreState } from "src/store/storage/interface/StoreState";
import { ActionType, IActionProvider, IBatchAction, IInstanceAction, IInstanceViewAction } from "./Action";
import { IExternalObjectRegister } from "./ExternalObject";
import { IStoreHierarchyChecklist } from "./Hierarchy";
import { InstanceId } from "./InstanceId";
import { ITianyuStoreInterface, ITianyuStoreInterfaceMap } from "./Interface";
import { IInstanceListener, StoreEventTriggerCallback } from "./Listener";
import { IterableType } from "./Model";
import { IDifferences } from "./RedoUndoStack";
import { IInstanceSelector, ISelectorProviderBase, SelectorProvider, SelectorResult } from "./Selector";
import { Unsubscribe } from "./Subscribe";
import { CallbackActionT, MapOfString, MapOfStrings, MapOfType } from "@aitianyu.cn/types";
import { TransactionErrorRecord, TransactionOperationRecord, TransactionType } from "./Transaction";

/** this is for internal using */
export interface IStoreExecution {
    getExternalRegister(instanceId: InstanceId, creating?: boolean): IExternalObjectRegister;
    getState(instanceId: InstanceId, creating?: boolean): any;
    getOriginState(instanceId: InstanceId): any;
    getRecentChanges(): IDifferences;
    getHistories(): { histroy: IDifferences[]; index: number };

    applyChanges(): IDifferences;
    discardChanges(): void;
    pushStateChange(
        storeType: string,
        instanceId: string,
        actionType: ActionType,
        newState: any,
        notRedoUndo: boolean,
    ): void;
    pushDiffChange(diff: IDifferences): void;

    validateActionInstance(action: IInstanceAction<any>): void;
}

/** this is for internal using */
export interface IStoreManager {
    id: string;
    getAction(id: string, template: boolean, instanceId: InstanceId): IActionProvider<any, any, any>;
    getSelector(id: string, template: boolean, instanceId: InstanceId): ISelectorProviderBase<any, any>;

    createEntity(instanceId: InstanceId, state: IStoreState): void;
    destroyEntity(instanceId: InstanceId): void;

    getEntity(entity: string): IStoreExecution;
    error(msg: string, type: TransactionType): void;
    select(selector: IInstanceSelector<any>): void;
}

/**
 * Tianyu Store Configuration
 *
 * This is used to configure tianyu store when creating
 */
export type StoreConfiguration = {
    /**
     * Indicates the dispatch action should wait for all operation done (listener and subscribe trigger)
     * or only wait for action exectution done
     *
     * TRUE: await store.dispatch should wait for listener and subscribe trigger done
     * FLASE: await store.dispatch only wait for action execution done
     */
    waitForAll?: boolean;
    /**
     * Indicates the user friendly name of current tianyu store.
     * This name will be shown in tianyu-store devtools for the debugging.
     */
    friendlyName?: string;
};

export interface IStoreSystemInstanceMap extends IterableType {
    parentMap: MapOfType<string | null>;
    childrenMap: MapOfStrings;
}

/** Tianyu Store Instance Entity creation configuration */
export interface IStoreInstanceSystemState extends IterableType {
    /**
     * Indicates the instance can do redo or undo operation
     *
     * If this is false, redo undo stack will not be generated
     */
    config: {
        redoUndo?: boolean;
    };
    instanceMap: IStoreSystemInstanceMap;
}

/** Tianyu Store Instance Entity creation configuration */
export interface IStoreInstanceCreatorConfig extends IterableType {
    /**
     * Indicates the instance can do redo or undo operation
     *
     * If this is false, redo undo stack will not be generated
     */
    redoUndo?: boolean;
}

/**
 * Tianyu Store Interface
 *
 * Tianyu Store is not a template interface due to the inner instances can
 * have different data structure. "any" type is used only in Tianyu Store.
 *
 * Tianyu Store is a manager to provide global operators for store instance.
 */
export interface IStore {
    /** The store object id */
    id: string;
    /** The store friendly name */
    name: string;
    /**
     * To apply an instance hierarchy check list to ensure the intances are controllabl.
     *
     * @param checklist the store entity type parent & child relationship list.
     *
     * @deprecated
     */
    applyHierarchyChecklist(checklist?: IStoreHierarchyChecklist): void;

    /**
     * To register an interface or a map of multi-interfaces into store.
     * Store Only responses a registered operator when selecting and action dispatching.
     * An error will be thrown if used action or selector is not registered.
     *
     * @param interfaceMapOrStoreType to be registered interface map or the store type for interface define.
     * @param interfaceDefine the interface define if the first parameter provides a store type
     */
    registerInterface<STATE extends IterableType>(
        interfaceMapOrStoreType: ITianyuStoreInterfaceMap | string,
        interfaceDefine?: ITianyuStoreInterface<STATE>,
    ): void;

    /**
     * To start an event listen.
     * The event listener will be triggered when the store state is changed
     *
     * @param listener to be registered listener instance
     */
    startListen(listener: IInstanceListener<any>): void;
    /**
     * To stop an event listen.
     * The event listener will be removed from store instance
     *
     * @param listener to be removed listener instance
     */
    stopListen(listener: IInstanceListener<any>): void;

    /**
     * To subscribe a selector.
     * The event trigger will be called when the selector state is changed.
     *
     * @param selector the selector instance
     * @param eventTrigger the event callback when selector state is changed
     *
     * @returns return an unsubscribe function
     */
    subscribe<RESULT>(
        selector: IInstanceSelector<RESULT>,
        eventTrigger: StoreEventTriggerCallback<RESULT>,
    ): Unsubscribe;

    /**
     * To select a state value
     *
     * @param selector the selector instance
     *
     * @returns return selected value
     */
    selecte<RESULT>(selector: IInstanceSelector<RESULT>): SelectorResult<RESULT>;

    /**
     * To select a state value, to throw an error when get state failed
     *
     * @param selector the selector instance
     *
     * @returns return selected value
     */
    selecteWithThrow<RESULT>(selector: IInstanceSelector<RESULT>): RESULT;

    /**
     * To dispatch an action or actions.
     * This dispatch is a transaction executor.
     *
     * @param action to be dispatched action or action batch
     *
     * @returns return a promise to wait actions done
     *
     * WARNING: PLEASE DO NOT EXECUTE A VIEW ACTION DURING THIS DISPATCH EXECUTION,
     * BECAUSE IF THE UNDO, REDO IS APPLIED, STORE STATE MIGHT NOT CHANGED CORRECTLY.
     */
    dispatch(action: IInstanceAction<any> | IBatchAction): Promise<void>;
    /**
     * To dispatch a ui action or actions.
     * This dispatch is not a transaction executor.
     *
     * @param action to be dispatched action or action batch
     *
     * @returns return a promise to wait actions done
     */
    dispatchForView(action: IInstanceViewAction<any> | IBatchAction): void;
    /** Destroy store */
    destroy(): void;
}

export interface IStoreDevAPI {
    /** The store object id */
    id: string;
    /** The store friendly name */
    name: string;

    getState(): MapOfType<IStoreState>;
    getHistories(): { histroy: IDifferences[]; index: number };
    getAllDispatchs(): TransactionOperationRecord<IInstanceAction<any>>[];
    getAllSelectors(): TransactionOperationRecord<IInstanceSelector<any>>[];
    getAllErrors(): TransactionErrorRecord[];

    setOnSelector(callback?: CallbackActionT<TransactionOperationRecord<IInstanceSelector<any>>>): void;
    setOnDispatch(callback?: CallbackActionT<TransactionOperationRecord<IInstanceAction<any>>>): void;
    setOnError(callback?: CallbackActionT<TransactionErrorRecord>): void;
    setOnChangeApplied(callback?: CallbackActionT<IDifferences>): void;
}
