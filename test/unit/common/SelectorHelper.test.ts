/** @format */

import { generateInstanceId } from "src/InstanceId";
import { parameterSelectorCreator, selectorCreator } from "src/common/SelectorHelper";
import { SelectorFactor } from "src/store/SelectorFactor";

describe("aitianyu-cn.node-module.tianyu-store.common.SelectorHelper", () => {
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

    describe("mixingSelectorCreator", () => {
        const fnCreateSelector = () => {
            return selectorCreator((_state: any) => {
                return {} as any;
            });
        };
        it("selectors in array", () => {
            const selectors = [fnCreateSelector(), fnCreateSelector()];
            const resultGenerator = function (selectors: any[]) {};
            const mixSelector = SelectorFactor.makeMixingSelector(selectors, resultGenerator);
            expect(mixSelector.id).not.toEqual("");
            expect(mixSelector.getters).toEqual(selectors.map((selector) => selector.info));
            expect(mixSelector.resultGenerator).toEqual(resultGenerator);

            const instanceId = generateInstanceId("", "");
            const selectorInstance = mixSelector(instanceId);
            expect(selectorInstance.id).toEqual(mixSelector.id);
        });

        it("flat selectors", () => {
            const resultGenerator = function (_selectorA: any, _selectorB: any) {};
            const mixSelector = SelectorFactor.makeMixingSelector(
                fnCreateSelector(),
                fnCreateSelector(),
                resultGenerator,
            );
            expect(mixSelector.id).not.toEqual("");
            expect(mixSelector.getters.length).toEqual(2);
            expect(mixSelector.resultGenerator).toEqual(resultGenerator);

            const instanceId = generateInstanceId("", "");
            const selectorInstance = mixSelector(instanceId);
            expect(selectorInstance.id).toEqual(mixSelector.id);
        });
    });

    it("restrictSelectorCreator", () => {
        const fromSelector = SelectorFactor.makeParameterSelector((_state, param: boolean) => {
            return param;
        });
        const toSelector = SelectorFactor.makeParameterSelector((_state, param: boolean) => {
            return Number(param ? 1 : 0);
        });
        const restrictSelector = SelectorFactor.makeRestrictSelector(fromSelector, toSelector);

        expect(restrictSelector.id).not.toEqual("");

        const instanceId = generateInstanceId("", "");
        const selectorInstance = restrictSelector(instanceId);
        expect(selectorInstance.id).toEqual(restrictSelector.id);
    });
});
