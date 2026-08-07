/** @format */

import { generateInstanceId, newInstanceId } from "src/InstanceId";
import { generateNewStoreInstance } from "src/Store";
import {
    getStoreTypeMatchedInstanceId,
    verifyActionInstances,
    verifyInstanceIdMatchStoreTypeOrParentStoreType,
    verifyInstanceSameAncestor,
} from "src/store/processing/InstanceProcessor";
import { ActionType } from "src/types/Action";
import { TIANYU_STORE_INSTANCE_BASE_ENTITY_STORE_TYPE } from "src/types/Defs";

describe("aitianyu-cn.node-module.tianyu-store.store.processing.InstanceProcessor", () => {
    const basicInstanceId = generateNewStoreInstance();

    describe("getStoreTypeMatchedInstanceId", () => {
        it("store type same as instance store type", () => {
            const insId = generateInstanceId(basicInstanceId, "test-store", "1");
            const matchedInsId = getStoreTypeMatchedInstanceId("test-store", insId);
            expect(matchedInsId.toString()).toEqual(insId.toString());
        });

        it("store type is parent of instance", () => {
            const parentIns = generateInstanceId(basicInstanceId, "test-store", "1");
            const childIns = generateInstanceId(parentIns, "test-store2", "2");

            const matchedInsId = getStoreTypeMatchedInstanceId("test-store", childIns);
            expect(matchedInsId.toString()).toEqual(parentIns.toString());
        });

        it("store type is parent of instance", () => {
            const parentIns = generateInstanceId(basicInstanceId, "test-store", "1");
            const childIns = generateInstanceId(parentIns, "test-store2", "2");

            expect(() => {
                getStoreTypeMatchedInstanceId("test-store0", childIns);
            }).toThrow();
        });
    });

    describe("verifyInstanceSameAncestor", () => {
        it("no instance id", () => {
            const entity = verifyInstanceSameAncestor();
            expect(entity).toEqual("");
        });

        it("has same ancestor", () => {
            const entityIns = generateNewStoreInstance();

            const a = generateInstanceId(entityIns, "t1", "t1");
            const b = generateInstanceId(entityIns, "t2", "t2");
            const c = generateInstanceId(a, "tt1", "tt1");

            const entity = verifyInstanceSameAncestor(a, b, c);
            expect(entity).toEqual(entityIns.entity);
        });

        it("different ancestor", () => {
            const e1 = generateNewStoreInstance();
            const e2 = generateNewStoreInstance();

            expect(() => {
                verifyInstanceSameAncestor(e1, e2);
            }).toThrow();
        });
    });

    describe("verifyInstanceIdMatchStoreTypeOrParentStoreType", () => {
        it("invalid instance id", () => {
            const ins = newInstanceId(`[{"storeType":"test-instance","entityId":"instance"}]`);
            expect(verifyInstanceIdMatchStoreTypeOrParentStoreType("tianyu-store-entity", ins)).toBeFalsy();
        });

        it("instance id matched 'tianyu-store-entity'", () => {
            const ins = generateNewStoreInstance();
            expect(verifyInstanceIdMatchStoreTypeOrParentStoreType("tianyu-store-entity", ins)).toBeTruthy();
        });

        it("instance id not matched 'tianyu-store-entity'", () => {
            const ins = generateNewStoreInstance();
            expect(verifyInstanceIdMatchStoreTypeOrParentStoreType("custom", ins)).toBeFalsy();
        });

        it("matched parent", () => {
            const root = generateNewStoreInstance();
            const parent = generateInstanceId(root, "t1", "t1");
            const child = generateInstanceId(parent, "t2", "t2");

            expect(verifyInstanceIdMatchStoreTypeOrParentStoreType("t1", child)).toBeTruthy();
        });
    });

    describe("verifyActionInstances", () => {
        it("has invalid instance id", () => {
            const ins = newInstanceId(`[{"storeType":"test-instance","entityId":"instance"}]`);
            expect(() => {
                verifyActionInstances([
                    {
                        id: "",
                        action: "",
                        storeType: "",
                        instanceId: ins,
                        params: undefined,
                        actionType: ActionType.ACTION,
                    },
                ]);
            }).toThrow();
        });

        it("redo undo action should be atom", () => {
            const ins = generateNewStoreInstance();
            expect(() => {
                verifyActionInstances([
                    {
                        id: "",
                        action: "",
                        storeType: TIANYU_STORE_INSTANCE_BASE_ENTITY_STORE_TYPE,
                        instanceId: ins,
                        params: undefined,
                        actionType: ActionType.ACTION,
                    },
                    {
                        id: "",
                        action: "",
                        storeType: "",
                        instanceId: ins,
                        params: undefined,
                        actionType: ActionType.REDO,
                    },
                ]);
            }).toThrow();
            expect(() => {
                verifyActionInstances([
                    {
                        id: "",
                        action: "",
                        storeType: TIANYU_STORE_INSTANCE_BASE_ENTITY_STORE_TYPE,
                        instanceId: ins,
                        params: undefined,
                        actionType: ActionType.ACTION,
                    },
                    {
                        id: "",
                        action: "",
                        storeType: "",
                        instanceId: ins,
                        params: undefined,
                        actionType: ActionType.UNDO,
                    },
                ]);
            }).toThrow();
        });

        it("entity creation & destroy action should be atom", () => {
            const ins = generateNewStoreInstance();
            expect(() => {
                verifyActionInstances([
                    {
                        id: "",
                        action: "",
                        storeType: TIANYU_STORE_INSTANCE_BASE_ENTITY_STORE_TYPE,
                        instanceId: ins,
                        params: undefined,
                        actionType: ActionType.ACTION,
                    },
                    {
                        id: "",
                        action: "",
                        storeType: TIANYU_STORE_INSTANCE_BASE_ENTITY_STORE_TYPE,
                        instanceId: ins,
                        params: undefined,
                        actionType: ActionType.CREATE,
                    },
                ]);
            }).toThrow();
            expect(() => {
                verifyActionInstances([
                    {
                        id: "",
                        action: "",
                        storeType: TIANYU_STORE_INSTANCE_BASE_ENTITY_STORE_TYPE,
                        instanceId: ins,
                        params: undefined,
                        actionType: ActionType.ACTION,
                    },
                    {
                        id: "",
                        action: "",
                        storeType: TIANYU_STORE_INSTANCE_BASE_ENTITY_STORE_TYPE,
                        instanceId: ins,
                        params: undefined,
                        actionType: ActionType.DESTROY,
                    },
                ]);
            }).toThrow();
        });
    });
});
