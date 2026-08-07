/** @format */

import { ActionFactor } from "src/store/ActionFactor";
import { SelectorFactor } from "src/store/SelectorFactor";
import { registerExpose, registerInterface, registerTemplate } from "src/utils/InterfaceUtils";

describe("aitianyu-cn.node-module.tianyu-store.utils.InterfaceUtils", () => {
    describe("registerExpose", () => {
        it("provides store type", () => {
            const storeInterface = {
                core: {
                    creator: ActionFactor.makeCreateStoreAction(),
                    destroy: ActionFactor.makeDestroyStoreAction(),
                },
                common: {
                    getter: {
                        get: SelectorFactor.makeSelector(function (state) {
                            return true;
                        }),
                    },
                    setter: {
                        set: ActionFactor.makeVirtualAction(),
                    },
                },
                unused: undefined,
            };

            registerExpose(storeInterface, "store");

            expect(storeInterface.core.creator.info.fullName).toEqual("store.core.creator");
            expect(storeInterface.core.destroy.info.fullName).toEqual("store.core.destroy");
            expect(storeInterface.common.getter.get.info.fullName).toEqual("store.common.getter.get");
            expect(storeInterface.common.setter.set.info.fullName).toEqual("store.common.setter.set");
        });

        it("does not provide store type", () => {
            const storeInterface = {
                core: {
                    creator: ActionFactor.makeCreateStoreAction(),
                    destroy: ActionFactor.makeDestroyStoreAction(),
                },
                common: {
                    getter: {
                        get: SelectorFactor.makeSelector(function (state) {
                            return true;
                        }),
                    },
                    setter: {
                        set: ActionFactor.makeVirtualAction(),
                    },
                },
                unused: undefined,
            };

            registerExpose(storeInterface, "");

            expect(storeInterface.core.creator.info.fullName).toEqual("core.creator");
            expect(storeInterface.core.destroy.info.fullName).toEqual("core.destroy");
            expect(storeInterface.common.getter.get.info.fullName).toEqual("common.getter.get");
            expect(storeInterface.common.setter.set.info.fullName).toEqual("common.setter.set");
        });
    });

    it("registerInterface", () => {
        const storeInterface = {
            core: {
                creator: ActionFactor.makeCreateStoreAction(),
                destroy: ActionFactor.makeDestroyStoreAction(),
            },
            common: {
                getter: {
                    get: SelectorFactor.makeSelector(function (state) {
                        return true;
                    }),
                },
                setter: {
                    set: ActionFactor.makeVirtualAction(),
                },
            },
            unused: undefined,
        };

        const interfaceList = registerInterface(storeInterface, "store");

        expect(storeInterface.core.creator.info.fullName).toEqual("store.core.creator");
        expect(storeInterface.core.destroy.info.fullName).toEqual("store.core.destroy");
        expect(storeInterface.common.getter.get.info.fullName).toEqual("store.common.getter.get");
        expect(storeInterface.common.setter.set.info.fullName).toEqual("store.common.setter.set");

        const keys = Object.keys(interfaceList);
        expect(keys.length).toEqual(4);
        expect(keys.includes("store.core.creator")).toBeTruthy();
        expect(keys.includes("store.core.destroy")).toBeTruthy();
        expect(keys.includes("store.common.getter.get")).toBeTruthy();
        expect(keys.includes("store.common.setter.set")).toBeTruthy();
    });

    it("registerTemplate", () => {
        const storeTemplate = {
            common: {
                getter: {
                    get: SelectorFactor.makeSelector(function (state) {
                        return true;
                    }),
                },
                setter: {
                    set: ActionFactor.makeVirtualAction(),
                },
            },
            unused: undefined,
        };

        registerTemplate(storeTemplate);

        expect(storeTemplate.common.getter.get.info.fullName).toEqual("common.getter.get");
        expect(storeTemplate.common.getter.get.info.template).toBeTruthy();
        expect(storeTemplate.common.setter.set.info.fullName).toEqual("common.setter.set");
        expect(storeTemplate.common.setter.set.info.template).toBeTruthy();
    });
});
