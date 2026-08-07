/** @format */

import { storeRedoActionCreatorImpl, storeUndoActionCreatorImpl } from "src/store/storage/RedoUndoActionImpl";
import { ActionType } from "src/types/Action";

describe("aitianyu-cn.node-module.tianyu-store.store.storage.RedoUndoActionImpl", () => {
    it("storeUndoActionCreatorImpl", async () => {
        const undoAction = storeUndoActionCreatorImpl();
        expect(undoAction.getType()).toBe(ActionType.UNDO);
    });

    it("storeRedoActionCreatorImpl", async () => {
        const redoAction = storeRedoActionCreatorImpl();
        expect(redoAction.getType()).toBe(ActionType.REDO);
    });
});
