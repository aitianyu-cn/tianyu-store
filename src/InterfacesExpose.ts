/**@format */

import { registerExpose } from "./utils/InterfaceUtils";
import { TIANYU_STORE_INSTANCE_BASE_ENTITY_STORE_TYPE } from "./types/Defs";
import { storeRedoActionCreatorImpl, storeUndoActionCreatorImpl } from "./store/storage/RedoUndoActionImpl";
import { IStoreState } from "./store/storage/interface/StoreState";
import { SelectorFactor } from "./store/SelectorFactor";
import { IStoreInstanceCreatorConfig } from "./types/Store";
import { ActionFactor } from "./store/ActionFactor";
import { ITianyuStoreInterface } from "./types/Interface";
import { InstanceId } from "./types/InstanceId";

const CreateAction = ActionFactor.makeCreateStoreAction<IStoreState, IStoreInstanceCreatorConfig | void>();
const DestroyAction = ActionFactor.makeDestroyStoreAction();

const CleanStackAction = ActionFactor.makeVirtualAction();
const CreateInstanceIfNotExist = ActionFactor.makeVirtualAction<IStoreState, any>();
const DestroyInstanceIfExist = ActionFactor.makeVirtualAction<IStoreState, void>();

const GetRedoAvailable = SelectorFactor.makeVirtualSelector<IStoreState, boolean>();
const GetUndoAvailable = SelectorFactor.makeVirtualSelector<IStoreState, boolean>();
const GetRedoUndoEnabledSelector = SelectorFactor.makeVirtualSelector<IStoreState, boolean>();

const GetInstanceExist = SelectorFactor.makeVirtualParameterSelector<IStoreState, InstanceId, boolean>();
const GetParentInstance = SelectorFactor.makeVirtualParameterSelector<IStoreState, InstanceId, InstanceId | null>();
const GetChildInstances = SelectorFactor.makeVirtualParameterSelector<IStoreState, InstanceId, InstanceId[]>();

/**
 * Tianyu Store default operator
 */
export const TianyuStoreEntityExpose = {
    core: {
        /** To create a new store entity */
        creator: CreateAction,
        /** To delete a exist store entity */
        destroy: DestroyAction,
    },
    action: {
        /** To create a new instance if the instance does not exist */
        createInstanceIfNotExist: CreateInstanceIfNotExist,
        /** To delete a instance if the instance does exist */
        destroyInstanceIfExist: DestroyInstanceIfExist,
    },
    selector: {
        /** Get the specified instance does exist */
        getInstanceExist: GetInstanceExist,

        instance: {
            /** Get the parent of specified instance */
            parent: GetParentInstance,
            /** Get all children of specified instance */
            children: GetChildInstances,
        },
    },

    utils: {
        toBoolean: SelectorFactor.makeVirtualConstantSelector<boolean, any>(),
    },
};

export const TianyuStoreRedoUndoExpose = {
    stack: {
        redoAction: storeRedoActionCreatorImpl(),
        undoAction: storeUndoActionCreatorImpl(),

        /** Get current redo action is valid */
        getRedoAvailable: GetRedoAvailable,
        /** Get current undo action is valid */
        getUndoAvailable: GetUndoAvailable,
        /** Get redo/undo operation is enabled in current store entity */
        getRedoUndoEnabled: GetRedoUndoEnabledSelector,

        /** Clean all redo/undo stack in current store entity */
        cleanStackAction: CleanStackAction,
    },
};

// to ensure the entity type
TianyuStoreEntityExpose as ITianyuStoreInterface<IStoreState>;

registerExpose(TianyuStoreEntityExpose, TIANYU_STORE_INSTANCE_BASE_ENTITY_STORE_TYPE);
registerExpose(TianyuStoreRedoUndoExpose, TIANYU_STORE_INSTANCE_BASE_ENTITY_STORE_TYPE);
