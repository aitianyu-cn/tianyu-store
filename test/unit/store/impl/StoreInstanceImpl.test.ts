/** @format */

import { ObjectHelper, guid } from "@aitianyu.cn/types";
import { generateInstanceId } from "src/InstanceId";
import { generateNewStoreInstance } from "src/Store";
import { MessageBundle } from "src/infra/Message";
import { StoreInstanceImpl } from "src/store/impl/StoreInstanceImpl";
import { STORE_STATE_EXTERNAL_REDOUNDO_STACK } from "src/store/storage/interface/RedoUndoStack";
import { IStoreState, STORE_STATE_INSTANCE, STORE_STATE_SYSTEM } from "src/store/storage/interface/StoreState";
import { ActionType, IInstanceAction } from "src/types/Action";
import { IExternalObjectRegister } from "src/types/ExternalObject";
import { DifferenceChangeType } from "src/types/RedoUndoStack";

describe("aitianyu-cn.node-module.tianyu-store.store.impl.StoreInstanceImpl", () => {
    const basicInstanceId = generateNewStoreInstance();
    const defaultInstance = generateInstanceId(basicInstanceId, "test", "test_instance");

    const storeState: IStoreState = {
        [STORE_STATE_SYSTEM]: {
            config: { redoUndo: true },
            instanceMap: {
                parentMap: {},
                childrenMap: {},
            },
        },
        [STORE_STATE_INSTANCE]: {
            test: {
                [defaultInstance.toString()]: {
                    test: true,
                },
            },
        },
    };
    const freezState = Object.freeze(ObjectHelper.clone(storeState));
    const storeInstance = new StoreInstanceImpl(storeState, basicInstanceId);

    ((storeInstance as any).externalObjectMap as Map<string, IExternalObjectRegister>).set(defaultInstance.toString(), {
        get: function <T = any>(key: string): T | undefined {
            throw new Error("Function not implemented.");
        },
        add: function (key: string, obj: any): void {
            throw new Error("Function not implemented.");
        },
        remove: function (key: string): void {
            throw new Error("Function not implemented.");
        },
    });

    it("addStoreType", () => {
        expect(storeState[STORE_STATE_INSTANCE]["test-type"]).toBeUndefined();
        storeInstance.addStoreType("test-type");
        expect(storeState[STORE_STATE_INSTANCE]["test-type"]).toBeDefined();
    });

    it("validateActionInstance", () => {
        expect(() => {
            storeInstance.validateActionInstance({
                id: "",
                action: "",
                storeType: "",
                instanceId: basicInstanceId,
                params: undefined,
                actionType: ActionType.ACTION,
            });
        }).not.toThrow();
    });

    describe("getExternalRegister", () => {
        it("get unexist external register should throw error", () => {
            expect(() => {
                const instance = generateInstanceId(basicInstanceId, "test", "test_instance2");
                storeInstance.getExternalRegister(instance);
            }).toThrow();
        });

        it("get exist external register", () => {
            expect(() => {
                const register = storeInstance.getExternalRegister(defaultInstance);
                expect(register).toBeDefined();
            }).not.toThrow();
        });
    });

    describe("getState", () => {
        it("get store state", () => {
            const state = storeInstance.getState(basicInstanceId);
            expect(state).toEqual(storeState);
        });

        it("instance does not have store type", () => {
            const instanceId = generateInstanceId(basicInstanceId, "", "");
            expect(() => {
                storeInstance.getState(instanceId);
            }).toThrow(MessageBundle.getText("INSTANCE_ID_NOT_VALID", instanceId.toString()));
        });

        it("get from cache and instance is deleted", () => {
            const instanceId = generateInstanceId(basicInstanceId, "test", "instance");
            (storeInstance as any).changeCache["test"] = {
                [instanceId.toString()]: {
                    state: undefined,
                    type: DifferenceChangeType.Delete,
                    redoUndo: false,
                    record: false,
                },
            };
            expect(() => {
                storeInstance.getState(instanceId);
            }).toThrow(MessageBundle.getText("STORE_INSTANCE_USE_DELETED", "test", instanceId.toString()));

            storeInstance.discardChanges();
        });

        it("get from cache and instance is valid", () => {
            const instanceId = generateInstanceId(basicInstanceId, "test", "instance");
            const newState = {
                test: "test",
            };
            (storeInstance as any).changeCache["test"] = {
                [instanceId.toString()]: {
                    state: newState,
                    type: DifferenceChangeType.Change,
                    redoUndo: false,
                    record: false,
                },
            };
            const state = storeInstance.getState(instanceId);
            expect(state).toEqual(newState);

            storeInstance.discardChanges();
        });

        it("get from state failed", () => {
            const instanceId = generateInstanceId(basicInstanceId, "test", "instance");
            expect(() => {
                storeInstance.getState(instanceId);
            }).toThrow(MessageBundle.getText("STORE_INSTANCE_NOT_EXIST", instanceId.toString()));
        });

        it("get from state success", () => {
            const state = storeInstance.getState(defaultInstance);
            expect(state.test).toBeTruthy();
        });
    });

    describe("getOriginState", () => {
        it("get store state", () => {
            const state = storeInstance.getOriginState(basicInstanceId);
            expect(state).toEqual(storeState);
        });

        it("instance does not have store type", () => {
            const instanceId = generateInstanceId(basicInstanceId, "", "");
            expect(() => {
                storeInstance.getOriginState(instanceId);
            }).toThrow(MessageBundle.getText("INSTANCE_ID_NOT_VALID", instanceId.toString()));
        });

        it("get from state failed", () => {
            const instanceId = generateInstanceId(basicInstanceId, "test", "instance");
            expect(() => {
                storeInstance.getOriginState(instanceId);
            }).toThrow(MessageBundle.getText("STORE_INSTANCE_NOT_EXIST", instanceId.toString()));
        });

        it("get from state success", () => {
            const state = storeInstance.getOriginState(defaultInstance);
            expect(state.test).toBeTruthy();
        });
    });

    describe("pushStateChange", () => {
        beforeEach(() => {
            storeInstance.discardChanges();
        });

        it("push change", () => {
            const instanceId = generateInstanceId(basicInstanceId, "test", guid());
            const action: IInstanceAction<any> = {
                id: "",
                action: "",
                storeType: "test",
                instanceId: instanceId,
                params: undefined,
                actionType: ActionType.ACTION,
            };

            storeInstance.pushStateChange(
                action.storeType,
                action.instanceId.toString(),
                action.actionType,
                { change: true },
                false,
            );
            const changeState = (storeInstance as any).changeCache["test"][instanceId.toString()];

            expect(changeState).toBeDefined();
            expect(changeState.state).toEqual({ change: true });
            expect(changeState.type).toBe(DifferenceChangeType.Change);
            expect(changeState.redoUndo).toBeTruthy();
            expect(changeState.record).toBeTruthy();

            expect(((storeInstance as any).externalObjectMap as Map<any, any>).size).toBe(2);
        });

        it("push delete", () => {
            const instanceId = generateInstanceId(basicInstanceId, "test", guid());
            const action: IInstanceAction<any> = {
                id: "",
                action: "",
                storeType: "test",
                instanceId: instanceId,
                params: undefined,
                actionType: ActionType.DESTROY,
            };

            storeInstance.pushStateChange(
                action.storeType,
                action.instanceId.toString(),
                action.actionType,
                undefined,
                false,
            );
            const changeState = (storeInstance as any).changeCache["test"][instanceId.toString()];

            expect(changeState).toBeDefined();
            expect(changeState.type).toBe(DifferenceChangeType.Delete);
            expect(changeState.redoUndo).toBeTruthy();
            expect(changeState.record).toBeTruthy();

            expect(((storeInstance as any).externalObjectMap as Map<any, any>).size).toBe(2);
        });

        it("push create", () => {
            const instanceId = generateInstanceId(basicInstanceId, "test", guid());
            const action: IInstanceAction<any> = {
                id: "",
                action: "",
                storeType: "test",
                instanceId: instanceId,
                params: undefined,
                actionType: ActionType.CREATE,
            };

            storeInstance.pushStateChange(
                action.storeType,
                action.instanceId.toString(),
                action.actionType,
                undefined,
                false,
            );
            const changeState = (storeInstance as any).changeCache["test"][instanceId.toString()];

            expect(changeState).toBeDefined();
            expect(changeState.type).toBe(DifferenceChangeType.Create);
            expect(changeState.redoUndo).toBeTruthy();
            expect(changeState.record).toBeTruthy();

            expect(((storeInstance as any).externalObjectMap as Map<any, any>).size).toBe(3);
            expect(
                ((storeInstance as any).externalObjectMap as Map<any, any>).get(instanceId.toString()),
            ).toBeDefined();
        });

        it("push change with not redo undo", () => {
            const instanceId = generateInstanceId(basicInstanceId, "test", guid());
            const action: IInstanceAction<any> = {
                id: "",
                action: "",
                storeType: "test",
                instanceId: instanceId,
                params: undefined,
                actionType: ActionType.ACTION,
            };

            storeInstance.pushStateChange(
                action.storeType,
                action.instanceId.toString(),
                action.actionType,
                { change: true },
                true,
            );
            const changeState = (storeInstance as any).changeCache["test"][instanceId.toString()];

            expect(changeState).toBeDefined();
            expect(changeState.redoUndo).toBeFalsy();
            expect(changeState.record).toBeTruthy();
        });

        it("push change with view action", () => {
            const instanceId = generateInstanceId(basicInstanceId, "test", guid());
            const action: IInstanceAction<any> = {
                id: "",
                action: "",
                storeType: "test",
                instanceId: instanceId,
                params: undefined,
                actionType: ActionType.VIEW_ACTION,
            };

            storeInstance.pushStateChange(
                action.storeType,
                action.instanceId.toString(),
                action.actionType,
                { change: true },
                false,
            );
            const changeState = (storeInstance as any).changeCache["test"][instanceId.toString()];

            expect(changeState).toBeDefined();
            expect(changeState.redoUndo).toBeFalsy();
            expect(changeState.record).toBeTruthy();
        });

        it("push change with redo", () => {
            const instanceId = generateInstanceId(basicInstanceId, "test", guid());
            const action: IInstanceAction<any> = {
                id: "",
                action: "",
                storeType: "test",
                instanceId: instanceId,
                params: undefined,
                actionType: ActionType.REDO,
            };

            storeInstance.pushStateChange(
                action.storeType,
                action.instanceId.toString(),
                action.actionType,
                { change: true },
                false,
            );
            const changeState = (storeInstance as any).changeCache["test"][instanceId.toString()];

            expect(changeState).toBeDefined();
            expect(changeState.record).toBeFalsy();
        });

        it("push change with undo", () => {
            const instanceId = generateInstanceId(basicInstanceId, "test", guid());
            const action: IInstanceAction<any> = {
                id: "",
                action: "",
                storeType: "test",
                instanceId: instanceId,
                params: undefined,
                actionType: ActionType.UNDO,
            };

            storeInstance.pushStateChange(
                action.storeType,
                action.instanceId.toString(),
                action.actionType,
                { change: true },
                false,
            );
            const changeState = (storeInstance as any).changeCache["test"][instanceId.toString()];

            expect(changeState).toBeDefined();
            expect(changeState.record).toBeFalsy();
        });
    });

    describe("applyChanges", () => {
        const redoUndoStack = storeInstance
            .getExternalRegister(basicInstanceId)
            .get(STORE_STATE_EXTERNAL_REDOUNDO_STACK);

        beforeEach(() => {
            storeState[STORE_STATE_INSTANCE] = ObjectHelper.clone(freezState[STORE_STATE_INSTANCE]);
            storeInstance.discardChanges();

            expect(redoUndoStack).toBeDefined();
            jest.spyOn(redoUndoStack, "record");
            jest.spyOn(redoUndoStack, "resetRedoUndo");

            redoUndoStack.previous = [];
            redoUndoStack.current = undefined;
            redoUndoStack.future = [];
        });

        it("apply changes with changed", () => {
            const action: IInstanceAction<any> = {
                id: "",
                action: "",
                storeType: "test",
                instanceId: defaultInstance,
                params: undefined,
                actionType: ActionType.ACTION,
            };

            storeInstance.pushStateChange(
                action.storeType,
                action.instanceId.toString(),
                action.actionType,
                { change: true },
                false,
            );

            storeInstance.applyChanges();
            expect(storeInstance.getState(defaultInstance).change).toBeTruthy();
            expect(redoUndoStack.record).toHaveBeenCalled();
        });

        it("apply changes with changed - not redo undo", () => {
            const action: IInstanceAction<any> = {
                id: "",
                action: "",
                storeType: "test",
                instanceId: defaultInstance,
                params: undefined,
                actionType: ActionType.VIEW_ACTION,
            };

            storeInstance.pushStateChange(
                action.storeType,
                action.instanceId.toString(),
                action.actionType,
                { change: true },
                false,
            );

            storeInstance.applyChanges();
            expect(storeInstance.getState(defaultInstance).change).toBeTruthy();
            expect(redoUndoStack.resetRedoUndo).toHaveBeenCalled();
        });
    });

    describe("getRecentChanges", () => {
        const redoUndoStack = storeInstance
            .getExternalRegister(basicInstanceId)
            .get(STORE_STATE_EXTERNAL_REDOUNDO_STACK);

        it("has recent changes", () => {
            jest.spyOn(redoUndoStack, "getCurrent").mockReturnValue({
                test: true,
            });
            expect(storeInstance.getRecentChanges()).toEqual({
                test: true,
            });
        });

        it("not have recent changes", () => {
            jest.spyOn(redoUndoStack, "getCurrent").mockReturnValue(undefined);
            expect(storeInstance.getRecentChanges()).toEqual({});
        });
    });

    describe("getHistories", () => {
        it("-", () => {
            const redoUndoStack = storeInstance
                .getExternalRegister(basicInstanceId)
                .get(STORE_STATE_EXTERNAL_REDOUNDO_STACK);
            expect(redoUndoStack).toBeDefined();

            jest.spyOn(redoUndoStack, "getHistroies").mockReturnValue({ history: [], index: -1 });
            storeInstance.getHistories();
            expect(redoUndoStack.getHistroies).toHaveBeenCalled();
        });
    });

    describe("getRawState", () => {
        it("-", () => {
            const rawState = storeInstance.getRawState();
            expect(rawState).toEqual(storeInstance["storeState"]);
        });
    });
});
