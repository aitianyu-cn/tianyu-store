/** @format */

import { IInstanceAction } from "./Action";
import { IInstanceSelector } from "./Selector";

/** Tianyu Store Transaction Types */
export enum TransactionType {
    /** Action Operate */
    Action,
    /** Selector Operate */
    Selector,
    /** Event Listener Trigger */
    Listener,
    /** Subscribe Trigger */
    Subscribe,
}

/** Transaction Operate Record Item */
export interface TransactionOperationRecord<REC> {
    /** records id */
    id: string;
    /** recorded operations list */
    operations: REC[];
    /** recorded time */
    time: Date;
}

/** Transaction Error Record Item */
export interface TransactionErrorRecord {
    /** error recorded time */
    time: Date;
    /** error message */
    message: string;
    /** transaction operation type */
    type: TransactionType;
}

/** Tianyu Store Transaction Expose Interface */
export interface ITransaction {
    /**
     * Get current dispatched actions
     *
     * @returns return operation list
     */
    getDispatched(): TransactionOperationRecord<IInstanceAction<any>>[];
    /** To clean current dispatch actions history */
    cleanDispatch(): void;

    /**
     * Get current executed selectors
     *
     * @returns return operation list
     */
    getSelections(): TransactionOperationRecord<IInstanceSelector<any>>[];
    /** To clean current selector execution history */
    cleanSelector(): void;

    /**
     * Get current errors for all operations
     *
     * @returns return error list
     */
    getErrors(): TransactionErrorRecord[];
    /** To clean current errors history */
    cleanError(): void;
}

/** this is for internal using */
export interface ITransactionInternal extends ITransaction {
    dispatched(actions: IInstanceAction<any>[]): TransactionOperationRecord<IInstanceAction<any>>;
    selected(selector: IInstanceSelector<any>): TransactionOperationRecord<IInstanceSelector<any>>;
    error(message: string | Error, type: TransactionType): TransactionErrorRecord;
}
