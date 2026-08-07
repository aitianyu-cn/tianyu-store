/** @format */

import { generateInstanceId } from "src/InstanceId";
import { generateNewStoreInstance } from "src/Store";
import { IStoreState, STORE_STATE_INSTANCE, STORE_STATE_SYSTEM } from "src/store/storage/interface/StoreState";
import { RedoUndoStackImpl } from "src/store/storage/RedoUndoStackImpl";
import { GetChildInstances, GetInstanceExist, GetParentInstance } from "src/store/storage/StoreEntitySelector";

describe("aitianyu-cn.node-module.tianyu-store.store.storage.StoreEntitySelector", () => {
    describe("GetInstanceExist", () => {
        it("is ancestor instance", () => {
            const state: any = {};
            const instanceId = generateNewStoreInstance();

            expect(GetInstanceExist.getter(state, instanceId)).toBeTruthy();
        });

        it("get from instance map", () => {
            const root = generateNewStoreInstance();
            const instanceId = generateInstanceId(root, "test", "test");
            const state: IStoreState = {
                [STORE_STATE_SYSTEM]: {
                    config: {},
                    instanceMap: { childrenMap: {}, parentMap: {} },
                },
                [STORE_STATE_INSTANCE]: {
                    test: {
                        [instanceId.toString()]: {},
                    },
                },
            };

            expect(GetInstanceExist.getter(state, instanceId)).toBeTruthy();
        });
    });

    describe("parent & child relationship", () => {
        const root = generateNewStoreInstance();
        const parent = generateInstanceId(root, "test", "test");
        const child1 = generateInstanceId(parent, "ch", "ch1");
        const child2 = generateInstanceId(parent, "ch", "ch2");
        const child3 = generateInstanceId(parent, "ch", "ch3");

        const redoUndoStack = new RedoUndoStackImpl();

        const register: any = {
            get: () => redoUndoStack,
        };

        beforeEach(() => {
            redoUndoStack.cleanHistory();
        });

        describe("GetParentInstance", () => {
            it("not in redo/undo", () => {
                const state: IStoreState = {
                    [STORE_STATE_SYSTEM]: {
                        config: {},
                        instanceMap: {
                            childrenMap: {},
                            parentMap: {
                                [child1.toString()]: parent.toString(),
                                [parent.toString()]: null,
                            },
                        },
                    },
                    [STORE_STATE_INSTANCE]: {},
                };

                const isRedoUndo = Boolean(GetParentInstance.external?.(register));
                const getParentFromParent = GetParentInstance.getter(state, parent, isRedoUndo);
                expect(getParentFromParent).toBeNull();

                const getParentFromChild1 = GetParentInstance.getter(state, child1, isRedoUndo);
                expect(getParentFromChild1?.equals(parent)).toBeTruthy();
            });

            describe("in redo/undo", () => {
                beforeEach(() => {
                    redoUndoStack["future"].push({});
                });

                it("parent is ancestor", () => {
                    const state: IStoreState = {
                        [STORE_STATE_SYSTEM]: {
                            config: {},
                            instanceMap: {
                                childrenMap: {},
                                parentMap: {},
                            },
                        },
                        [STORE_STATE_INSTANCE]: {},
                    };

                    const isRedoUndo = Boolean(GetParentInstance.external?.(register));
                    const getParentFromParent = GetParentInstance.getter(state, parent, isRedoUndo);
                    expect(getParentFromParent).toBeNull();
                });

                it("parent is not ancestor", () => {
                    const state: IStoreState = {
                        [STORE_STATE_SYSTEM]: {
                            config: {},
                            instanceMap: {
                                childrenMap: {},
                                parentMap: {},
                            },
                        },
                        [STORE_STATE_INSTANCE]: {
                            test: {
                                [parent.toString()]: {},
                            },
                        },
                    };

                    const isRedoUndo = Boolean(GetParentInstance.external?.(register));
                    const getParentFromChild1 = GetParentInstance.getter(state, child1, isRedoUndo);
                    expect(getParentFromChild1?.equals(parent)).toBeTruthy();

                    const parent2 = generateInstanceId(root, "test", "test2");
                    const childFromParent2 = generateInstanceId(parent2, "ch", "ch1");
                    const getParentFromChildNew = GetParentInstance.getter(state, childFromParent2, isRedoUndo);
                    expect(getParentFromChildNew).toBeNull();
                });
            });
        });

        describe("GetChildInstances", () => {
            it("not in redo undo", () => {
                const state: IStoreState = {
                    [STORE_STATE_SYSTEM]: {
                        config: {},
                        instanceMap: {
                            childrenMap: {
                                [parent.toString()]: [child1.toString(), child2.toString(), child3.toString()],
                            },
                            parentMap: {},
                        },
                    },
                    [STORE_STATE_INSTANCE]: {},
                };

                const isRedoUndo = Boolean(GetChildInstances.external?.(register));
                const children = GetChildInstances.getter(state, parent, isRedoUndo);
                expect(children.length).toEqual(3);
                expect(children.find((value) => value.equals(child1))).toBeTruthy();
                expect(children.find((value) => value.equals(child2))).toBeTruthy();
                expect(children.find((value) => value.equals(child3))).toBeTruthy();
            });

            it("not in redo/undo & instance not found", () => {
                const state: IStoreState = {
                    [STORE_STATE_SYSTEM]: {
                        config: {},
                        instanceMap: {
                            childrenMap: {
                                [parent.toString()]: [child1.toString(), child2.toString(), child3.toString()],
                            },
                            parentMap: {},
                        },
                    },
                    [STORE_STATE_INSTANCE]: {},
                };

                const parent2 = generateInstanceId(root, "test", "test2");
                const isRedoUndo = Boolean(GetChildInstances.external?.(register));
                const children = GetChildInstances.getter(state, parent2, isRedoUndo);
                expect(children.length).toEqual(0);
            });

            describe("in redo undo", () => {
                beforeEach(() => {
                    redoUndoStack["future"].push({});
                });

                it("find children", () => {
                    const state: IStoreState = {
                        [STORE_STATE_SYSTEM]: {
                            config: {},
                            instanceMap: {
                                childrenMap: {},
                                parentMap: {},
                            },
                        },
                        [STORE_STATE_INSTANCE]: {
                            test: {
                                [parent.toString()]: {},
                            },
                            ch: {
                                [child1.toString()]: {},
                                [child2.toString()]: {},
                            },
                        },
                    };

                    const isRedoUndo = Boolean(GetChildInstances.external?.(register));
                    const children = GetChildInstances.getter(state, parent, isRedoUndo);
                    expect(children.length).toEqual(2);
                    expect(children.find((value) => value.equals(child1))).toBeTruthy();
                    expect(children.find((value) => value.equals(child2))).toBeTruthy();
                    expect(children.find((value) => value.equals(child3))).toBeFalsy();
                });
            });
        });
    });
});
