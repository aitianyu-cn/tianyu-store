/** @format */

import { generateInstanceId } from "src/InstanceId";
import { TianyuStoreEntityExpose, TianyuStoreRedoUndoExpose } from "src/InterfacesExpose";
import { generateNewStoreInstance } from "src/Store";
import { STORE_STATE_INSTANCE } from "src/store/storage/interface/StoreState";
import { Missing } from "src/types/Model";
import { createBatchAction } from "src/utils/BatchActionUtils";
import {
    TestPageStateInterface,
    TestPageStateStoreType,
    TestTestStateInterface,
    TestTestStateStoreType,
    TestUserStateInterface,
    TestUserStateStoreType,
    USER_CONNECTION_EXTERNAL_OBJ,
    USER_OPTIONS_EXTERNAL_OBJ,
} from "test/unit/content/DispatchingTestContent";
import { TianyuStore } from "test/unit/content/DispatchingTestPrepare";

describe("aitianyu-cn.node-module.tianyu-store.store.processing.Dispatching", () => {
    const ancestorInstanceId = generateNewStoreInstance();

    beforeAll(async () => {
        await TianyuStore.dispatch(TianyuStoreEntityExpose.core.creator(ancestorInstanceId));
        expect((TianyuStore as any).entityMap.size).toEqual(1);
    });

    afterAll(async () => {
        await TianyuStore.dispatch(TianyuStoreEntityExpose.core.destroy(ancestorInstanceId));
        expect((TianyuStore as any).entityMap.size).toEqual(0);
    });

    describe("workflow test", () => {
        const userEntityInstanceId = generateInstanceId(ancestorInstanceId, TestUserStateStoreType);
        const pageEntityInstanceId = generateInstanceId(ancestorInstanceId, TestPageStateStoreType);

        beforeAll(async () => {
            await TianyuStore.dispatch(
                createBatchAction([
                    TestUserStateInterface.core.creator(userEntityInstanceId),
                    TestPageStateInterface.core.creator(pageEntityInstanceId),
                    TestUserStateInterface.action.userLifecycleCreateAction(userEntityInstanceId),
                ]),
            );

            const entity = (TianyuStore as any).entityMap.get(ancestorInstanceId.entity);
            expect(entity).toBeDefined();
            expect(
                entity.storeState[STORE_STATE_INSTANCE][TestUserStateStoreType][userEntityInstanceId.toString()],
            ).toBeDefined();
            expect(
                entity.storeState[STORE_STATE_INSTANCE][TestPageStateStoreType][pageEntityInstanceId.toString()],
            ).toBeDefined();

            expect(() => {
                const register = entity.getExternalRegister(userEntityInstanceId);
                expect(register.get(USER_CONNECTION_EXTERNAL_OBJ)).toBeDefined();
                expect(register.get(USER_OPTIONS_EXTERNAL_OBJ)).toBeDefined();
            }).not.toThrow();
        });

        afterAll(async () => {
            await TianyuStore.dispatch(
                createBatchAction([
                    TestUserStateInterface.action.userLifecycleDestroyAction(userEntityInstanceId),
                    TestUserStateInterface.core.destroy(userEntityInstanceId),
                    TestPageStateInterface.core.destroy(pageEntityInstanceId),
                ]),
            );

            const entity = (TianyuStore as any).entityMap.get(ancestorInstanceId.entity);
            expect(entity).toBeDefined();
            expect(
                entity.storeState[STORE_STATE_INSTANCE][TestUserStateStoreType][userEntityInstanceId.toString()],
            ).toBeUndefined();
            expect(
                entity.storeState[STORE_STATE_INSTANCE][TestPageStateStoreType][pageEntityInstanceId.toString()],
            ).toBeUndefined();

            expect(() => {
                const register = entity.getExternalRegister(userEntityInstanceId);
                expect(register.get(USER_CONNECTION_EXTERNAL_OBJ)).toBeUndefined();
                expect(register.get(USER_OPTIONS_EXTERNAL_OBJ)).toBeUndefined();
            }).not.toThrow();
        });

        it("test given wrong user", async () => {
            await TianyuStore.dispatch(
                TestUserStateInterface.action.userLogonAction(userEntityInstanceId, { user: "wrong-user" }),
            );

            const logon = TianyuStore.selecte(TestUserStateInterface.selector.isUserLogon(userEntityInstanceId));
            expect(logon instanceof Missing).toBeFalsy();
            expect(logon).toBeFalsy();
        });

        it("test correct user", async () => {
            await TianyuStore.dispatch(
                TestUserStateInterface.action.userLogonAction(userEntityInstanceId, { user: "admin" }),
            );

            const logon = TianyuStore.selecte(TestUserStateInterface.selector.isUserLogon(userEntityInstanceId));
            expect(logon instanceof Missing).toBeFalsy();
            expect(logon).toBeTruthy();
        });

        it("test for getting option", async () => {
            await TianyuStore.dispatch(TestUserStateInterface.action.userGetOptionAction(userEntityInstanceId));

            expect(
                TianyuStore.selecte(TestUserStateInterface.selector.getUserOperations(userEntityInstanceId)),
            ).toEqual(["Home", "Setting", "Help", "Theme", "Language"]);
        });

        it("test for getting user status", () => {
            const status = TianyuStore.selecte(TestUserStateInterface.selector.getUserStatus(userEntityInstanceId));
            expect(status instanceof Missing).toBeFalsy();

            expect(
                (
                    status as {
                        user: string;
                        logon: boolean;
                        token: string;
                    }
                ).user,
            ).toEqual("admin");
            expect(
                (
                    status as {
                        user: string;
                        logon: boolean;
                        token: string;
                    }
                ).logon,
            ).toBeTruthy();
        });

        it("test for getting user info", () => {
            const info = TianyuStore.selecte(TestUserStateInterface.selector.getUserInfo(userEntityInstanceId));
            expect(info instanceof Missing).toBeFalsy();

            expect(
                (
                    info as {
                        operations: string[];
                        user: string;
                        logon: boolean;
                        token: string;
                    }
                ).operations,
            ).toEqual(["Home", "Setting", "Help", "Theme", "Language"]);
        });

        it("test for store type is not matched in instance id", async () => {
            jest.spyOn(TianyuStore as any, "error");

            await TianyuStore.dispatch(
                TestUserStateInterface.action.userLogonAction(pageEntityInstanceId, { user: "admin" }),
            );

            expect((TianyuStore as any).error).toHaveBeenCalled();
        });

        describe("redo undo test", () => {
            const testEntityInstanceId1 = generateInstanceId(ancestorInstanceId, TestTestStateStoreType);
            const testEntityInstanceId2 = generateInstanceId(ancestorInstanceId, TestTestStateStoreType);

            it("change page and create instance", async () => {
                expect(
                    TianyuStore.selecteWithThrow(
                        TianyuStoreEntityExpose.selector.getInstanceExist(
                            testEntityInstanceId1.ancestor,
                            testEntityInstanceId1,
                        ),
                    ),
                ).toBeFalsy();
                expect(
                    TianyuStore.selecteWithThrow(
                        TianyuStoreEntityExpose.selector.getInstanceExist(
                            testEntityInstanceId2.ancestor,
                            testEntityInstanceId2,
                        ),
                    ),
                ).toBeFalsy();

                await TianyuStore.dispatch(
                    TestPageStateInterface.action.pageIndexChangeAction(pageEntityInstanceId, { page: 2 }),
                );
                await TianyuStore.dispatch(TestTestStateInterface.core.creator(testEntityInstanceId2));
                expect(
                    TianyuStore.selecte(TestPageStateInterface.selector.getCurrentPage(pageEntityInstanceId)),
                ).toEqual(2);
                expect(
                    TianyuStore.selecteWithThrow(
                        TianyuStoreEntityExpose.selector.getInstanceExist(
                            testEntityInstanceId1.ancestor,
                            testEntityInstanceId1,
                        ),
                    ),
                ).toBeFalsy();
                expect(
                    TianyuStore.selecteWithThrow(
                        TianyuStoreEntityExpose.selector.getInstanceExist(
                            testEntityInstanceId2.ancestor,
                            testEntityInstanceId2,
                        ),
                    ),
                ).toBeTruthy();

                await TianyuStore.dispatch(
                    createBatchAction([
                        TestPageStateInterface.action.pageIndexChangeAction(pageEntityInstanceId, { page: 3 }),
                        TestTestStateInterface.core.creator(testEntityInstanceId1),
                        TestTestStateInterface.core.destroy(testEntityInstanceId2),
                    ]),
                );
                expect(
                    TianyuStore.selecte(TestPageStateInterface.selector.getCurrentPage(pageEntityInstanceId)),
                ).toEqual(3);
                expect(
                    TianyuStore.selecteWithThrow(
                        TianyuStoreEntityExpose.selector.getInstanceExist(
                            testEntityInstanceId1.ancestor,
                            testEntityInstanceId1,
                        ),
                    ),
                ).toBeTruthy();
                expect(
                    TianyuStore.selecteWithThrow(
                        TianyuStoreEntityExpose.selector.getInstanceExist(
                            testEntityInstanceId2.ancestor,
                            testEntityInstanceId2,
                        ),
                    ),
                ).toBeFalsy();
            });

            it("undo", async () => {
                expect(
                    TianyuStore.selecte(TianyuStoreRedoUndoExpose.stack.getRedoAvailable(ancestorInstanceId)),
                ).toBeFalsy();
                expect(
                    TianyuStore.selecte(TianyuStoreRedoUndoExpose.stack.getUndoAvailable(ancestorInstanceId)),
                ).toBeTruthy();
                expect(
                    TianyuStore.selecte(TianyuStoreRedoUndoExpose.stack.getRedoUndoEnabled(ancestorInstanceId)),
                ).toBeTruthy();

                await TianyuStore.dispatch(TianyuStoreRedoUndoExpose.stack.undoAction(ancestorInstanceId));

                expect(
                    TianyuStore.selecte(TestPageStateInterface.selector.getCurrentPage(pageEntityInstanceId)),
                ).toEqual(2);
                expect(
                    TianyuStore.selecte(TianyuStoreRedoUndoExpose.stack.getRedoAvailable(ancestorInstanceId)),
                ).toBeTruthy();
                expect(
                    TianyuStore.selecte(TianyuStoreRedoUndoExpose.stack.getUndoAvailable(ancestorInstanceId)),
                ).toBeTruthy();

                expect(
                    TianyuStore.selecteWithThrow(
                        TianyuStoreEntityExpose.selector.getInstanceExist(
                            testEntityInstanceId1.ancestor,
                            testEntityInstanceId1,
                        ),
                    ),
                ).toBeFalsy();
                expect(
                    TianyuStore.selecteWithThrow(
                        TianyuStoreEntityExpose.selector.getInstanceExist(
                            testEntityInstanceId2.ancestor,
                            testEntityInstanceId2,
                        ),
                    ),
                ).toBeTruthy();
            });

            it("redo", async () => {
                expect(
                    TianyuStore.selecte(TianyuStoreRedoUndoExpose.stack.getRedoAvailable(ancestorInstanceId)),
                ).toBeTruthy();
                expect(
                    TianyuStore.selecte(TianyuStoreRedoUndoExpose.stack.getUndoAvailable(ancestorInstanceId)),
                ).toBeTruthy();

                await TianyuStore.dispatch(TianyuStoreRedoUndoExpose.stack.redoAction(ancestorInstanceId));

                expect(
                    TianyuStore.selecte(TestPageStateInterface.selector.getCurrentPage(pageEntityInstanceId)),
                ).toEqual(3);
                expect(
                    TianyuStore.selecte(TianyuStoreRedoUndoExpose.stack.getRedoAvailable(ancestorInstanceId)),
                ).toBeFalsy();
                expect(
                    TianyuStore.selecte(TianyuStoreRedoUndoExpose.stack.getUndoAvailable(ancestorInstanceId)),
                ).toBeTruthy();

                expect(
                    TianyuStore.selecteWithThrow(
                        TianyuStoreEntityExpose.selector.getInstanceExist(
                            testEntityInstanceId1.ancestor,
                            testEntityInstanceId1,
                        ),
                    ),
                ).toBeTruthy();
                expect(
                    TianyuStore.selecteWithThrow(
                        TianyuStoreEntityExpose.selector.getInstanceExist(
                            testEntityInstanceId2.ancestor,
                            testEntityInstanceId2,
                        ),
                    ),
                ).toBeFalsy();
            });

            it("clean stack", async () => {
                await TianyuStore.dispatch(TianyuStoreRedoUndoExpose.stack.cleanStackAction(ancestorInstanceId));

                expect(
                    TianyuStore.selecte(TianyuStoreRedoUndoExpose.stack.getRedoAvailable(ancestorInstanceId)),
                ).toBeFalsy();
                expect(
                    TianyuStore.selecte(TianyuStoreRedoUndoExpose.stack.getUndoAvailable(ancestorInstanceId)),
                ).toBeFalsy();
            });
        });
    });

    describe("entity exist api test", () => {
        const firstUserEntityInstanceId = generateInstanceId(ancestorInstanceId, TestUserStateStoreType);
        const secondUserEntityInstanceId = generateInstanceId(ancestorInstanceId, TestUserStateStoreType);

        beforeAll(async () => {
            await TianyuStore.dispatch(TestUserStateInterface.core.creator(firstUserEntityInstanceId));

            const entity = (TianyuStore as any).entityMap.get(ancestorInstanceId.entity);
            expect(entity).toBeDefined();
            expect(
                entity.storeState[STORE_STATE_INSTANCE][TestUserStateStoreType][firstUserEntityInstanceId.toString()],
            ).toBeDefined();
        });

        afterAll(async () => {
            await TianyuStore.dispatch(TestUserStateInterface.core.destroy(firstUserEntityInstanceId));

            const entity = (TianyuStore as any).entityMap.get(ancestorInstanceId.entity);
            expect(entity).toBeDefined();
            expect(
                entity.storeState[STORE_STATE_INSTANCE][TestUserStateStoreType][firstUserEntityInstanceId.toString()],
            ).toBeUndefined();
        });

        describe("getInstanceExist", () => {
            it("ancestor", () => {
                const ancestorExist = TianyuStore.selecte(
                    TianyuStoreEntityExpose.selector.getInstanceExist(
                        secondUserEntityInstanceId.ancestor,
                        secondUserEntityInstanceId.ancestor,
                    ),
                );
                expect(ancestorExist).toBeTruthy();
            });

            it("exist", () => {
                const ancestorExist = TianyuStore.selecte(
                    TianyuStoreEntityExpose.selector.getInstanceExist(
                        firstUserEntityInstanceId.ancestor,
                        firstUserEntityInstanceId,
                    ),
                );
                expect(ancestorExist).toBeTruthy();
            });

            it("not exist", () => {
                const ancestorExist = TianyuStore.selecte(
                    TianyuStoreEntityExpose.selector.getInstanceExist(
                        secondUserEntityInstanceId.ancestor,
                        secondUserEntityInstanceId,
                    ),
                );
                expect(ancestorExist).toBeFalsy();
            });
        });

        describe("create test", () => {
            it("test ancestor", async () => {
                await TianyuStore.dispatch(
                    TianyuStoreEntityExpose.action.createInstanceIfNotExist(secondUserEntityInstanceId.ancestor, {}),
                );

                const entity = (TianyuStore as any).entityMap.get(ancestorInstanceId.entity);
                expect(entity).toBeDefined();
                expect(
                    entity.storeState[STORE_STATE_INSTANCE][TestUserStateStoreType][
                        secondUserEntityInstanceId.toString()
                    ],
                ).toBeUndefined();
            });

            it("test exist", async () => {
                await TianyuStore.dispatch(
                    TianyuStoreEntityExpose.action.createInstanceIfNotExist(firstUserEntityInstanceId, {}),
                );

                const entity = (TianyuStore as any).entityMap.get(ancestorInstanceId.entity);
                expect(entity).toBeDefined();
                expect(Object.keys(entity.storeState[STORE_STATE_INSTANCE][TestUserStateStoreType]).length).toEqual(1);
                expect(
                    entity.storeState[STORE_STATE_INSTANCE][TestUserStateStoreType][
                        firstUserEntityInstanceId.toString()
                    ],
                ).toBeDefined();
                expect(
                    entity.storeState[STORE_STATE_INSTANCE][TestUserStateStoreType][
                        secondUserEntityInstanceId.toString()
                    ],
                ).toBeUndefined();
            });

            it("test not exist", async () => {
                {
                    await TianyuStore.dispatch(
                        TianyuStoreEntityExpose.action.createInstanceIfNotExist(secondUserEntityInstanceId, {}),
                    );

                    const entity = (TianyuStore as any).entityMap.get(ancestorInstanceId.entity);
                    expect(entity).toBeDefined();
                    expect(Object.keys(entity.storeState[STORE_STATE_INSTANCE][TestUserStateStoreType]).length).toEqual(
                        2,
                    );
                    expect(
                        entity.storeState[STORE_STATE_INSTANCE][TestUserStateStoreType][
                            firstUserEntityInstanceId.toString()
                        ],
                    ).toBeDefined();
                    expect(
                        entity.storeState[STORE_STATE_INSTANCE][TestUserStateStoreType][
                            secondUserEntityInstanceId.toString()
                        ],
                    ).toBeDefined();
                }

                {
                    await TianyuStore.dispatch(TestUserStateInterface.core.destroy(secondUserEntityInstanceId));

                    const entity = (TianyuStore as any).entityMap.get(ancestorInstanceId.entity);
                    expect(entity).toBeDefined();
                    expect(
                        entity.storeState[STORE_STATE_INSTANCE][TestUserStateStoreType][
                            secondUserEntityInstanceId.toString()
                        ],
                    ).toBeUndefined();
                }
            });
        });

        describe("destroy test", () => {
            it("test ancestor", async () => {
                await TianyuStore.dispatch(
                    TianyuStoreEntityExpose.action.destroyInstanceIfExist(secondUserEntityInstanceId.ancestor),
                );

                const entity = (TianyuStore as any).entityMap.get(ancestorInstanceId.entity);
                expect(entity).toBeDefined();
                expect(
                    entity.storeState[STORE_STATE_INSTANCE][TestUserStateStoreType][
                        secondUserEntityInstanceId.toString()
                    ],
                ).toBeUndefined();
            });

            it("test exist", async () => {
                {
                    await TianyuStore.dispatch(
                        TianyuStoreEntityExpose.action.createInstanceIfNotExist(secondUserEntityInstanceId, {}),
                    );

                    const entity = (TianyuStore as any).entityMap.get(ancestorInstanceId.entity);
                    expect(entity).toBeDefined();
                    expect(Object.keys(entity.storeState[STORE_STATE_INSTANCE][TestUserStateStoreType]).length).toEqual(
                        2,
                    );
                    expect(
                        entity.storeState[STORE_STATE_INSTANCE][TestUserStateStoreType][
                            firstUserEntityInstanceId.toString()
                        ],
                    ).toBeDefined();
                    expect(
                        entity.storeState[STORE_STATE_INSTANCE][TestUserStateStoreType][
                            secondUserEntityInstanceId.toString()
                        ],
                    ).toBeDefined();
                }

                {
                    await TianyuStore.dispatch(
                        TianyuStoreEntityExpose.action.destroyInstanceIfExist(secondUserEntityInstanceId),
                    );

                    const entity = (TianyuStore as any).entityMap.get(ancestorInstanceId.entity);
                    expect(entity).toBeDefined();
                    expect(Object.keys(entity.storeState[STORE_STATE_INSTANCE][TestUserStateStoreType]).length).toEqual(
                        1,
                    );
                    expect(
                        entity.storeState[STORE_STATE_INSTANCE][TestUserStateStoreType][
                            firstUserEntityInstanceId.toString()
                        ],
                    ).toBeDefined();
                    expect(
                        entity.storeState[STORE_STATE_INSTANCE][TestUserStateStoreType][
                            secondUserEntityInstanceId.toString()
                        ],
                    ).toBeUndefined();
                }
            });

            it("test not exist", async () => {
                {
                    const entity = (TianyuStore as any).entityMap.get(ancestorInstanceId.entity);
                    expect(entity).toBeDefined();
                    expect(Object.keys(entity.storeState[STORE_STATE_INSTANCE][TestUserStateStoreType]).length).toEqual(
                        1,
                    );
                    expect(
                        entity.storeState[STORE_STATE_INSTANCE][TestUserStateStoreType][
                            firstUserEntityInstanceId.toString()
                        ],
                    ).toBeDefined();
                    expect(
                        entity.storeState[STORE_STATE_INSTANCE][TestUserStateStoreType][
                            secondUserEntityInstanceId.toString()
                        ],
                    ).toBeUndefined();
                }

                {
                    await TianyuStore.dispatch(
                        TianyuStoreEntityExpose.action.destroyInstanceIfExist(secondUserEntityInstanceId),
                    );

                    const entity = (TianyuStore as any).entityMap.get(ancestorInstanceId.entity);
                    expect(entity).toBeDefined();
                    expect(
                        entity.storeState[STORE_STATE_INSTANCE][TestUserStateStoreType][
                            secondUserEntityInstanceId.toString()
                        ],
                    ).toBeUndefined();
                }
            });
        });
    });
});
