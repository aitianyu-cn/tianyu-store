/** @format */

import { generateInstanceId } from "beta/InstanceId";
import { parameterSelectorCreator, selectorCreator } from "beta/common/SelectorHelper";

describe("aitianyu-cn.node-module.tianyu-store.beta.common.SelectorHelper", () => {
    it("selectorCreator", () => {
        const rawSelector = function (state: any) {
            return true;
        };

        const selector = selectorCreator(rawSelector);
        expect(selector.id).not.toEqual("");
        expect(selector.getter).toBe(rawSelector);

        const instanceId = generateInstanceId("", "");
        const selectorInstance = selector(instanceId);
        expect(selectorInstance.id).toEqual(selector.selector);
        expect(selectorInstance.params).toBeUndefined();
    });

    it("parameterSelectorCreator", () => {
        const rawSelector = function (state: any, params: any) {
            return true;
        };

        const selector = parameterSelectorCreator(rawSelector);
        expect(selector.id).not.toEqual("");
        expect(selector.getter).toBe(rawSelector);

        const instanceId = generateInstanceId("", "");
        const selectorInstance = selector(instanceId, {});
        expect(selectorInstance.id).toEqual(selector.selector);
        expect(selectorInstance.params).toBeDefined();
    });
});
