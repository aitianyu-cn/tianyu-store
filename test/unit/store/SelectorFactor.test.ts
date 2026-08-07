/** @format */

import { SelectorFactor } from "src/store/SelectorFactor";
import { SelectorType } from "src/types/Selector";

describe("aitianyu-cn.node-module.tianyu-store.store.SelectorFactor", () => {
    it("makeSelector", () => {
        const rawSelector = function (_state: any) {
            return true;
        };
        const selector = SelectorFactor.makeSelector(rawSelector);
        expect(selector.getter).toBe(rawSelector);
    });

    it("makeParameterSelector", () => {
        const rawSelector = function (_state: any, params: any) {
            return true;
        };
        const selector = SelectorFactor.makeParameterSelector(rawSelector);
        expect(selector.getter).toBe(rawSelector);
    });

    it("makeConstantSelector", () => {
        const rawSelector = function () {
            return [1, 2, 3];
        };
        const selector = SelectorFactor.makeConstantSelector(rawSelector);
        expect(selector.getter).toBe(rawSelector);
    });

    it("makeVirtualSelector", () => {
        const selector = SelectorFactor.makeVirtualSelector();
        expect(selector.getter).toThrow();
    });

    it("makeVirtualParameterSelector", () => {
        const selector = SelectorFactor.makeVirtualParameterSelector();
        expect(selector.getter).toThrow();
    });

    it("makeVirtualConstantSelector", () => {
        const selector = SelectorFactor.makeVirtualConstantSelector();
        expect(selector.getter).toThrow();
    });

    it("makeVirtualMxingSelector", () => {
        const selector = SelectorFactor.makeVirtualMxingSelector();
        expect(selector.resultGenerator).toThrow();
    });

    it("makeVirtualRestrictSelector", () => {
        const selector = SelectorFactor.makeVirtualRestrictSelector();
        expect(selector.type).toEqual(SelectorType.RESTRICT);
    });
});
