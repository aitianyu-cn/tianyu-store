/** @format */

import { ITianyuStoreInterface } from "src/types/Interface";
import { IStoreInstanceCreatorConfig, IStoreInstanceSystemState } from "src/types/Store";
import { ActionFactor } from "./ActionFactor";
import { IStoreState, STORE_STATE_INSTANCE, STORE_STATE_SYSTEM } from "./storage/interface/StoreState";
import { GetChildInstances, GetInstanceExist, GetParentInstance } from "./storage/StoreEntitySelector";
import { CreateInstanceIfNotExist, DestroyInstanceIfExist } from "./storage/StoreEntityAction";
import { ConvertAnyToBoolean } from "./storage/UtilsSelectorImpl";

const DefaultInstanceCreationConfig: IStoreInstanceSystemState = {
    config: {
        redoUndo: true,
    },
    instanceMap: {
        parentMap: {},
        childrenMap: {},
    },
};

const CreateActionCreator = ActionFactor.makeCreateStoreAction<IStoreState, IStoreInstanceCreatorConfig | undefined>();
const DestroyActionCreator = ActionFactor.makeDestroyStoreAction();

const CreateAction = CreateActionCreator.withReducer(function (
    _state: IStoreState,
    data: IStoreInstanceCreatorConfig | undefined,
): IStoreState {
    const state = {
        [STORE_STATE_SYSTEM]: DefaultInstanceCreationConfig,
        [STORE_STATE_INSTANCE]: {},
    };
    state[STORE_STATE_SYSTEM].config.redoUndo =
        /* istanbul ignore next */
        data?.redoUndo === undefined ? state[STORE_STATE_SYSTEM].config.redoUndo : data.redoUndo;

    return state;
});

const DestroyAction = DestroyActionCreator;

export const TianyuStoreEntityInterface = {
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
        toBoolean: ConvertAnyToBoolean,
    },
};

TianyuStoreEntityInterface as ITianyuStoreInterface<IStoreState>;
