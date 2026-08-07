/** @format */

import { generateInstanceId } from "src/InstanceId";
import { MessageBundle } from "src/infra/Message";
import { InstanceIdImpl } from "src/store/impl/InstanceIdImpl";
import { InstanceParentHolder } from "src/store/modules/InstanceParentHolder";
import { TIANYU_STORE_INSTANCE_BASE_ENTITY_STORE_TYPE } from "src/types/Defs";
import { IStoreSystemInstanceMap } from "src/types/Store";

describe("aitianyu-cn.node-module.tianyu-store.store.modules.InstanceParentHolder", () => {
    const holder = new InstanceParentHolder();
    const instanceMap: IStoreSystemInstanceMap = {
        parentMap: {},
        childrenMap: {},
    };

    beforeEach(() => {
        instanceMap.childrenMap = {};
        instanceMap.parentMap = {};
        holder.discardChanges();
    });

    describe("createInstance", () => {
        it("create root", () => {
            const instanceId = new InstanceIdImpl([
                { storeType: TIANYU_STORE_INSTANCE_BASE_ENTITY_STORE_TYPE, entityId: "instance" },
                { storeType: "store", entityId: "instance2" },
            ]);

            holder.createInstance(instanceId, instanceMap);

            expect(instanceMap.childrenMap[instanceId.toString()]).toBeDefined();

            const parent = instanceMap.parentMap[instanceId.toString()];
            expect(parent).toBeNull();
        });

        it("parent not exist, throw error", () => {
            const instanceId = new InstanceIdImpl([
                { storeType: TIANYU_STORE_INSTANCE_BASE_ENTITY_STORE_TYPE, entityId: "instance" },
                { storeType: "store", entityId: "instance2" },
                { storeType: "excel", entityId: "instance3" },
            ]);

            expect(() => {
                holder.createInstance(instanceId, instanceMap);
            }).toThrow(MessageBundle.getText("CREATE_INSTANCE_PARENT_NOT_INIT", instanceId.toString()));
        });

        it("create hierarchy", () => {
            const instanceId = new InstanceIdImpl([
                { storeType: TIANYU_STORE_INSTANCE_BASE_ENTITY_STORE_TYPE, entityId: "instance" },
                { storeType: "store", entityId: "instance2" },
            ]);

            holder.createInstance(instanceId, instanceMap);
            expect(instanceMap.childrenMap[instanceId.toString()]).toBeDefined();
            expect(instanceMap.parentMap[instanceId.toString()]).toBeNull();

            const childInstance = generateInstanceId(instanceId, "excel");
            holder.createInstance(childInstance, instanceMap);
            expect(instanceMap.childrenMap[childInstance.toString()]).toBeDefined();
            expect(instanceMap.parentMap[childInstance.toString()]).toEqual(instanceId.toString());
            expect(instanceMap.childrenMap[instanceId.toString()]?.includes(childInstance.toString())).toBeTruthy();
        });
    });

    describe("removeInstance", () => {
        const instanceId = new InstanceIdImpl([
            { storeType: TIANYU_STORE_INSTANCE_BASE_ENTITY_STORE_TYPE, entityId: "instance" },
            { storeType: "store", entityId: "instance2" },
        ]);

        const child1 = generateInstanceId(instanceId, "excel");
        const leaf11 = generateInstanceId(child1, "cell");
        const leaf12 = generateInstanceId(child1, "cell");
        const leaf13 = generateInstanceId(child1, "cell");

        const child2 = generateInstanceId(instanceId, "excel");
        const leaf21 = generateInstanceId(child2, "cell");
        const leaf22 = generateInstanceId(child2, "cell");
        const leaf23 = generateInstanceId(child2, "cell");
        const leaf24 = generateInstanceId(child2, "cell");
        beforeEach(() => {
            holder.createInstance(instanceId, instanceMap);
            holder.createInstance(child1, instanceMap);
            holder.createInstance(child2, instanceMap);
            holder.createInstance(leaf11, instanceMap);
            holder.createInstance(leaf12, instanceMap);
            holder.createInstance(leaf13, instanceMap);
            holder.createInstance(leaf21, instanceMap);
            holder.createInstance(leaf22, instanceMap);
            holder.createInstance(leaf23, instanceMap);
            holder.createInstance(leaf24, instanceMap);
        });

        it("remove parent", () => {
            const removed = holder.removeInstance(child2.toString(), instanceMap);
            expect(removed.includes(child2.toString())).toBeTruthy();
            expect(removed.includes(leaf21.toString())).toBeTruthy();
            expect(removed.includes(leaf22.toString())).toBeTruthy();
            expect(removed.includes(leaf23.toString())).toBeTruthy();
            expect(removed.includes(leaf24.toString())).toBeTruthy();

            expect(holder["removed"].root).toEqual(instanceId.toString());
            expect(holder["removed"].parent).toEqual(child2.toString());
        });
    });

    describe("applyChanges", () => {
        const instanceId = new InstanceIdImpl([
            { storeType: TIANYU_STORE_INSTANCE_BASE_ENTITY_STORE_TYPE, entityId: "instance" },
            { storeType: "store", entityId: "instance2" },
        ]);

        const child1 = generateInstanceId(instanceId, "excel");
        const leaf11 = generateInstanceId(child1, "cell");
        const leaf12 = generateInstanceId(child1, "cell");
        const leaf13 = generateInstanceId(child1, "cell");

        const child2 = generateInstanceId(instanceId, "excel");
        const leaf21 = generateInstanceId(child2, "cell");
        const leaf22 = generateInstanceId(child2, "cell");
        const leaf23 = generateInstanceId(child2, "cell");
        const leaf24 = generateInstanceId(child2, "cell");
        beforeEach(() => {
            holder.createInstance(instanceId, instanceMap);
            holder.createInstance(child1, instanceMap);
            holder.createInstance(child2, instanceMap);
            holder.createInstance(leaf11, instanceMap);
            holder.createInstance(leaf12, instanceMap);
            holder.createInstance(leaf13, instanceMap);
            holder.createInstance(leaf21, instanceMap);
            holder.createInstance(leaf22, instanceMap);
            holder.createInstance(leaf23, instanceMap);
            holder.createInstance(leaf24, instanceMap);
        });

        it("remove parent", () => {
            holder.removeInstance(child2.toString(), instanceMap);
            holder.applyChanges(instanceMap);

            expect(instanceMap.parentMap[child2.toString()]).toBeUndefined();
            expect(instanceMap.parentMap[leaf21.toString()]).toBeUndefined();
            expect(instanceMap.parentMap[leaf22.toString()]).toBeUndefined();
            expect(instanceMap.parentMap[leaf23.toString()]).toBeUndefined();
            expect(instanceMap.parentMap[leaf24.toString()]).toBeUndefined();

            const children = instanceMap.childrenMap[instanceId.toString()];
            expect(children).toBeDefined();
            expect(children).toEqual([child1.toString()]);
        });
    });
});
