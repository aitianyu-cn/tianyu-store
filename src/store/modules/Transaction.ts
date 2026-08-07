/** @format */

import { guid, Log } from "@aitianyu.cn/types";
import { MessageBundle } from "src/infra/Message";
import { IInstanceAction } from "src/types/Action";
import { IInstanceSelector } from "src/types/Selector";
import {
    TransactionType,
    ITransaction,
    ITransactionInternal,
    TransactionOperationRecord,
    TransactionErrorRecord,
} from "src/types/Transaction";

export function formatTransactionType(type: TransactionType): string {
    switch (type) {
        case TransactionType.Action:
            return "Action";
        case TransactionType.Selector:
            return "Selector";
        case TransactionType.Listener:
            return "Listener";
        case TransactionType.Subscribe:
            return "Subscribe";
    }
}

export class TransactionImpl implements ITransaction, ITransactionInternal {
    private readonly storeId: string;

    private dispatchedActions: TransactionOperationRecord<IInstanceAction<any>>[];
    private selections: TransactionOperationRecord<IInstanceSelector<any>>[];
    private errors: TransactionErrorRecord[];

    public constructor(storeId: string) {
        this.storeId = storeId;

        this.dispatchedActions = [];
        this.selections = [];
        this.errors = [];
    }

    getDispatched(): TransactionOperationRecord<IInstanceAction<any>>[] {
        return this.dispatchedActions.concat();
    }
    cleanDispatch(): void {
        this.dispatchedActions = [];
    }
    getSelections(): TransactionOperationRecord<IInstanceSelector<any>>[] {
        return this.selections.concat();
    }
    cleanSelector(): void {
        this.selections = [];
    }
    getErrors(): TransactionErrorRecord[] {
        return this.errors.concat();
    }
    cleanError(): void {
        this.errors = [];
    }

    dispatched(actions: IInstanceAction<any>[]): TransactionOperationRecord<IInstanceAction<any>> {
        const actionRec: TransactionOperationRecord<IInstanceAction<any>> = {
            id: guid(),
            time: new Date(Date.now()),
            operations: actions,
        };
        this.dispatchedActions.push(actionRec);
        return actionRec;
    }
    selected(selector: IInstanceSelector<any>): TransactionOperationRecord<IInstanceSelector<any>> {
        const selectorRec: TransactionOperationRecord<IInstanceSelector<any>> = {
            id: guid(),
            time: new Date(Date.now()),
            operations: [selector],
        };
        this.selections.push(selectorRec);
        return selectorRec;
    }
    error(message: string | Error, type: TransactionType): TransactionErrorRecord {
        const errorRecord = {
            message:
                typeof message === "string"
                    ? message
                    : message instanceof Error
                    ? message.message
                    : MessageBundle.getText("TRANSACTION_ERROR_RECORDING_UNKNOWN_ERROR", formatTransactionType(type)),
            type,
            time: new Date(Date.now()),
        };

        Log.error(errorRecord.message, true);
        this.errors.push(errorRecord);
        return errorRecord;
    }
}
