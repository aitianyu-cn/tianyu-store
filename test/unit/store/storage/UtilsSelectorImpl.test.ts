/** @format */

import { ConvertAnyToBoolean } from "src/store/storage/UtilsSelectorImpl";

describe("aitianyu-cn.node-module.tianyu-store.store.storage.UtilsSelectorImpl", () => {
    it("ConvertAnyToBoolean", () => {
        expect(ConvertAnyToBoolean.getter({}, "true")).toBeTruthy();
        expect(ConvertAnyToBoolean.getter({}, "false")).toBeFalsy();
    });
});
