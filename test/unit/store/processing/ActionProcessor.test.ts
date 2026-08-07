/** @format */

import { generateInstanceId } from "src/InstanceId";
import { generateNewStoreInstance } from "src/Store";
import { ActionProcessorMap } from "src/store/processing/ActionProcessor";
import { IStoreState } from "src/store/storage/interface/StoreState";
import { ActionType, IActionProvider, IInstanceAction } from "src/types/Action";
import { TIANYU_STORE_INSTANCE_BASE_ENTITY_STORE_TYPE } from "src/types/Defs";
import { IExternalObjectRegister } from "src/types/ExternalObject";
import { InstanceId } from "src/types/InstanceId";
import { IDifferences } from "src/types/RedoUndoStack";
import { IInstanceSelector, ISelectorProviderBase } from "src/types/Selector";
import { IStoreExecution, IStoreManager } from "src/types/Store";
import { TransactionType } from "src/types/Transaction";

describe("aitianyu-cn.node-module.tianyu-store.store.processing.ActionProcessor", () => {
    const StoreExecutor: IStoreExecution = {
        getExternalRegister: function (instanceId: InstanceId, creating?: boolean): IExternalObjectRegister {
            throw new Error("Function not implemented.");
        },
        getState: function (instanceId: InstanceId, creating?: boolean) {
            throw new Error("Function not implemented.");
        },
        getOriginState: function (instanceId: InstanceId) {
            throw new Error("Function not implemented.");
        },
        getRecentChanges: function (): IDifferences {
            throw new Error("Function not implemented.");
        },
        getHistories: function (): { histroy: IDifferences[]; index: number } {
            throw new Error("Function not implemented.");
        },
        applyChanges: function (): IDifferences {
            throw new Error("Function not implemented.");
        },
        discardChanges: function (): void {
            throw new Error("Function not implemented.");
        },
        pushStateChange: function (
            storeType: string,
            instanceId: string,
            actionType: ActionType,
            newState: any,
            notRedoUndo: boolean,
        ): void {
            throw new Error("Function not implemented.");
        },
        pushDiffChange: function (diff: IDifferences): void {
            throw new Error("Function not implemented.");
        },
        validateActionInstance: function (action: IInstanceAction<any>): void {
            throw new Error("Function not implemented.");
        },
    };
    const StoreManager: IStoreManager = {
        id: "",
        getAction: function (id: string): IActionProvider<any, any, any> {
            throw new Error("Function not implemented.");
        },
        getSelector: function (id: string): ISelectorProviderBase<any, any> {
            throw new Error("Function not implemented.");
        },
        createEntity: function (instanceId: InstanceId, state: IStoreState): void {
            throw new Error("Function not implemented.");
        },
        destroyEntity: function (instanceId: InstanceId): void {
            throw new Error("Function not implemented.");
        },
        getEntity: function (entity: string): IStoreExecution {
            return StoreExecutor;
        },
        error: function (msg: string, type: TransactionType): void {
            throw new Error("Function not implemented.");
        },
        select: function (selector: IInstanceSelector<any>): void {
            throw new Error("Function not implemented.");
        },
    };

    describe("ActionType.CREATE", () => {
        it("create entity", () => {
            jest.spyOn(StoreManager, "createEntity").mockImplementation(() => undefined);

            const ins = generateNewStoreInstance();
            ActionProcessorMap[ActionType.CREATE](
                StoreExecutor,
                StoreManager,
                {
                    id: "",
                    action: "",
                    storeType: TIANYU_STORE_INSTANCE_BASE_ENTITY_STORE_TYPE,
                    instanceId: ins,
                    params: undefined,
                    actionType: ActionType.CREATE,
                },
                {},
                false,
            );

            expect(StoreManager.createEntity).toHaveBeenCalled();
        });

        it("create normal state", () => {
            jest.spyOn(StoreExecutor, "pushStateChange").mockImplementation(() => undefined);

            const root = generateNewStoreInstance();
            const ins = generateInstanceId(root, "user", "1");
            const action: IInstanceAction<any> = {
                id: "",
                action: "",
                storeType: "user",
                instanceId: ins,
                params: undefined,
                actionType: ActionType.CREATE,
            };
            const state = {
                time: 0,
            };
            ActionProcessorMap[ActionType.CREATE](StoreExecutor, StoreManager, action, state, false);

            expect(StoreExecutor.pushStateChange).toHaveBeenCalledWith(
                action.storeType,
                action.instanceId.toString(),
                action.actionType,
                state,
                false,
            );
        });

        it("create normal state with undefined inital state", () => {
            jest.spyOn(StoreExecutor, "pushStateChange").mockImplementation(() => undefined);

            const root = generateNewStoreInstance();
            const ins = generateInstanceId(root, "user", "1");
            const action: IInstanceAction<any> = {
                id: "",
                action: "",
                storeType: "user",
                instanceId: ins,
                params: undefined,
                actionType: ActionType.CREATE,
            };
            ActionProcessorMap[ActionType.CREATE](StoreExecutor, StoreManager, action, undefined, false);

            expect(StoreExecutor.pushStateChange).toHaveBeenCalledWith(
                action.storeType,
                action.instanceId.toString(),
                action.actionType,
                {},
                false,
            );
        });
    });

    describe("ActionType.DESTROY", () => {
        it("destroy entity", () => {
            jest.spyOn(StoreManager, "destroyEntity").mockImplementation(() => undefined);

            const ins = generateNewStoreInstance();
            ActionProcessorMap[ActionType.DESTROY](
                StoreExecutor,
                StoreManager,
                {
                    id: "",
                    action: "",
                    storeType: TIANYU_STORE_INSTANCE_BASE_ENTITY_STORE_TYPE,
                    instanceId: ins,
                    params: undefined,
                    actionType: ActionType.DESTROY,
                },
                {},
                false,
            );

            expect(StoreManager.destroyEntity).toHaveBeenCalled();
        });

        it("destroy normal state", () => {
            jest.spyOn(StoreExecutor, "pushStateChange").mockImplementation(() => undefined);

            const root = generateNewStoreInstance();
            const ins = generateInstanceId(root, "user", "1");
            const action: IInstanceAction<any> = {
                id: "",
                action: "",
                storeType: "user",
                instanceId: ins,
                params: undefined,
                actionType: ActionType.DESTROY,
            };
            ActionProcessorMap[ActionType.DESTROY](StoreExecutor, StoreManager, action, undefined, false);
            expect(StoreExecutor.pushStateChange).toHaveBeenCalled();
        });
    });
});
