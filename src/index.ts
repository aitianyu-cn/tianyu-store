/**@format */

/** Types Part */
export * from "./types/Action";
export * from "./types/ActionHandler";
export * from "./types/ExternalObject";
export * from "./types/InstanceId";
export * from "./types/Interface";
export * from "./types/Listener";
export * from "./types/MixSelector";
export * from "./types/Model";
export * from "./types/RedoUndoStack";
export * from "./types/Reducer";
export * from "./types/Selector";
export {
    type StoreConfiguration,
    type IStoreInstanceSystemState as IStoreInstanceCreateConfig,
    type IStore,
    type IStoreDevAPI,
} from "./types/Store";
export * from "./types/StoreHandler";
export * from "./types/Subscribe";
export {
    TransactionType,
    type TransactionErrorRecord,
    type TransactionOperationRecord,
    type ITransaction,
} from "./types/Transaction";
export * from "./types/Utils";
export * as Devtools from "./develop/Interface";

/** Public Part */
export { ActionFactor } from "./store/ActionFactor";
export { ListenerFactor } from "./store/ListenerFactor";
export { SelectorFactor } from "./store/SelectorFactor";

/** Store Part */
import { TianyuStoreEntityExpose, TianyuStoreRedoUndoExpose } from "./InterfacesExpose";

export const TIANYU_STORE_ENTITY_CORE = "tianyu-store-entity-core";
export const TIANYU_STORE_ENTITY_REDOUNDO = "tianyu-store-entity-redoundo";
export const TianyuStoreEntityInterfaceExpose = {
    [TIANYU_STORE_ENTITY_CORE]: TianyuStoreEntityExpose,
    [TIANYU_STORE_ENTITY_REDOUNDO]: TianyuStoreRedoUndoExpose,
};

export { createStore } from "./Store";

/** Helper Part */

import * as InstanceIdImport from "./InstanceId";
import * as StoreImport from "./Store";

export namespace StoreHelper {
    export import generateInstanceId = InstanceIdImport.generateInstanceId;
    export import generateStoreInstanceId = StoreImport.generateNewStoreInstance;
    export import newInstanceId = InstanceIdImport.newInstanceId;
}

/** Utils Part */

import * as GetNewStateImport from "./utils/state-helper/GetNewState";
import * as GetNewStateBatchImport from "./utils/state-helper/GetNewStateBatch";
import * as MergeStateImport from "./utils/state-helper/MergeState";

import * as ObjectUtilsImport from "./utils/ObjectUtils";

import * as InterfaceUtilsImport from "./utils/InterfaceUtils";
import * as BatchActionUtilsImport from "./utils/BatchActionUtils";

import * as HandlerUtilsImport from "./utils/StoreHandlerUtils";

export namespace StoreUtils {
    export namespace State {
        export import getNewState = GetNewStateImport.getNewState;
        export import getNewStateBatch = GetNewStateBatchImport.getNewStateBatch;
        export import mergeState = MergeStateImport.mergeState;
    }

    export namespace Helper {
        export import parseJsonString = ObjectUtilsImport.parseJsonString;
    }

    export namespace Handler {
        export import doAction = HandlerUtilsImport.doAction;
        export import doSelector = HandlerUtilsImport.doSelector;
        export import doSelectorWithThrow = HandlerUtilsImport.doSelectorWithThrow;
        export import doReadExternal = HandlerUtilsImport.doReadExternal;
    }

    export import registerExpose = InterfaceUtilsImport.registerExpose;
    export import registerTemplate = InterfaceUtilsImport.registerTemplate;
    export import createBatchAction = BatchActionUtilsImport.createBatchAction;
}
