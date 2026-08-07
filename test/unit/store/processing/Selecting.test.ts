/** @format */

import { generateInstanceId } from "src/InstanceId";
import { SelectorFactor } from "src/store/SelectorFactor";
import { doSelecting, doSelectingWithState, doSelectingWithThrow } from "src/store/processing/Selecting";
import { IStoreState } from "src/store/storage/interface/StoreState";
import { IActionProvider, IInstanceAction } from "src/types/Action";
import { IExternalObjectRegister } from "src/types/ExternalObject";
import { InstanceId } from "src/types/InstanceId";
import { Missing } from "src/types/Model";
import { IInstanceSelector, ISelectorProviderBase } from "src/types/Selector";
import { IStoreExecution, IStoreManager } from "src/types/Store";
import { IDifferences } from "src/types/RedoUndoStack";
import { TransactionType } from "src/types/Transaction";

describe("aitianyu-cn.node-module.tianyu-store.store.processing.Selecting", () => {
    describe("doSelecting", () => {
        const externalManager: IExternalObjectRegister = {
            get: function <T = any>(key: string): T | undefined {
                throw new Error("Function not implemented.");
            },
            add: function (key: string, obj: any): void {
                throw new Error("Function not implemented.");
            },
            remove: function (key: string): void {
                throw new Error("Function not implemented.");
            },
        };

        const store: IStoreExecution = {
            getExternalRegister: function (instanceId: InstanceId): IExternalObjectRegister {
                return externalManager;
            },
            getState: function (instanceId: InstanceId) {
                return {
                    result: "defined",
                };
            },
            getOriginState: function (instanceId: InstanceId) {
                throw new Error("Function not implemented.");
            },
            getRecentChanges: function (): IDifferences {
                throw new Error("Function not implemented.");
            },
            applyChanges: function (): IDifferences {
                throw new Error("Function not implemented.");
            },
            discardChanges: function (): void {
                throw new Error("Function not implemented.");
            },
            pushStateChange: function (): void {
                throw new Error("Function not implemented.");
            },
            validateActionInstance: function (action: IInstanceAction<any>): void {
                throw new Error("Function not implemented.");
            },
            getHistories: function (): { histroy: IDifferences[]; index: number } {
                throw new Error("Function not implemented.");
            },
            pushDiffChange: function (diff: IDifferences): void {
                throw new Error("Function not implemented.");
            },
        };

        const storeManager: IStoreManager = {
            id: "test_store",
            getAction: function (id: string): IActionProvider<any, any, any> {
                throw new Error("Function not implemented.");
            },
            getSelector: function (id: string): ISelectorProviderBase<any, any> {
                return SelectorFactor.makeSelector(function (state: any) {
                    return state["result"] || "undefined";
                });
            },
            createEntity: function (instanceId: InstanceId, state: IStoreState): void {
                throw new Error("Function not implemented.");
            },
            destroyEntity: function (instanceId: InstanceId): void {
                throw new Error("Function not implemented.");
            },
            getEntity: function (entity: string): IStoreExecution {
                return store;
            },
            error: function (msg: string, type: TransactionType): void {
                //
            },
            select: function (selector: IInstanceSelector<any>): void {
                //
            },
        };

        it("get select result success", () => {
            const selectorInstance: IInstanceSelector<any> = {
                id: "",
                selector: "",
                storeType: "",
                instanceId: generateInstanceId("", ""),
                params: undefined,
            };
            const result = doSelecting(storeManager, selectorInstance, false);
            expect(result).toEqual("defined");
        });

        it("get select result failed", () => {
            const selectorInstance: IInstanceSelector<any> = {
                id: "",
                selector: "",
                storeType: "",
                instanceId: generateInstanceId("", ""),
                params: undefined,
            };
            jest.spyOn(store, "getState").mockImplementation(() => {
                throw new Error();
            });
            const result = doSelecting(storeManager, selectorInstance, false);
            expect(result instanceof Missing).toBeTruthy();
        });

        it("get parameter select result success", () => {
            const selectorInstance: IInstanceSelector<any> = {
                id: "",
                selector: "",
                storeType: "",
                instanceId: generateInstanceId("", ""),
                params: { result: "parameter" },
            };

            jest.spyOn(storeManager, "getSelector").mockReturnValue(
                SelectorFactor.makeParameterSelector(function (state: any, parameter: any) {
                    return parameter;
                }),
            );
            const result = doSelecting(storeManager, selectorInstance, false);
            expect(result).toEqual({ result: "parameter" });
        });

        it("get missing type if selector throw error", () => {
            const selectorInstance: IInstanceSelector<any> = {
                id: "",
                selector: "",
                storeType: "",
                instanceId: generateInstanceId("", ""),
                params: undefined,
            };

            jest.spyOn(storeManager, "getSelector").mockImplementation(() => {
                return SelectorFactor.makeSelector(function (_state: any) {
                    throw new Error();
                });
            });
            const result = doSelecting(storeManager, selectorInstance, false);
            expect(result instanceof Missing).toBeTruthy();
        });
    });
    describe("doSelectingWithThrow", () => {
        const externalManager: IExternalObjectRegister = {
            get: function <T = any>(key: string): T | undefined {
                throw new Error("Function not implemented.");
            },
            add: function (key: string, obj: any): void {
                throw new Error("Function not implemented.");
            },
            remove: function (key: string): void {
                throw new Error("Function not implemented.");
            },
        };

        const store: IStoreExecution = {
            getExternalRegister: function (instanceId: InstanceId): IExternalObjectRegister {
                return externalManager;
            },
            getState: function (instanceId: InstanceId) {
                return {
                    result: "defined",
                };
            },
            getOriginState: function (instanceId: InstanceId) {
                throw new Error("Function not implemented.");
            },
            getRecentChanges: function (): IDifferences {
                throw new Error("Function not implemented.");
            },
            applyChanges: function (): IDifferences {
                throw new Error("Function not implemented.");
            },
            discardChanges: function (): void {
                throw new Error("Function not implemented.");
            },
            pushStateChange: function (): void {
                throw new Error("Function not implemented.");
            },
            validateActionInstance: function (action: IInstanceAction<any>): void {
                throw new Error("Function not implemented.");
            },
            getHistories: function (): { histroy: IDifferences[]; index: number } {
                throw new Error("Function not implemented.");
            },
            pushDiffChange: function (diff: IDifferences): void {
                throw new Error("Function not implemented.");
            },
        };

        const storeManager: IStoreManager = {
            id: "test_store",
            getAction: function (id: string): IActionProvider<any, any, any> {
                throw new Error("Function not implemented.");
            },
            getSelector: function (id: string): ISelectorProviderBase<any, any> {
                return SelectorFactor.makeSelector(function (state: any) {
                    return state["result"] || "undefined";
                });
            },
            createEntity: function (instanceId: InstanceId, state: IStoreState): void {
                throw new Error("Function not implemented.");
            },
            destroyEntity: function (instanceId: InstanceId): void {
                throw new Error("Function not implemented.");
            },
            getEntity: function (entity: string): IStoreExecution {
                return store;
            },
            error: function (msg: string, type: TransactionType): void {
                //
            },
            select: function (selector: IInstanceSelector<any>): void {
                //
            },
        };

        it("get select result success", () => {
            const selectorInstance: IInstanceSelector<any> = {
                id: "",
                selector: "",
                storeType: "",
                instanceId: generateInstanceId("", ""),
                params: undefined,
            };
            const result = doSelectingWithThrow(storeManager, selectorInstance, false);
            expect(result).toEqual("defined");
        });

        it("get select result failed", () => {
            const selectorInstance: IInstanceSelector<any> = {
                id: "",
                selector: "",
                storeType: "",
                instanceId: generateInstanceId("", ""),
                params: undefined,
            };
            jest.spyOn(store, "getState").mockImplementation(() => {
                throw new Error();
            });
            expect(() => {
                doSelectingWithThrow(storeManager, selectorInstance, false);
            }).toThrow();
        });

        it("get parameter select result success", () => {
            const selectorInstance: IInstanceSelector<any> = {
                id: "",
                selector: "",
                storeType: "",
                instanceId: generateInstanceId("", ""),
                params: { result: "parameter" },
            };

            jest.spyOn(storeManager, "getSelector").mockReturnValue(
                SelectorFactor.makeParameterSelector(function (state: any, parameter: any) {
                    return parameter;
                }),
            );
            const result = doSelectingWithThrow(storeManager, selectorInstance, false);
            expect(result).toEqual({ result: "parameter" });
        });

        it("to throw if selector throw error", () => {
            const selectorInstance: IInstanceSelector<any> = {
                id: "",
                selector: "",
                storeType: "",
                instanceId: generateInstanceId("", ""),
                params: undefined,
            };

            jest.spyOn(storeManager, "getSelector").mockImplementation(() => {
                return SelectorFactor.makeSelector(function (_state: any) {
                    throw new Error();
                });
            });
            expect(() => {
                doSelectingWithThrow(storeManager, selectorInstance, false);
            }).toThrow();
        });
    });

    describe("doSelectingWithState", () => {
        const externalManager: IExternalObjectRegister = {
            get: function <T = any>(key: string): T | undefined {
                throw new Error("Function not implemented.");
            },
            add: function (key: string, obj: any): void {
                throw new Error("Function not implemented.");
            },
            remove: function (key: string): void {
                throw new Error("Function not implemented.");
            },
        };

        const store: IStoreExecution = {
            getExternalRegister: function (instanceId: InstanceId): IExternalObjectRegister {
                return externalManager;
            },
            getState: function (instanceId: InstanceId) {
                return {
                    result: "defined",
                };
            },
            getOriginState: function (instanceId: InstanceId) {
                throw new Error("Function not implemented.");
            },
            getRecentChanges: function (): IDifferences {
                throw new Error("Function not implemented.");
            },
            applyChanges: function (): IDifferences {
                throw new Error("Function not implemented.");
            },
            discardChanges: function (): void {
                throw new Error("Function not implemented.");
            },
            pushStateChange: function (): void {
                throw new Error("Function not implemented.");
            },
            validateActionInstance: function (action: IInstanceAction<any>): void {
                throw new Error("Function not implemented.");
            },
            getHistories: function (): { histroy: IDifferences[]; index: number } {
                throw new Error("Function not implemented.");
            },
            pushDiffChange: function (diff: IDifferences): void {
                throw new Error("Function not implemented.");
            },
        };

        const storeManager: IStoreManager = {
            id: "test_store",
            getAction: function (id: string): IActionProvider<any, any, any> {
                throw new Error("Function not implemented.");
            },
            getSelector: function (id: string): ISelectorProviderBase<any, any> {
                return SelectorFactor.makeSelector(function (state: any) {
                    return state["result"] || "undefined";
                });
            },
            createEntity: function (instanceId: InstanceId, state: IStoreState): void {
                throw new Error("Function not implemented.");
            },
            destroyEntity: function (instanceId: InstanceId): void {
                throw new Error("Function not implemented.");
            },
            getEntity: function (entity: string): IStoreExecution {
                return store;
            },
            error: function (msg: string, type: TransactionType): void {
                //
            },
            select: function (selector: IInstanceSelector<any>): void {
                //
            },
        };

        it("get select result success", () => {
            const selectorInstance: IInstanceSelector<any> = {
                id: "",
                selector: "",
                storeType: "",
                instanceId: generateInstanceId("", ""),
                params: undefined,
            };
            const result = doSelectingWithState(
                {
                    result: "defined",
                },
                store,
                storeManager,
                selectorInstance,
            );
            expect(result).toEqual("defined");
        });

        it("get parameter select result success", () => {
            const selectorInstance: IInstanceSelector<any> = {
                id: "",
                selector: "",
                storeType: "",
                instanceId: generateInstanceId("", ""),
                params: { result: "parameter" },
            };

            jest.spyOn(storeManager, "getSelector").mockReturnValue(
                SelectorFactor.makeParameterSelector(function (state: any, parameter: any) {
                    return parameter;
                }),
            );
            const result = doSelectingWithState(
                {
                    result: "defined",
                },
                store,
                storeManager,
                selectorInstance,
            );
            expect(result).toEqual({ result: "parameter" });
        });

        it("get missing type if selector throw error", () => {
            const selectorInstance: IInstanceSelector<any> = {
                id: "",
                selector: "",
                storeType: "",
                instanceId: generateInstanceId("", ""),
                params: undefined,
            };

            jest.spyOn(storeManager, "getSelector").mockImplementation(() => {
                return SelectorFactor.makeSelector(function (_state: any) {
                    throw new Error();
                });
            });
            const result = doSelectingWithState(
                {
                    result: "defined",
                },
                store,
                storeManager,
                selectorInstance,
            );
            expect(result instanceof Missing).toBeTruthy();
        });
    });
});
