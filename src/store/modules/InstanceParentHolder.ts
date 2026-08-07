/** @format */

import { InstanceId } from "src/types/InstanceId";
import { InstanceIdImpl } from "../impl/InstanceIdImpl";
import { MessageBundle } from "src/infra/Message";
import { IStoreSystemInstanceMap } from "src/types/Store";

interface IRemovedInstanceCache {
    // It is the parent of removed first instance
    root: string;
    // the first removed instance
    parent: string;
    instances: string[];
}

export class InstanceParentHolder {
    private removed: IRemovedInstanceCache;

    public constructor() {
        this.removed = {
            root: "",
            parent: "",
            instances: [],
        };
    }

    public createInstance(instanceId: InstanceId, instanceMap: IStoreSystemInstanceMap): void {
        const parent = instanceId.parent;

        const instanceIdString = instanceId.toString();
        if (InstanceIdImpl.isAncestor(parent)) {
            // parent is ancestor, raw instance should be root node
            instanceMap.parentMap[instanceIdString] = null;
        } else {
            // should check parent
            const parentInstanceString = parent.toString();
            const childrenList = instanceMap.childrenMap[parentInstanceString];
            if (!childrenList) {
                throw new Error(MessageBundle.getText("CREATE_INSTANCE_PARENT_NOT_INIT", instanceIdString));
            }

            childrenList.push(instanceIdString);

            // set parent relations
            instanceMap.parentMap[instanceIdString] = parentInstanceString;
        }

        // always set child list
        instanceMap.childrenMap[instanceIdString] = [];
    }

    public applyChanges(instanceMap: IStoreSystemInstanceMap): void {
        for (const item of this.removed.instances) {
            instanceMap.childrenMap[item] !== undefined && delete instanceMap.childrenMap[item];
            instanceMap.parentMap[item] !== undefined && delete instanceMap.parentMap[item];
        }

        const rootChildren = instanceMap.childrenMap[this.removed.root];
        if (rootChildren) {
            rootChildren.splice(rootChildren.indexOf(this.removed.parent), 1);
        }

        this.removed = {
            root: "",
            parent: "",
            instances: [],
        };
    }

    public discardChanges(): void {
        this.removed = {
            root: "",
            parent: "",
            instances: [],
        };
    }

    public removeInstance(instanceId: string, instanceMap: IStoreSystemInstanceMap): string[] {
        const parentInstanceIdString = instanceMap.parentMap[instanceId] || "";

        const removedChildren = [instanceId, ...this.removeChild(instanceId, instanceMap)];

        this.removed = {
            root: parentInstanceIdString,
            parent: instanceId,
            instances: removedChildren,
        };

        return removedChildren;
    }

    private removeChild(instanceId: string, instanceMap: IStoreSystemInstanceMap): string[] {
        const instances: string[] = [];

        const childrens = instanceMap.childrenMap[instanceId] || [];
        for (const child of childrens) {
            // remove all children
            const removedChildren = this.removeChild(child, instanceMap);

            instances.push(child);
            instances.push(...removedChildren);
        }

        return instances;
    }
}
