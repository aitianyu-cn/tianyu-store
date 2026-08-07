/** @format */

import { guid } from "@aitianyu.cn/types";
import { IDifferences, DifferenceChangeType } from "src/types/RedoUndoStack";
import { MessageBundle } from "src/infra/Message";
import { generateInstanceId } from "src/InstanceId";
import { createStore, generateNewStoreInstance } from "src/Store";
import { StoreImpl } from "src/store/impl/StoreImpl";
import { StoreInstanceImpl } from "src/store/impl/StoreInstanceImpl";
import { formatTransactionType } from "src/store/modules/Transaction";
import { SelectorFactor } from "src/store/SelectorFactor";
import { STORE_STATE_SYSTEM, STORE_STATE_INSTANCE } from "src/store/storage/interface/StoreState";
import { ActionType, IInstanceAction, IInstanceViewAction } from "src/types/Action";
import { TIANYU_STORE_INSTANCE_BASE_ENTITY_STORE_TYPE } from "src/types/Defs";
import { InstanceId } from "src/types/InstanceId";
import { ITianyuStoreInterfaceMap } from "src/types/Interface";
import { IInstanceListener } from "src/types/Listener";
import { Missing } from "src/types/Model";
import { ITransaction, TransactionType } from "src/types/Transaction";
import { createBatchAction } from "src/utils/BatchActionUtils";
import { TestUserStateInterface } from "test/unit/content/DispatchingTestContent";

describe("aitianyu-cn.node-module.tianyu-store.store.impl.StoreImpl", () => {
    const store = createStore({
        waitForAll: true,
    });
    const storeInternal = store as StoreImpl;
    const baseInstanceId = generateNewStoreInstance();
    const instancesPool: InstanceId[] = [];

    beforeAll(() => {
        expect(Object.keys((store as any).operationList).length > 0).toBeTruthy();

        // create entity normal case
        storeInternal.createEntity(baseInstanceId, {
            [STORE_STATE_SYSTEM]: {
                config: { redoUndo: true },
                instanceMap: {
                    parentMap: {},
                    childrenMap: {},
                },
            },
            [STORE_STATE_INSTANCE]: {},
        });
        expect(
            ((store as any).entityMap as Map<any, any>).get(baseInstanceId.entity) instanceof StoreInstanceImpl,
        ).toBeTruthy();
        expect(((store as any).instanceListener as Map<any, any>).get(baseInstanceId.entity)).toBeDefined();
        expect(((store as any).instanceSubscribe as Map<any, any>).get(baseInstanceId.entity)).toBeDefined();

        store.registerInterface("test", TestUserStateInterface);
        expect((store as any).storyTypes.includes("test")).toBeTruthy();
    });

    afterAll(() => {
        store.destroy();

        expect((store as any)["entityMap"].size).toEqual(0);
    });

    describe("store internal functions", () => {
        describe("unused methods", () => {
            it("getExternalRegister", () => {
                const register = storeInternal.getExternalRegister(generateInstanceId("", ""));
                expect(register).toBeDefined();
                expect(register.add).toThrow();
                expect(register.get).toThrow();
                expect(register.remove).toThrow();
            });

            it("getState", () => {
                expect(storeInternal.getState(generateInstanceId("", ""))).toEqual({});
            });

            it("getOriginState", () => {
                expect(storeInternal.getOriginState(generateInstanceId("", ""))).toEqual({});
            });

            it("getRecentChanges", () => {
                expect(storeInternal.getRecentChanges()).toEqual({});
            });

            it("applyChanges", () => {
                expect(() => {
                    storeInternal.applyChanges();
                }).not.toThrow();
            });

            it("discardChanges", () => {
                expect(() => {
                    storeInternal.discardChanges();
                }).not.toThrow();
            });

            it("pushStateChange", () => {
                const action: IInstanceAction<any> = {
                    id: "",
                    action: "",
                    storeType: "",
                    instanceId: generateInstanceId("", ""),
                    params: undefined,
                    actionType: ActionType.ACTION,
                };
                expect(() => {
                    storeInternal.pushStateChange(
                        action.storeType,
                        action.instanceId.toString(),
                        action.actionType,
                        {},
                        false,
                    );
                }).not.toThrow();
            });

            it("pushStateChange", () => {
                expect(() => {
                    storeInternal.pushDiffChange({});
                }).not.toThrow();
            });

            it("validateActionInstance", () => {
                const action: IInstanceAction<any> = {
                    id: "",
                    action: "",
                    storeType: "",
                    instanceId: generateInstanceId("", ""),
                    params: undefined,
                    actionType: ActionType.ACTION,
                };
                expect(() => {
                    storeInternal.validateActionInstance(action);
                }).not.toThrow();
            });

            it("getHistories", () => {
                const histroy = (store as unknown as StoreImpl).getHistories();
                expect(histroy.histroy.length).toEqual(0);
                expect(histroy.index).toEqual(-1);
            });
        });

        describe("getAction", () => {
            it("action is not defined", () => {
                expect(() => {
                    storeInternal.getAction("test.unDefined", false, generateInstanceId("", ""));
                }).toThrow(MessageBundle.getText("STORE_ACTION_NOT_FOUND", "test.unDefined"));
            });

            it("action is defined", () => {
                const action = storeInternal.getAction(
                    TestUserStateInterface.action.userLogonAction.info.fullName,
                    false,
                    generateInstanceId("", ""),
                );
                expect(action.info.name).toEqual("userLogonAction");
            });

            it("action is template", () => {
                const instanceId = generateInstanceId(baseInstanceId, "test", "");
                const action = storeInternal.getAction("action.userLogonAction", true, instanceId);
                expect(action.info.name).toEqual("userLogonAction");
            });

            it("action is template and could not found", () => {
                const instanceId = generateInstanceId(baseInstanceId, "test1", "");
                expect(() => {
                    storeInternal.getAction("action.userLogonAction", true, instanceId);
                }).toThrow(MessageBundle.getText("STORE_ACTION_NOT_FOUND", "action.userLogonAction"));
            });
        });

        describe("getSelector", () => {
            it("selector is not defined", () => {
                expect(() => {
                    storeInternal.getSelector("test.unDefined", false, generateInstanceId("", ""));
                }).toThrow(MessageBundle.getText("STORE_SELECTOR_NOT_FOUND", "test.unDefined"));
            });

            it("selector is defined", () => {
                const selector = storeInternal.getSelector(
                    TestUserStateInterface.selector.getUser.info.fullName,
                    false,
                    generateInstanceId("", ""),
                );
                expect(selector.info.name).toEqual("getUser");
            });

            it("selector is template", () => {
                const instanceId = generateInstanceId(baseInstanceId, "test", "");
                const selector = storeInternal.getSelector("selector.getUser", true, instanceId);
                expect(selector.info.name).toEqual("getUser");
            });

            it("selector is template and could not found", () => {
                const instanceId = generateInstanceId(baseInstanceId, "test1", "");
                expect(() => {
                    storeInternal.getSelector("selector.getUser", true, instanceId);
                }).toThrow(MessageBundle.getText("STORE_SELECTOR_NOT_FOUND", "selector.getUser"));
            });
        });

        describe("createEntity", () => {
            it("create duplicate entity", () => {
                expect(() => {
                    storeInternal.createEntity(baseInstanceId, {
                        [STORE_STATE_SYSTEM]: {
                            config: { redoUndo: true },
                            instanceMap: {
                                parentMap: {},
                                childrenMap: {},
                            },
                        },
                        [STORE_STATE_INSTANCE]: {},
                    });
                }).toThrow(MessageBundle.getText("STORE_CREATE_ENTITY_DUP", baseInstanceId.entity, baseInstanceId.id));
            });

            it("create new entity", () => {
                const newInstanceId = generateNewStoreInstance();

                instancesPool.push(newInstanceId);
                storeInternal.createEntity(newInstanceId, {
                    [STORE_STATE_SYSTEM]: {
                        config: { redoUndo: true },
                        instanceMap: {
                            parentMap: {},
                            childrenMap: {},
                        },
                    },
                    [STORE_STATE_INSTANCE]: {},
                });
                expect(
                    ((store as any).entityMap as Map<any, any>).get(newInstanceId.entity) instanceof StoreInstanceImpl,
                ).toBeTruthy();
                expect(((store as any).instanceListener as Map<any, any>).get(newInstanceId.entity)).toBeDefined();
                expect(((store as any).instanceSubscribe as Map<any, any>).get(newInstanceId.entity)).toBeDefined();
            });
        });

        describe("destroyEntity", () => {
            beforeEach(() => {
                if (instancesPool.length === 0) {
                    const newInstanceId = generateNewStoreInstance();

                    instancesPool.push(newInstanceId);
                    storeInternal.createEntity(newInstanceId, {
                        [STORE_STATE_SYSTEM]: {
                            config: { redoUndo: true },
                            instanceMap: {
                                parentMap: {},
                                childrenMap: {},
                            },
                        },
                        [STORE_STATE_INSTANCE]: {},
                    });
                    expect(
                        ((store as any).entityMap as Map<any, any>).get(newInstanceId.entity) instanceof
                            StoreInstanceImpl,
                    ).toBeTruthy();
                    expect(((store as any).instanceListener as Map<any, any>).get(newInstanceId.entity)).toBeDefined();
                    expect(((store as any).instanceSubscribe as Map<any, any>).get(newInstanceId.entity)).toBeDefined();
                }
            });
            it("-", () => {
                const instanceId = instancesPool.pop();
                expect(instanceId).not.toBeUndefined();

                const assertedInstance = instanceId as InstanceId;
                storeInternal.destroyEntity(assertedInstance);
                expect(((store as any).entityMap as Map<any, any>).get(assertedInstance.entity)).toBeUndefined();
                expect(((store as any).instanceListener as Map<any, any>).get(assertedInstance.entity)).toBeUndefined();
                expect(
                    ((store as any).instanceSubscribe as Map<any, any>).get(assertedInstance.entity),
                ).toBeUndefined();
            });
        });

        describe("getEntity", () => {
            it("get an entity", () => {
                const storeEntity = storeInternal.getEntity(baseInstanceId.entity);
                expect(storeEntity).toBeDefined();
                expect(storeEntity).not.toEqual(storeInternal);
            });

            it("entity not exist", () => {
                const newInstanceId = generateNewStoreInstance();
                const storeEntity = storeInternal.getEntity(newInstanceId.entity);
                expect(storeEntity).toBeDefined();
                expect(storeEntity).toEqual(storeInternal);
            });
        });

        describe("applyHierarchyChecklist", () => {
            it("-", () => {
                expect(() => {
                    store.applyHierarchyChecklist();
                }).not.toThrow();
            });
        });
    });

    describe("store public functions", () => {
        describe("registerInterface", () => {
            it("register store basic interface should throw error", () => {
                expect(() => {
                    store.registerInterface(TIANYU_STORE_INSTANCE_BASE_ENTITY_STORE_TYPE, TestUserStateInterface);
                }).toThrow(MessageBundle.getText("STORE_SHOULD_NOT_REGISTER_SYSTEM_ENTITY"));
            });

            it("register successful", () => {
                const interfaceMap: ITianyuStoreInterfaceMap = {
                    test: TestUserStateInterface,
                    undefined: undefined,
                };

                expect(() => {
                    store.registerInterface(interfaceMap);
                }).not.toThrow();

                expect((store as any).storyTypes.includes("undefined")).toBeFalsy();
            });
        });

        describe("id", () => {
            it("-", () => {
                expect(store.id).not.toEqual("");
            });
        });

        describe("name", () => {
            it("has friendly name", () => {
                const testStore = createStore({
                    friendlyName: "test-store-friendly-name",
                });
                expect(testStore.name).toEqual("test-store-friendly-name");
            });
            it("has friendly name", () => {
                const testStore = createStore();
                expect(testStore.name).toEqual(testStore.id);
            });
        });
    });

    describe("startListener", () => {
        it("entity not exist", () => {
            const newInstanceId = generateNewStoreInstance();
            const listener: IInstanceListener<any> = {
                id: guid(),
                selector: {
                    id: "",
                    selector: "",
                    storeType: "",
                    instanceId: newInstanceId,
                    params: undefined,
                },
                listener: () => {},
            };

            expect(() => {
                store.startListen(listener);
            }).toThrow(MessageBundle.getText("STORE_ENTITY_NOT_EXIST", newInstanceId.entity));
        });

        it("entity exists", () => {
            const listener: IInstanceListener<any> = {
                id: guid(),
                selector: {
                    id: "",
                    selector: "",
                    storeType: "",
                    instanceId: baseInstanceId,
                    params: undefined,
                },
                listener: () => {},
            };

            expect(() => {
                store.startListen(listener);
            }).not.toThrow();

            const listeners = (store as any).instanceListener.get(baseInstanceId.entity);
            expect((listeners as any)?.[baseInstanceId.toString()]).toBeDefined();
            expect((listeners as any)?.[baseInstanceId.toString()].length).toEqual(1);
            // to clean listener
            (listeners as any)[baseInstanceId.toString()] = [];
        });
    });

    describe("stopListen", () => {
        it("entity not exist", () => {
            const newInstanceId = generateNewStoreInstance();
            const listener: IInstanceListener<any> = {
                id: guid(),
                selector: {
                    id: "",
                    selector: "",
                    storeType: "",
                    instanceId: newInstanceId,
                    params: undefined,
                },
                listener: () => {},
            };

            expect(() => {
                store.stopListen(listener);
            }).not.toThrow();
        });

        it("entity exists", () => {
            const listener: IInstanceListener<any> = {
                id: guid(),
                selector: {
                    id: "",
                    selector: "",
                    storeType: "",
                    instanceId: baseInstanceId,
                    params: undefined,
                },
                listener: () => {},
            };

            {
                expect(() => {
                    store.startListen(listener);
                }).not.toThrow();

                const listeners = (store as any).instanceListener.get(baseInstanceId.entity);
                expect((listeners as any)?.[baseInstanceId.toString()]).toBeDefined();
                expect((listeners as any)?.[baseInstanceId.toString()].length).toEqual(1);
            }

            expect(() => {
                store.stopListen(listener);
            }).not.toThrow();

            const listeners = (store as any).instanceListener.get(baseInstanceId.entity);
            expect((listeners as any)?.[baseInstanceId.toString()]).toBeDefined();
            expect((listeners as any)?.[baseInstanceId.toString()].length).toEqual(0);
        });
    });

    describe("subscribe", () => {
        it("entity not exist", () => {
            const newInstanceId = generateNewStoreInstance();

            expect(() => {
                store.subscribe(TestUserStateInterface.selector.getUser(newInstanceId), () => {});
            }).toThrow(MessageBundle.getText("STORE_ENTITY_NOT_EXIST", newInstanceId.entity));
        });

        it("unsubscribe", () => {
            const listener: IInstanceListener<any> = {
                id: guid(),
                selector: {
                    id: "",
                    selector: "",
                    storeType: "",
                    instanceId: baseInstanceId,
                    params: undefined,
                },
                listener: () => {},
            };

            const unsub = store.subscribe(TestUserStateInterface.selector.getUser(baseInstanceId), () => {});

            {
                const subscribes = (store as any).instanceSubscribe.get(baseInstanceId.entity);
                expect((subscribes as any)?.[baseInstanceId.toString()]).toBeDefined();
                expect((subscribes as any)?.[baseInstanceId.toString()].length).toEqual(1);
            }

            unsub();

            const subscribes = (store as any).instanceSubscribe.get(baseInstanceId.entity);
            expect((subscribes as any)?.[baseInstanceId.toString()]).toBeDefined();
            expect((subscribes as any)?.[baseInstanceId.toString()].length).toEqual(0);
        });
    });

    describe("selecte", () => {
        it("entity not exist", () => {
            const newInstanceId = generateNewStoreInstance();
            const selectorInstance = TestUserStateInterface.selector.getUser(newInstanceId);

            const result = store.selecte(selectorInstance);
            expect(result instanceof Missing).toBeTruthy();
        });

        it("do selecting", () => {
            const Processsing = require("src/store/processing/Selecting");
            const selectorInstance = TestUserStateInterface.selector.getUser(baseInstanceId);

            jest.spyOn(Processsing, "doSelecting").mockReturnValue(123);
            const selectResult = store.selecte(selectorInstance);
            expect(selectResult).toBe(123);
        });
    });

    describe("selecteWithThrow", () => {
        it("entity not exist", () => {
            const newInstanceId = generateNewStoreInstance();
            const selectorInstance = TestUserStateInterface.selector.getUser(newInstanceId);

            expect(() => {
                store.selecteWithThrow(selectorInstance);
            }).toThrow(MessageBundle.getText("STORE_ENTITY_NOT_EXIST", newInstanceId.entity));
        });

        it("do selecting", () => {
            const Processsing = require("src/store/processing/Selecting");
            const selectorInstance = TestUserStateInterface.selector.getUser(baseInstanceId);

            jest.spyOn(Processsing, "doSelectingWithThrow").mockReturnValue(123);
            const selectResult = store.selecteWithThrow(selectorInstance);
            expect(selectResult).toBe(123);
        });
    });

    describe("dispatch and dispatch view", () => {
        beforeEach(() => {
            jest.spyOn(store as any, "dispatchInternal").mockReturnValue(Promise.resolve());
        });

        it("action instance", async () => {
            const action = TestUserStateInterface.action.userLifecycleCreateAction(baseInstanceId);
            await store.dispatch(action);
            expect((store as any).dispatchInternal).toHaveBeenCalledWith([action], false);
        });

        it("action batch", async () => {
            const action = TestUserStateInterface.action.userLifecycleCreateAction(baseInstanceId);
            await store.dispatch(createBatchAction([action]));
            expect((store as any).dispatchInternal).toHaveBeenCalledWith([action], false);
        });

        it("view action instance", () => {
            const action = {
                ...TestUserStateInterface.action.userLifecycleCreateAction(baseInstanceId),
                transaction: false,
            } as IInstanceViewAction<any>;
            store.dispatchForView(action);
            expect((store as any).dispatchInternal).toHaveBeenCalledWith([action], true);
        });

        it("view action batch", () => {
            const action = TestUserStateInterface.action.userLifecycleCreateAction(baseInstanceId);
            store.dispatchForView(createBatchAction([action]));
            expect((store as any).dispatchInternal).toHaveBeenCalledWith([action], true);
        });
    });

    describe("dispatchInternal", () => {
        const Processsing = require("src/store/processing/Dispatching");
        let dispatchingSpyOn: any;

        beforeEach(() => {
            jest.spyOn(store as any, "fireListeners").mockImplementation(async () => {
                return Promise.resolve();
            });
            jest.spyOn(store as any, "fireSubscribes").mockImplementation(async () => {
                return Promise.resolve();
            });

            jest.spyOn(storeInternal, "applyChanges");
            jest.spyOn(storeInternal, "discardChanges");

            dispatchingSpyOn = jest.spyOn(Processsing, "dispatching");

            ((store as any)["transaction"] as unknown as ITransaction).cleanDispatch();
            ((store as any)["transaction"] as unknown as ITransaction).cleanError();
            ((store as any)["transaction"] as unknown as ITransaction).cleanSelector();
        });

        it("no action dispatched", (done) => {
            const dispatchPromise = (store as any).__proto__.dispatchInternal.call(store, [], false);
            dispatchPromise.then(() => {
                expect(dispatchingSpyOn).not.toHaveBeenCalled();
                expect(storeInternal.applyChanges).not.toHaveBeenCalled();
                expect(storeInternal.discardChanges).not.toHaveBeenCalled();
                done();
            }, done.fail);
        });

        it("dispatch success", (done) => {
            const action = TestUserStateInterface.action.userLifecycleCreateAction(generateNewStoreInstance());

            dispatchingSpyOn.mockImplementation(async () => {
                return Promise.resolve();
            });
            jest.spyOn(storeInternal, "getRecentChanges").mockReturnValue({ test: {} });
            const dispatchPromise = (store as any).__proto__.dispatchInternal.call(store, [action], false);
            dispatchPromise.then(() => {
                expect(storeInternal.applyChanges).toHaveBeenCalled();
                expect(storeInternal.discardChanges).not.toHaveBeenCalled();
                done();
            }, done.fail);
        });

        it("dispatch failed", (done) => {
            const action = TestUserStateInterface.action.userLifecycleCreateAction(generateNewStoreInstance());

            dispatchingSpyOn.mockImplementation(async () => {
                return Promise.reject();
            });
            jest.spyOn(storeInternal, "getRecentChanges").mockReturnValue({ test: {} });
            const dispatchPromise = (store as any).__proto__.dispatchInternal.call(store, [action], false);
            dispatchPromise.then(() => {
                expect(storeInternal.applyChanges).not.toHaveBeenCalled();
                expect(storeInternal.discardChanges).toHaveBeenCalled();
                done();
            }, done.fail);
        });

        it("dispatch with not wait all", (done) => {
            const action = TestUserStateInterface.action.userLifecycleCreateAction(generateNewStoreInstance());

            (store as any).config.waitForAll = false;

            dispatchingSpyOn.mockImplementation(async () => {
                return Promise.resolve();
            });
            jest.spyOn(storeInternal, "getRecentChanges").mockReturnValue({ test: {} });
            const dispatchPromise = (store as any).__proto__.dispatchInternal.call(store, [action], false);
            dispatchPromise
                .then(() => {
                    expect(storeInternal.applyChanges).toHaveBeenCalled();
                    expect(storeInternal.discardChanges).not.toHaveBeenCalled();
                    done();
                }, done.fail)
                .finally(() => {
                    (store as any).config.waitForAll = true;
                });
        });
    });

    describe("fireListeners", () => {
        const Processsing = require("src/store/processing/Selecting");
        let selectingSpyOn: any;

        const instanceId = generateInstanceId(baseInstanceId, "test", "instance");

        const listener = {
            id: guid(),
            selector: {
                id: "",
                selector: "test.selector.getUser",
                storeType: "",
                instanceId: instanceId,
                params: undefined,
            },
            listener: () => {},
        };

        beforeAll(() => {
            store.startListen(listener);

            const listeners = (store as any).instanceListener.get(instanceId.entity);
            expect((listeners as any)?.[instanceId.toString()]).toBeDefined();
            expect((listeners as any)?.[instanceId.toString()].length).toEqual(1);
        });

        afterAll(() => {
            store.stopListen(listener);

            const listeners = (store as any).instanceListener.get(instanceId.entity);
            expect((listeners as any)?.[instanceId.toString()]).toBeDefined();
            expect((listeners as any)?.[instanceId.toString()].length).toEqual(0);
        });

        beforeEach(() => {
            jest.spyOn((store as any)["transaction"], "error");
            jest.spyOn(listener, "listener");
            selectingSpyOn = jest.spyOn(Processsing, "doSelectingWithState");
        });

        it("entity is not valid, not to fire", (done) => {
            const newInstanceId = generateNewStoreInstance();
            const firePromise = (store as any).__proto__.fireListeners.call(store, newInstanceId.entity, {}, store);
            firePromise.then(() => {
                expect(selectingSpyOn).not.toHaveBeenCalled();
                done();
            }, done.fail);
        });

        it("has change", (done) => {
            const change: IDifferences = {
                test: {
                    [instanceId.toString()]: {
                        old: {
                            test: "1",
                        },
                        new: {
                            test: "2",
                        },
                        type: DifferenceChangeType.Change,
                    },
                },
            };

            selectingSpyOn.mockImplementation((state: any) => {
                return state.test;
            });
            const firePromise = (store as any).__proto__.fireListeners.call(store, instanceId.entity, change, store);
            firePromise.then(() => {
                expect(listener.listener).toHaveBeenCalled();
                done();
            }, done.fail);
        });

        it("missing", (done) => {
            const change: IDifferences = {
                test: {
                    [instanceId.toString()]: {
                        old: {
                            test: "1",
                        },
                        new: {
                            test: "2",
                        },
                        type: DifferenceChangeType.Change,
                    },
                },
            };

            selectingSpyOn.mockImplementation((state: any) => {
                return new Missing();
            });
            const firePromise = (store as any).__proto__.fireListeners.call(store, instanceId.entity, change, store);
            firePromise.then(() => {
                expect(listener.listener).not.toHaveBeenCalled();
                done();
            }, done.fail);
        });

        it("not have change", (done) => {
            const change: IDifferences = {
                test: {
                    [instanceId.toString()]: {
                        old: {
                            test: "1",
                        },
                        new: {
                            test: "1",
                        },
                        type: DifferenceChangeType.Change,
                    },
                },
            };

            selectingSpyOn.mockImplementation((state: any) => {
                return state.test;
            });
            const firePromise = (store as any).__proto__.fireListeners.call(store, instanceId.entity, change, store);
            firePromise.then(() => {
                expect(listener.listener).not.toHaveBeenCalled();
                done();
            }, done.fail);
        });

        describe("throw error", () => {
            const change: IDifferences = {
                test: {
                    [instanceId.toString()]: {
                        old: {},
                        new: {},
                        type: DifferenceChangeType.Change,
                    },
                },
            };

            it("throw string", (done) => {
                selectingSpyOn.mockImplementation(() => {
                    throw "error";
                });

                const firePromise = (store as any).__proto__.fireListeners.call(
                    store,
                    instanceId.entity,
                    change,
                    store,
                );
                firePromise.then(() => {
                    expect(listener.listener).not.toHaveBeenCalled();
                    expect((store as any)["transaction"].error).toHaveBeenCalledWith(
                        MessageBundle.getText(
                            "STORE_EVENT_LISTENER_TRIGGER_FAILED",
                            "error",
                            listener.id,
                            listener.selector.selector,
                        ),
                        TransactionType.Listener,
                    );
                    done();
                }, done.fail);
            });

            it("throw error", (done) => {
                selectingSpyOn.mockImplementation(() => {
                    throw new Error("error obj");
                });

                const firePromise = (store as any).__proto__.fireListeners.call(
                    store,
                    instanceId.entity,
                    change,
                    store,
                );
                firePromise.then(() => {
                    expect(listener.listener).not.toHaveBeenCalled();
                    expect((store as any)["transaction"].error).toHaveBeenCalledWith(
                        MessageBundle.getText(
                            "STORE_EVENT_LISTENER_TRIGGER_FAILED",
                            "error obj",
                            listener.id,
                            listener.selector.selector,
                        ),
                        TransactionType.Listener,
                    );
                    done();
                }, done.fail);
            });

            it("throw other", (done) => {
                selectingSpyOn.mockImplementation(() => {
                    throw 123;
                });

                const firePromise = (store as any).__proto__.fireListeners.call(
                    store,
                    instanceId.entity,
                    change,
                    store,
                );
                firePromise.then(() => {
                    expect(listener.listener).not.toHaveBeenCalled();
                    expect((store as any)["transaction"].error).toHaveBeenCalledWith(
                        MessageBundle.getText(
                            "STORE_EVENT_LISTENER_TRIGGER_FAILED",
                            MessageBundle.getText(
                                "TRANSACTION_ERROR_RECORDING_UNKNOWN_ERROR",
                                formatTransactionType(TransactionType.Listener),
                            ),
                            listener.id,
                            listener.selector.selector,
                        ),
                        TransactionType.Listener,
                    );
                    done();
                }, done.fail);
            });
        });
    });

    describe("fireSubscribes", () => {
        const Processsing = require("src/store/processing/Selecting");
        let selectingSpyOn: any;

        const instanceId = generateInstanceId(baseInstanceId, "test", "instance");
        const selectorProvider = SelectorFactor.makeSelector<any, any>(function (state) {
            return null;
        });

        let unsubscribe: null | Function = null;
        let isCalled: boolean = false;
        const event = {
            trigger: () => {
                isCalled = true;
            },
        };

        beforeAll(() => {
            unsubscribe = store.subscribe(selectorProvider(instanceId), event.trigger);

            const subscribes = (store as any).instanceSubscribe.get(instanceId.entity);
            expect((subscribes as any)?.[instanceId.toString()]).toBeDefined();
            expect((subscribes as any)?.[instanceId.toString()].length).toEqual(1);
        });

        afterAll(() => {
            unsubscribe?.();

            const subscribes = (store as any).instanceSubscribe.get(instanceId.entity);
            expect((subscribes as any)?.[instanceId.toString()]).toBeDefined();
            expect((subscribes as any)?.[instanceId.toString()].length).toEqual(0);
        });

        beforeEach(() => {
            jest.spyOn((store as any)["transaction"], "error");
            selectingSpyOn = jest.spyOn(Processsing, "doSelectingWithState");
            isCalled = false;
        });

        it("entity is not valid, not to fire", (done) => {
            const newInstanceId = generateNewStoreInstance();
            const firePromise = (store as any).__proto__.fireSubscribes.call(store, newInstanceId.entity, {}, store);
            firePromise.then(() => {
                expect(selectingSpyOn).not.toHaveBeenCalled();
                done();
            }, done.fail);
        });

        it("has change", (done) => {
            const change: IDifferences = {
                test: {
                    [instanceId.toString()]: {
                        old: {
                            test: "1",
                        },
                        new: {
                            test: "2",
                        },
                        type: DifferenceChangeType.Change,
                    },
                },
            };

            selectingSpyOn.mockImplementation((state: any) => {
                return state.test;
            });
            const firePromise = (store as any).__proto__.fireSubscribes.call(store, instanceId.entity, change, store);
            firePromise.then(() => {
                expect(isCalled).toBeTruthy();
                done();
            }, done.fail);
        });

        it("missing", (done) => {
            const change: IDifferences = {
                test: {
                    [instanceId.toString()]: {
                        old: {
                            test: "1",
                        },
                        new: {
                            test: "2",
                        },
                        type: DifferenceChangeType.Change,
                    },
                },
            };

            selectingSpyOn.mockImplementation((state: any) => {
                return new Missing();
            });
            const firePromise = (store as any).__proto__.fireSubscribes.call(store, instanceId.entity, change, store);
            firePromise.then(() => {
                expect(isCalled).toBeFalsy();
                done();
            }, done.fail);
        });

        it("not have change", (done) => {
            const change: IDifferences = {
                test: {
                    [instanceId.toString()]: {
                        old: {
                            test: "1",
                        },
                        new: {
                            test: "1",
                        },
                        type: DifferenceChangeType.Change,
                    },
                },
            };

            selectingSpyOn.mockImplementation((state: any) => {
                return state.test;
            });
            const firePromise = (store as any).__proto__.fireSubscribes.call(store, instanceId.entity, change, store);
            firePromise.then(() => {
                expect(isCalled).toBeFalsy();
                done();
            }, done.fail);
        });

        describe("throw error", () => {
            const change: IDifferences = {
                test: {
                    [instanceId.toString()]: {
                        old: {},
                        new: {},
                        type: DifferenceChangeType.Change,
                    },
                },
            };

            it("throw string", (done) => {
                selectingSpyOn.mockImplementation(() => {
                    throw "error";
                });

                const firePromise = (store as any).__proto__.fireSubscribes.call(
                    store,
                    instanceId.entity,
                    change,
                    store,
                );
                firePromise.then(() => {
                    expect(isCalled).toBeFalsy();
                    expect((store as any)["transaction"].error).toHaveBeenCalled();
                    done();
                }, done.fail);
            });

            it("throw error", (done) => {
                selectingSpyOn.mockImplementation(() => {
                    throw new Error("error obj");
                });

                const firePromise = (store as any).__proto__.fireSubscribes.call(
                    store,
                    instanceId.entity,
                    change,
                    store,
                );
                firePromise.then(() => {
                    expect(isCalled).toBeFalsy();
                    expect((store as any)["transaction"].error).toHaveBeenCalled();
                    done();
                }, done.fail);
            });

            it("throw other", (done) => {
                selectingSpyOn.mockImplementation(() => {
                    throw 123;
                });

                const firePromise = (store as any).__proto__.fireSubscribes.call(
                    store,
                    instanceId.entity,
                    change,
                    store,
                );
                firePromise.then(() => {
                    expect(isCalled).toBeFalsy();
                    expect((store as any)["transaction"].error).toHaveBeenCalled();
                    done();
                }, done.fail);
            });
        });
    });

    describe("store devtools api", () => {
        const storeDev = store as unknown as StoreImpl;
        it("setOnSelector", () => {
            storeDev.setOnSelector(() => {});
            expect(storeDev["onSelector"]).toBeDefined();
            storeDev.setOnSelector();
            expect(storeDev["onSelector"]).toBeUndefined();
        });

        it("setOnDispatch", () => {
            storeDev.setOnDispatch(() => {});
            expect(storeDev["onDispatch"]).toBeDefined();
            storeDev.setOnDispatch();
            expect(storeDev["onDispatch"]).toBeUndefined();
        });

        it("setOnError", () => {
            storeDev.setOnError(() => {});
            expect(storeDev["onError"]).toBeDefined();
            storeDev.setOnError();
            expect(storeDev["onError"]).toBeUndefined();
        });

        it("setOnChangeApplied", () => {
            storeDev.setOnChangeApplied(() => {});
            expect(storeDev["onChangeApplied"]).toBeDefined();
            storeDev.setOnChangeApplied();
            expect(storeDev["onChangeApplied"]).toBeUndefined();
        });

        it("getState", () => {
            const stateMap = storeDev.getState();
            expect(Object.keys(stateMap).length).not.toEqual(0);
        });

        it("getAllDispatchs", () => {
            jest.spyOn(storeDev["transaction"], "getDispatched").mockImplementation(() => []);
            storeDev.getAllDispatchs();
            expect(storeDev["transaction"].getDispatched).toHaveBeenCalled();
        });

        it("getAllSelectors", () => {
            jest.spyOn(storeDev["transaction"], "getSelections").mockImplementation(() => []);
            storeDev.getAllSelectors();
            expect(storeDev["transaction"].getSelections).toHaveBeenCalled();
        });

        it("getAllErrors", () => {
            jest.spyOn(storeDev["transaction"], "getErrors").mockImplementation(() => []);
            storeDev.getAllErrors();
            expect(storeDev["transaction"].getErrors).toHaveBeenCalled();
        });
    });
});
