/** @format */

import { guid, ObjectHelper } from "@aitianyu.cn/types";
import { MessageBundle } from "src/infra/Message";
import { IActionProvider, IInstanceAction, IBatchAction, IInstanceViewAction, ActionType } from "src/types/Action";
import { TIANYU_STORE_INSTANCE_BASE_ENTITY_STORE_TYPE } from "src/types/Defs";
import { IExternalObjectRegister } from "src/types/ExternalObject";
import { IStoreHierarchyChecklist } from "src/types/Hierarchy";
import { InstanceId } from "src/types/InstanceId";
import {
    ITianyuStoreInterfaceList,
    ITianyuStoreInterfaceMap,
    ITianyuStoreInterface,
    ITianyuStoreInterfaceImplementation,
} from "src/types/Interface";
import { StoreEventTriggerCallback, IInstanceListener } from "src/types/Listener";
import { IterableType, Missing } from "src/types/Model";
import { IInstanceSelector, ISelectorProviderBase, SelectorProvider, SelectorResult } from "src/types/Selector";
import { IStore, IStoreManager, IStoreExecution, StoreConfiguration } from "src/types/Store";
import { Unsubscribe } from "src/types/Subscribe";
import { TransactionType } from "src/types/Transaction";
import { registerInterface } from "src/utils/InterfaceUtils";
import { TianyuStoreRedoUndoInterface } from "../RedoUndoFactor";
import { TianyuStoreEntityInterface } from "../SystemActionFactor";
import { TransactionManager, formatTransactionType } from "../modules/Transaction";
import { dispatching } from "../processing/Dispatching";
import { doSelecting, doSelectingWithState } from "../processing/Selecting";
import { IDifferences } from "../storage/interface/RedoUndoStack";
import { IStoreState, STORE_STATE_INSTANCE } from "../storage/interface/StoreState";
import { InvalidExternalRegister } from "./InvalidExternalRegisterImpl";
import { StoreInstanceImpl } from "./StoreInstanceImpl";

interface IInstanceSubscribe {
    id: string;
    selector: IInstanceSelector<any>;
    trigger: StoreEventTriggerCallback<any>;
}

interface IInstanceSubscribeMap {
    [id: string]: IInstanceSubscribe[];
}

interface IInstanceListenerMap {
    [id: string]: IInstanceListener<any>[];
}

function isChangesEmpty(changes: IDifferences): boolean {
    return Object.keys(changes).length === 0;
}

export class StoreImpl implements IStore, IStoreManager, IStoreExecution {
    private config: StoreConfiguration;

    // private hierarchyChecker: StoreInstanceChecker;
    private operationList: ITianyuStoreInterfaceList;
    private storyTypes: string[];

    private entityMap: Map<string, StoreInstanceImpl>;
    private instanceSubscribe: Map<string, IInstanceSubscribeMap>;
    private instanceListener: Map<string, IInstanceListenerMap>;

    private dispatchPromise: Promise<void>;

    public constructor(config: StoreConfiguration) {
        this.config = config;

        // this.hierarchyChecker = new StoreInstanceChecker();
        this.operationList = {};
        this.storyTypes = [];
        this.entityMap = new Map<string, StoreInstanceImpl>();
        this.instanceSubscribe = new Map<string, IInstanceSubscribeMap>();
        this.instanceListener = new Map<string, IInstanceListenerMap>();

        this.dispatchPromise = Promise.resolve();

        // to register basic actions
        this.registerInterfaceInternal(TIANYU_STORE_INSTANCE_BASE_ENTITY_STORE_TYPE, TianyuStoreRedoUndoInterface);
        this.registerInterfaceInternal(TIANYU_STORE_INSTANCE_BASE_ENTITY_STORE_TYPE, TianyuStoreEntityInterface);
    }

    getAction(id: string): IActionProvider<any, any, any> {
        const action = this.operationList[id] as IActionProvider<any, any, any>;
        if (!action?.actionId) {
            throw new Error(MessageBundle.getText("STORE_ACTION_NOT_FOUND", id));
        }

        return action;
    }
    getSelector(id: string): ISelectorProviderBase<any> {
        const selector = this.operationList[id] as ISelectorProviderBase<any>;
        if (!selector?.selector) {
            throw new Error(MessageBundle.getText("STORE_SELECTOR_NOT_FOUND", id));
        }

        return selector;
    }
    createEntity(instanceId: InstanceId, state: IStoreState): void {
        if (this.entityMap.has(instanceId.entity)) {
            throw new Error(MessageBundle.getText("STORE_CREATE_ENTITY_DUP", instanceId.entity, instanceId.id));
        }

        // before setting, to add all the story types
        for (const type of this.storyTypes) {
            state[STORE_STATE_INSTANCE][type] = {};
        }
        this.entityMap.set(instanceId.entity, new StoreInstanceImpl(state, instanceId));
        this.instanceListener.set(instanceId.entity, {});
        this.instanceSubscribe.set(instanceId.entity, {});
    }
    destroyEntity(instanceId: InstanceId): void {
        this.entityMap.delete(instanceId.entity);
        this.instanceListener.delete(instanceId.entity);
        this.instanceSubscribe.delete(instanceId.entity);
    }

    getEntity(entity: string): IStoreExecution {
        return this.entityMap.get(entity) || this;
    }

    applyHierarchyChecklist(checklist?: IStoreHierarchyChecklist | undefined): void {
        // this.hierarchyChecker.apply(checklist || {});
    }
    registerInterface<STATE extends IterableType>(
        interfaceMapOrStoreType: string | ITianyuStoreInterfaceMap,
        interfaceDefine?: ITianyuStoreInterface<STATE> | undefined,
    ): void {
        const interfaceMap: ITianyuStoreInterfaceMap = {
            ...(typeof interfaceMapOrStoreType === "string"
                ? { [interfaceMapOrStoreType]: interfaceDefine }
                : interfaceMapOrStoreType),
        };

        const storeTypes = Object.keys(interfaceMap);
        for (const types of storeTypes) {
            if (types === TIANYU_STORE_INSTANCE_BASE_ENTITY_STORE_TYPE) {
                // the registered operations could not be in tianyu-store-entity
                // due to this is the system using
                throw new Error(MessageBundle.getText("STORE_SHOULD_NOT_REGISTER_SYSTEM_ENTITY"));
            }

            const interfaceOfStore = interfaceMap[types];
            if (!interfaceOfStore) {
                continue;
            }

            this.registerInterfaceInternal(types, interfaceOfStore);

            if (!this.storyTypes.includes(types)) {
                // if the interfaces are not added before,
                this.storyTypes.push(types);
                this.entityMap.forEach((value) => {
                    value.addStoreType(types);
                });
            }
        }
    }
    startListen(listener: IInstanceListener<any>): void {
        const entityId = listener.selector.instanceId.entity;
        const entityListeners = this.instanceListener.get(entityId);
        if (!entityListeners) {
            throw new Error(MessageBundle.getText("STORE_ENTITY_NOT_EXIST", entityId));
        }

        const instanceId = listener.selector.instanceId.toString();
        const listeners = entityListeners[instanceId] || [];
        if (!entityListeners[instanceId]) {
            entityListeners[instanceId] = listeners;
        }
        listeners.push(listener);
    }
    stopListen(listener: IInstanceListener<any>): void {
        const entityId = listener.selector.instanceId.entity;
        const entityListeners = this.instanceListener.get(entityId);
        if (!entityListeners) {
            return;
        }

        const instanceId = listener.selector.instanceId.toString();
        const listeners = entityListeners[instanceId] || /* istanbul ignore next */ [];
        const listenerIndex = listeners.findIndex((value) => {
            return value.id === listener.id;
        });
        if (-1 !== listenerIndex) {
            listeners.splice(listenerIndex, 1);
            entityListeners[instanceId] = listeners;
        }
    }
    subscribe<RESULT>(
        selector: IInstanceSelector<RESULT>,
        eventTrigger: StoreEventTriggerCallback<RESULT>,
    ): Unsubscribe {
        const entityId = selector.instanceId.entity;
        const entityListeners = this.instanceSubscribe.get(entityId);
        if (!entityListeners) {
            throw new Error(MessageBundle.getText("STORE_ENTITY_NOT_EXIST", entityId));
        }

        const subscribeInstance: IInstanceSubscribe = {
            id: guid(),
            selector: selector,
            trigger: eventTrigger,
        };

        const instanceId2String = selector.instanceId.toString();
        const subscribes = entityListeners[instanceId2String] || [];
        if (!entityListeners[instanceId2String]) {
            entityListeners[instanceId2String] = subscribes;
        }
        subscribes.push(subscribeInstance);

        const unSub = () => {
            const entityListeners = this.instanceSubscribe.get(entityId);

            // this 'if' should not accessed
            /* istanbul ignore if  */
            if (!entityListeners) {
                return;
            }

            const subscribes = entityListeners[instanceId2String] || /* istanbul ignore next */ [];
            const subscribeIndex = subscribes.findIndex((value) => {
                return value.id === subscribeInstance.id;
            });
            if (-1 !== subscribeIndex) {
                subscribes.splice(subscribeIndex, 1);
                entityListeners[instanceId2String] = subscribes;
            }
        };

        return unSub;
    }
    selecte<RESULT>(selector: IInstanceSelector<RESULT>): SelectorResult<RESULT> {
        const entityId = selector.instanceId.entity;
        const entity = this.entityMap.get(entityId);
        if (!entity) {
            throw new Error(MessageBundle.getText("STORE_ENTITY_NOT_EXIST", entityId));
        }

        return doSelecting<RESULT>(entity, this, selector);
    }
    dispatch(action: IInstanceAction | IBatchAction): Promise<void> {
        const actions = Array.isArray((action as IBatchAction).actions)
            ? (action as IBatchAction).actions
            : [action as IInstanceAction];

        return this.dispatchInternal(actions, false);
    }
    dispatchForView(action: IBatchAction | IInstanceViewAction): void {
        const actions = Array.isArray((action as IBatchAction).actions)
            ? (action as IBatchAction).actions
            : [action as IInstanceAction];

        void this.dispatchInternal(actions, true);
    }

    private async dispatchInternal(action: IInstanceAction[], notRedoUndo: boolean): Promise<void> {
        if (action.length === 0) {
            return;
        }

        const entity = action[0].instanceId.entity;

        return new Promise<void>((resolve) => {
            this.dispatchPromise = this.dispatchPromise.finally(async () => {
                let resolved = false;
                const executor = this.getEntity(entity);
                try {
                    const actions = await dispatching(executor, this, action, notRedoUndo);
                    // transaction
                    TransactionManager.dispatched(actions);

                    // apply changes
                    executor.applyChanges();

                    if (!this.config.waitForAll) {
                        resolved = true;
                        resolve();
                    }

                    // fire events
                    const changes = executor.getRecentChanges();
                    if (!isChangesEmpty(changes)) {
                        await this.fireListeners(entity, changes, executor);
                        await this.fireSubscribes(entity, changes, executor);
                    }

                    if (this.config.waitForAll && !resolved) {
                        resolved = true;
                        resolve();
                    }
                } catch (e) {
                    // records error
                    TransactionManager.error(e as any, TransactionType.Action);

                    // if action run failed, to discard all changes of current action batch
                    executor.discardChanges();

                    !resolved && resolve();
                    resolved = true;
                }
            });
        });
    }

    private registerInterfaceInternal(storeType: string, interfaceDefine: ITianyuStoreInterfaceImplementation): void {
        const interfaceOperationsList = registerInterface(interfaceDefine, storeType);
        this.operationList = {
            ...this.operationList,
            ...interfaceOperationsList,
        };
    }

    private async fireListeners(entity: string, changes: IDifferences, executor: IStoreExecution): Promise<void> {
        const entityListeners = this.instanceListener.get(entity);
        if (!entityListeners) {
            return;
        }

        for (const storeType of Object.keys(changes)) {
            const instances = changes[storeType];
            for (const instanceId of Object.keys(instances)) {
                const changeItem = instances[instanceId];
                const listeners = entityListeners[instanceId] || [];
                listeners.forEach((listener) => {
                    try {
                        const oldState =
                            changeItem.old && doSelectingWithState(changeItem.old, executor, this, listener.selector);
                        const newState =
                            changeItem.new && doSelectingWithState(changeItem.new, executor, this, listener.selector);

                        const oldNoMissing = oldState instanceof Missing ? undefined : oldState;
                        const newNoMissing = newState instanceof Missing ? undefined : newState;
                        const isChanged = ObjectHelper.compareObjects(oldState, newState) === "different";

                        isChanged && listener.listener(oldNoMissing, newNoMissing);
                    } catch (e) {
                        TransactionManager.error(
                            MessageBundle.getText(
                                "STORE_EVENT_LISTENER_TRIGGER_FAILED",
                                typeof e === "string"
                                    ? e
                                    : e instanceof Error
                                    ? e.message
                                    : MessageBundle.getText(
                                          "TRANSACTION_ERROR_RECORDING_UNKNOWN_ERROR",
                                          formatTransactionType(TransactionType.Listener),
                                      ),
                                listener.id,
                                listener.selector.selector,
                            ),
                            TransactionType.Listener,
                        );
                    }
                });
            }
        }
    }

    private async fireSubscribes(entity: string, changes: IDifferences, executor: IStoreExecution): Promise<void> {
        const entityListeners = this.instanceSubscribe.get(entity);
        if (!entityListeners) {
            return;
        }

        for (const storeType of Object.keys(changes)) {
            const instances = changes[storeType];
            for (const instanceId of Object.keys(instances)) {
                const changeItem = instances[instanceId];
                const listeners = entityListeners[instanceId] || [];
                listeners.forEach((listener) => {
                    try {
                        const oldState = doSelectingWithState(changeItem.old, executor, this, listener.selector);
                        const newState = doSelectingWithState(changeItem.new, executor, this, listener.selector);

                        const oldNoMissing = oldState instanceof Missing ? undefined : oldState;
                        const newNoMissing = newState instanceof Missing ? undefined : newState;
                        const isChanged = ObjectHelper.compareObjects(oldState, newState) === "different";

                        isChanged && listener.trigger(oldNoMissing, newNoMissing);
                    } catch (e) {
                        TransactionManager.error(
                            MessageBundle.getText(
                                "STORE_EVENT_SUBSCRIBE_TRIGGER_FAILED",
                                typeof e === "string"
                                    ? e
                                    : e instanceof Error
                                    ? e.message
                                    : MessageBundle.getText(
                                          "TRANSACTION_ERROR_RECORDING_UNKNOWN_ERROR",
                                          formatTransactionType(TransactionType.Subscribe),
                                      ),
                                listener.id,
                                listener.selector.selector,
                            ),
                            TransactionType.Subscribe,
                        );
                    }
                });
            }
        }
    }

    // ================================================================================================================
    // unused methods
    // ================================================================================================================

    getExternalRegister(instanceId: InstanceId): IExternalObjectRegister {
        return InvalidExternalRegister;
    }
    getState(instanceId: InstanceId) {
        return {};
    }
    getOriginState(instanceId: InstanceId) {
        return {};
    }
    getRecentChanges(): IDifferences {
        return {};
    }
    applyChanges(): void {}
    discardChanges(): void {}
    pushStateChange(
        storeType: string,
        instanceId: string,
        actionType: ActionType,
        newState: any,
        notRedoUndo: boolean,
    ): void {}
    validateActionInstance(action: IInstanceAction): void {}
}
