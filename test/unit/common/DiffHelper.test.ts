/** @format */

import { getDifference, mergeDiff } from "src/common/DiffHelper";
import { IStoreState, STORE_STATE_INSTANCE, STORE_STATE_SYSTEM } from "src/store/storage/interface/StoreState";
import { DifferenceChangeType, IDifferences } from "src/types/RedoUndoStack";

describe("aitianyu-cn.node-module.tianyu-store.common.DiffHelper", () => {
    describe("getDifference", () => {
        it("create new instance", () => {
            const oldState: IStoreState = {
                [STORE_STATE_SYSTEM]: {
                    config: { redoUndo: true },
                    instanceMap: {
                        parentMap: {},
                        childrenMap: {},
                    },
                },
                [STORE_STATE_INSTANCE]: {},
            };

            const newState: IStoreState = {
                [STORE_STATE_SYSTEM]: {
                    config: { redoUndo: true },
                    instanceMap: {
                        parentMap: {},
                        childrenMap: {},
                    },
                },
                [STORE_STATE_INSTANCE]: {
                    store: {
                        instance: {},
                    },
                },
            };

            const diff = getDifference(oldState, newState);
            expect(diff["store"]?.["instance"]).toBeDefined();
            expect(diff["store"]?.["instance"]?.old).toBeUndefined();
            expect(diff["store"]?.["instance"]?.new).toBeDefined();
            expect(diff["store"]?.["instance"]?.type).toBe(DifferenceChangeType.Create);
        });

        it("delete old instance", () => {
            const oldState: IStoreState = {
                [STORE_STATE_SYSTEM]: {
                    config: { redoUndo: true },
                    instanceMap: {
                        parentMap: {},
                        childrenMap: {},
                    },
                },
                [STORE_STATE_INSTANCE]: {
                    store: {
                        instance: {},
                    },
                },
            };

            const newState: IStoreState = {
                [STORE_STATE_SYSTEM]: {
                    config: { redoUndo: true },
                    instanceMap: {
                        parentMap: {},
                        childrenMap: {},
                    },
                },
                [STORE_STATE_INSTANCE]: {},
            };

            const diff = getDifference(oldState, newState);
            expect(diff["store"]?.["instance"]).toBeDefined();
            expect(diff["store"]?.["instance"]?.new).toBeUndefined();
            expect(diff["store"]?.["instance"]?.old).toBeDefined();
            expect(diff["store"]?.["instance"]?.type).toBe(DifferenceChangeType.Delete);
        });

        it("change instance", () => {
            const oldState: IStoreState = {
                [STORE_STATE_SYSTEM]: {
                    config: { redoUndo: true },
                    instanceMap: {
                        parentMap: {},
                        childrenMap: {},
                    },
                },
                [STORE_STATE_INSTANCE]: {
                    store: {
                        instance: {
                            b: 123,
                        },
                    },
                },
            };

            const newState: IStoreState = {
                [STORE_STATE_SYSTEM]: {
                    config: { redoUndo: true },
                    instanceMap: {
                        parentMap: {},
                        childrenMap: {},
                    },
                },
                [STORE_STATE_INSTANCE]: {
                    store: {
                        instance: {
                            a: "123",
                        },
                    },
                },
            };

            const diff = getDifference(oldState, newState);
            expect(diff["store"]?.["instance"]).toBeDefined();
            expect(diff["store"]?.["instance"]?.new).toBeDefined();
            expect(diff["store"]?.["instance"]?.old).toBeDefined();
            expect(diff["store"]?.["instance"]?.type).toBe(DifferenceChangeType.Change);
        });
    });

    describe("mergeDiff", () => {
        it("merge diff normal", () => {
            const state: IStoreState = {
                [STORE_STATE_SYSTEM]: {
                    config: { redoUndo: true },
                    instanceMap: {
                        parentMap: {},
                        childrenMap: {},
                    },
                },
                [STORE_STATE_INSTANCE]: {
                    store: {
                        instance: {
                            a: 123,
                        },
                        instance2: {
                            b: 123,
                        },
                    },
                },
            };

            const diff: IDifferences = {
                store: {
                    instance: {
                        new: {
                            a: "123",
                        },
                        old: {
                            a: 123,
                        },
                        type: DifferenceChangeType.Change,
                    },
                    instance2: {
                        new: undefined,
                        old: {
                            b: 123,
                        },
                        type: DifferenceChangeType.Delete,
                    },
                    instance3: {
                        new: {
                            c: true,
                        },
                        old: undefined,
                        type: DifferenceChangeType.Create,
                    },
                },
            };

            const newState = mergeDiff(state, diff);
            expect(newState[STORE_STATE_INSTANCE]["store"]["instance"]).toBeDefined();
            expect(newState[STORE_STATE_INSTANCE]["store"]["instance2"]).toBeUndefined();
            expect(newState[STORE_STATE_INSTANCE]["store"]["instance3"]).toBeDefined();

            expect(newState[STORE_STATE_INSTANCE]["store"]["instance"].a).toEqual("123");
            expect(newState[STORE_STATE_INSTANCE]["store"]["instance3"].c).toBeTruthy();
        });

        it("merge diff reverse", () => {
            const state: IStoreState = {
                [STORE_STATE_SYSTEM]: {
                    config: { redoUndo: true },
                    instanceMap: {
                        parentMap: {},
                        childrenMap: {},
                    },
                },
                [STORE_STATE_INSTANCE]: {
                    store: {
                        instance: {
                            a: "123",
                        },
                        instance3: {
                            c: true,
                        },
                    },
                },
            };

            const diff: IDifferences = {
                store: {
                    instance: {
                        new: {
                            a: "123",
                        },
                        old: {
                            a: 123,
                        },
                        type: DifferenceChangeType.Change,
                    },
                    instance2: {
                        new: undefined,
                        old: {
                            b: 123,
                        },
                        type: DifferenceChangeType.Delete,
                    },
                    instance3: {
                        new: {
                            c: true,
                        },
                        old: undefined,
                        type: DifferenceChangeType.Create,
                    },
                },
            };

            const newState = mergeDiff(state, diff, true);
            expect(newState[STORE_STATE_INSTANCE]["store"]["instance"]).toBeDefined();
            expect(newState[STORE_STATE_INSTANCE]["store"]["instance2"]).toBeDefined();
            expect(newState[STORE_STATE_INSTANCE]["store"]["instance3"]).toBeUndefined();

            expect(newState[STORE_STATE_INSTANCE]["store"]["instance"].a).toEqual(123);
            expect(newState[STORE_STATE_INSTANCE]["store"]["instance2"].b).toEqual(123);
        });

        it("merge diff if store type missed", () => {
            const state: IStoreState = {
                [STORE_STATE_SYSTEM]: {
                    config: { redoUndo: true },
                    instanceMap: {
                        parentMap: {},
                        childrenMap: {},
                    },
                },
                [STORE_STATE_INSTANCE]: {},
            };
            const diff: IDifferences = {
                store: {
                    instance: {
                        new: {
                            a: "123",
                        },
                        old: undefined,
                        type: DifferenceChangeType.Change,
                    },
                },
                store2: {
                    instance: {
                        new: {
                            a: "123",
                        },
                        old: undefined,
                        type: DifferenceChangeType.Create,
                    },
                },
            };

            const newState = mergeDiff(state, diff);
            expect(newState[STORE_STATE_INSTANCE]["store"]["instance"]).toBeDefined();
            expect(newState[STORE_STATE_INSTANCE]["store2"]["instance"]).toBeDefined();

            expect(newState[STORE_STATE_INSTANCE]["store"]["instance"].a).toEqual("123");
            expect(newState[STORE_STATE_INSTANCE]["store2"]["instance"].a).toEqual("123");
        });
    });
});
