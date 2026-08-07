/** @format */

import { guid } from "@aitianyu.cn/types";
import { generateInstanceId } from "src/InstanceId";
import { MessageBundle } from "src/infra/Message";
import { ActionType, IInstanceAction } from "src/types/Action";
import { IInstanceSelector } from "src/types/Selector";
import { TransactionType } from "src/types/Transaction";

describe("aitianyu-cn.node-module.tianyu-store.store.modules.Transaction", () => {
    const { formatTransactionType, TransactionImpl } = require("src/store/modules/Transaction");

    const storeId = guid();
    const storeName = guid();
    const transaction = new TransactionImpl(storeId, storeName);

    describe("formatTransactionType", () => {
        it("-", () => {
            expect(formatTransactionType(TransactionType.Action)).toEqual("Action");
            expect(formatTransactionType(TransactionType.Selector)).toEqual("Selector");
            expect(formatTransactionType(TransactionType.Listener)).toEqual("Listener");
            expect(formatTransactionType(TransactionType.Subscribe)).toEqual("Subscribe");
        });
    });

    describe("Transaction", () => {
        beforeEach(() => {
            transaction.cleanDispatch();
            transaction.cleanSelector();
            transaction.cleanError();
        });

        describe("TransactionManager", () => {
            it("dispatched", () => {
                const actionInstance: IInstanceAction<any> = {
                    id: guid(),
                    action: "test_action",
                    storeType: "test",
                    instanceId: generateInstanceId("", ""),
                    params: undefined,
                    actionType: ActionType.ACTION,
                };
                transaction.dispatched([actionInstance]);

                const dispatches = transaction.getDispatched() || [];
                expect(dispatches.length).toEqual(1);
                expect(dispatches[dispatches.length - 1].operations[0]).toBe(actionInstance);
            });

            it("selected", () => {
                const selectorInstance: IInstanceSelector<any> = {
                    id: guid(),
                    selector: "test_selector",
                    storeType: "test",
                    instanceId: generateInstanceId("", ""),
                    params: undefined,
                };
                transaction.selected(selectorInstance);

                const selectors = transaction.getSelections() || [];
                expect(selectors.length).toEqual(1);
                expect(selectors[selectors.length - 1].operations[0]).toBe(selectorInstance);
            });

            describe("error", () => {
                it("add as string error", () => {
                    transaction.error("error message", TransactionType.Action);

                    const errors = transaction.getErrors() || [];
                    expect(errors.length).toEqual(1);
                    expect(errors[errors.length - 1].message).toEqual("error message");
                    expect(errors[errors.length - 1].type).toEqual(TransactionType.Action);
                });

                it("add as error instance", () => {
                    transaction.error(new Error("error message"), TransactionType.Action);

                    const errors = transaction.getErrors() || [];
                    expect(errors.length).toEqual(1);
                    expect(errors[errors.length - 1].message).toEqual("error message");
                    expect(errors[errors.length - 1].type).toEqual(TransactionType.Action);
                });

                it("add as other type", () => {
                    transaction.error({} as any, TransactionType.Action);

                    const errors = transaction.getErrors() || [];
                    expect(errors.length).toEqual(1);
                    expect(errors[errors.length - 1].message).toEqual(
                        MessageBundle.getText(
                            "TRANSACTION_ERROR_RECORDING_UNKNOWN_ERROR",
                            formatTransactionType(TransactionType.Action),
                        ),
                    );
                    expect(errors[errors.length - 1].type).toEqual(TransactionType.Action);
                });
            });
        });
    });
});
