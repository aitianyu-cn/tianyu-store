/** @format */

import { guid, ObjectHelper } from "@aitianyu.cn/types";
import { mergeDiff } from "src/common/DiffHelper";
import { ActionType } from "src/types/Action";
import { DifferenceChangeType, IDifferences } from "src/types/RedoUndoStack";
import { doReadExternal } from "src/utils/StoreHandlerUtils";
import { actionBaseImpl } from "../action/ActionBaseImpl";
import { StoreUndoActionCreator, StoreRedoActionCreator } from "./interface/RedoUndoAction";
import { IRedoUndoStack, STORE_STATE_EXTERNAL_REDOUNDO_STACK } from "./interface/RedoUndoStack";
import { IStoreState } from "./interface/StoreState";

export function storeUndoActionCreatorImpl(): StoreUndoActionCreator {
    const actionInstanceCaller = <StoreUndoActionCreator>actionBaseImpl<IDifferences, void, IDifferences | undefined>(
        guid(),
        function* (_action: any) {
            const redoUndoStack: IRedoUndoStack | undefined = yield* doReadExternal(function (register) {
                return register.get<IRedoUndoStack>(STORE_STATE_EXTERNAL_REDOUNDO_STACK);
            });

            // this is used to reverse the diff data ensure the undo operation
            const diff = ObjectHelper.clone(redoUndoStack?.doUndo() || /* istanbul ignore next */ {});
            for (const storeType of Object.keys(diff)) {
                const instances = diff[storeType];
                for (const insKey of Object.keys(instances)) {
                    const ins = instances[insKey];
                    const temp = ins.old;
                    ins.old = ins.new;
                    ins.new = temp;

                    ins.type =
                        ins.type === DifferenceChangeType.Create
                            ? DifferenceChangeType.Delete
                            : ins.type === DifferenceChangeType.Delete
                            ? DifferenceChangeType.Create
                            : DifferenceChangeType.Change;
                }
            }

            return diff;
        },
        ActionType.UNDO,
        function (_state: IDifferences, data: IDifferences | undefined): IDifferences {
            return data || /* istanbul ignore next */ {};
        },
    );

    return actionInstanceCaller;
}

export function storeRedoActionCreatorImpl(): StoreRedoActionCreator {
    const actionInstanceCaller = <StoreRedoActionCreator>actionBaseImpl<IDifferences, void, IDifferences | undefined>(
        guid(),
        function* (_action: any) {
            const redoUndoStack: IRedoUndoStack | undefined = yield* doReadExternal(function (register) {
                return register.get<IRedoUndoStack>(STORE_STATE_EXTERNAL_REDOUNDO_STACK);
            });

            return redoUndoStack?.doRedo();
        },
        ActionType.REDO,
        function (_state: IDifferences, data: IDifferences | undefined): IDifferences {
            return data || /* istanbul ignore next */ {};
        },
    );

    return actionInstanceCaller;
}
