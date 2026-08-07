/** @format */

import { DifferenceChangeType, IDifferences } from "src/types/RedoUndoStack";
import { RedoUndoStackImpl } from "src/store/storage/RedoUndoStackImpl";

describe("aitianyu-cn.node-module.tianyu-store.store.storage.RedoUndoStackImpl", () => {
    const redoUndoStack = new RedoUndoStackImpl();

    beforeEach(() => {
        redoUndoStack.cleanHistory();
    });

    it("canRedo", () => {
        expect(redoUndoStack.canRedo).toBeFalsy();
    });

    it("canUndo", () => {
        expect(redoUndoStack.canUndo).toBeFalsy();
    });

    it("getCurrent", () => {
        expect(redoUndoStack.getCurrent()).toBeUndefined();
    });

    it("record", () => {
        (redoUndoStack as any).current = {
            test: {
                instance: {
                    old: {},
                    new: { t: 1 },
                    type: DifferenceChangeType.Change,
                },
            },
        } as IDifferences;

        redoUndoStack.record({
            test: {
                instance: {
                    old: { t: 1 },
                    new: { t: 2 },
                    type: DifferenceChangeType.Change,
                },
            },
        } as IDifferences);

        expect((redoUndoStack as any).current["test"]["instance"].new).toEqual({ t: 2 });
        expect((redoUndoStack as any).previous.length).toEqual(1);
    });

    describe("doRedo", () => {
        it("could not do redo", () => {
            (redoUndoStack as any).current = {
                test: {
                    instance: {
                        old: {},
                        new: { t: 1 },
                        type: DifferenceChangeType.Change,
                    },
                },
            } as IDifferences;

            expect(redoUndoStack.doRedo()).toBeUndefined();
        });

        it("can do redo", () => {
            (redoUndoStack as any).current = {
                test: {
                    instance: {
                        old: {},
                        new: { t: 1 },
                        type: DifferenceChangeType.Change,
                    },
                },
            } as IDifferences;

            (redoUndoStack as any).future.push({
                test: {
                    instance: {
                        old: { t: 1 },
                        new: { t: 2 },
                        type: DifferenceChangeType.Change,
                    },
                },
            } as IDifferences);

            const diff = redoUndoStack.doRedo();

            expect(diff).toBeDefined();
            expect((redoUndoStack as any).current["test"]["instance"].new).toEqual({ t: 2 });
            expect((redoUndoStack as any).previous.length).toEqual(1);
            expect((redoUndoStack as any).future.length).toEqual(0);
        });
    });

    describe("doUndo", () => {
        it("could not do undo", () => {
            (redoUndoStack as any).current = {
                test: {
                    instance: {
                        old: {},
                        new: { t: 1 },
                        type: DifferenceChangeType.Change,
                    },
                },
            } as IDifferences;

            expect(redoUndoStack.doUndo()).toBeUndefined();
        });

        it("can do undo", () => {
            (redoUndoStack as any).current = {
                test: {
                    instance: {
                        old: { t: 1 },
                        new: { t: 2 },
                        type: DifferenceChangeType.Change,
                    },
                },
            } as IDifferences;

            (redoUndoStack as any).previous.push({
                test: {
                    instance: {
                        old: {},
                        new: { t: 1 },
                        type: DifferenceChangeType.Change,
                    },
                },
            } as IDifferences);

            const diff = redoUndoStack.doUndo();

            expect(diff).toBeDefined();
            expect((redoUndoStack as any).current["test"]["instance"].new).toEqual({ t: 1 });
            expect((redoUndoStack as any).previous.length).toEqual(0);
            expect((redoUndoStack as any).future.length).toEqual(1);
        });
    });

    describe("resetRedoUndo", () => {
        it("if no current", () => {
            redoUndoStack["history"].push({}, {});
            redoUndoStack["previous"] = [{}];
            redoUndoStack.resetRedoUndo();
            expect(redoUndoStack["history"].length).toEqual(3);
        });

        it("has current", () => {
            redoUndoStack["history"].push({}, {});
            redoUndoStack["previous"] = [{}];
            redoUndoStack["current"] = {};
            redoUndoStack.resetRedoUndo();
            expect(redoUndoStack["history"].length).toEqual(4);
        });
    });

    describe("getHistroies", () => {
        it("if no current", () => {
            redoUndoStack["history"].push({}, {});
            const history = redoUndoStack.getHistroies();
            expect(history.histroy.length).toEqual(2);
            expect(history.index).toEqual(1);
        });

        it("current is valid", () => {
            redoUndoStack["history"].push({}, {});
            redoUndoStack["current"] = {};
            redoUndoStack["previous"] = [{}];
            redoUndoStack["future"] = [{}];
            const history = redoUndoStack.getHistroies();
            expect(history.histroy.length).toEqual(5);
            expect(history.index).toEqual(3);
        });
    });
});
