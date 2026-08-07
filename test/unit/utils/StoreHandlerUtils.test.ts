/** @format */

import { generateInstanceId } from "src/InstanceId";
import { ActionType, IInstanceAction } from "src/types/Action";
import { IInstanceSelector } from "src/types/Selector";
import { StoreHandleType } from "src/types/StoreHandler";
import {
    doAction,
    doSelector,
    doReadExternal,
    doActionWithActioName,
    doSelectorWithThrow,
} from "src/utils/StoreHandlerUtils";

describe("aitianyu-cn.node-module.tianyu-store.utils.StoreHandlerUtils", () => {
    describe("doActionWithActioName", () => {
        it("-", () => {
            const iterator = doActionWithActioName("test", "add", generateInstanceId("", ""));
            let result = iterator.next();
            if (!result.done) {
                result = iterator.next(result.value);
            }

            const finalValue = result.value;
            expect(finalValue.type).toBe(StoreHandleType.ACTION);
            expect(finalValue.action.action).toEqual("test.add");
        });
    });

    describe("doAction", () => {
        it("-", () => {
            const action: IInstanceAction<any> = {
                id: "",
                action: "",
                storeType: "",
                instanceId: generateInstanceId("", ""),
                params: undefined,
                actionType: ActionType.ACTION,
            };

            const iterator = doAction(action);
            let result = iterator.next();
            if (!result.done) {
                result = iterator.next(result.value);
            }

            const finalValue = result.value;
            expect(finalValue.type).toBe(StoreHandleType.ACTION);
            expect(finalValue.action).toEqual(action);
        });
    });

    describe("doSelector", () => {
        it("-", () => {
            const selector: IInstanceSelector<any> = {
                instanceId: generateInstanceId("", ""),
                id: "",
                selector: "",
                storeType: "",
                params: undefined,
            };

            const iterator = doSelector(selector);
            let result = iterator.next();
            if (!result.done) {
                result = iterator.next(result.value);
            }

            const finalValue = result.value;
            expect(finalValue.type).toBe(StoreHandleType.SELECTOR);
            expect(finalValue.selector).toEqual(selector);
            expect(finalValue.shouldThrow).toBeFalsy();
        });
    });

    describe("doSelectorWithThrow", () => {
        it("-", () => {
            const selector: IInstanceSelector<any> = {
                instanceId: generateInstanceId("", ""),
                id: "",
                selector: "",
                storeType: "",
                params: undefined,
            };

            const iterator = doSelectorWithThrow(selector);
            let result = iterator.next();
            if (!result.done) {
                result = iterator.next(result.value);
            }

            const finalValue = result.value;
            expect(finalValue.type).toBe(StoreHandleType.SELECTOR);
            expect(finalValue.selector).toEqual(selector);
            expect(finalValue.shouldThrow).toBeTruthy();
        });
    });

    describe("doReadExternal", () => {
        it("-", () => {
            const handler = function () {};

            const iterator = doReadExternal<any>(handler);
            let result = iterator.next();
            if (!result.done) {
                result = iterator.next(result.value);
            }

            const finalValue = result.value;
            expect(finalValue.type).toBe(StoreHandleType.EXTERNAL_OBJ);
            expect(finalValue.handler).toEqual(handler);
        });
    });
});
