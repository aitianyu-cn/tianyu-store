/** @format */

import { isChangesEmpty, parseJsonString } from "src/utils/ObjectUtils";

describe("aitianyu-cn.node-module.tianyu-store.utils.ObjectUtils.test", () => {
    describe("parseJsonString", () => {
        it("parse success", () => {
            const result = parseJsonString("[123,234]");
            expect(Array.isArray(result)).toBeTruthy();
            expect(result.length).toBe(2);
            expect(result[0]).toEqual(123);
            expect(result[1]).toEqual(234);
        });

        it("parse has error", () => {
            const result = parseJsonString("a");
            expect(result).toBeUndefined();
        });
    });

    describe("isChangesEmpty", () => {
        it("-", () => {
            expect(isChangesEmpty({})).toBeTruthy();
            expect(
                isChangesEmpty({
                    test: {},
                }),
            ).toBeFalsy();
        });
    });
});
