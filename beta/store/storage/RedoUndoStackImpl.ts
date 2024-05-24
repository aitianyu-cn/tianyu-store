/** @format */

import { IDifferences, IRedoUndoStack } from "./interface/RedoUndoStack";

export class RedoUndoStackImpl implements IRedoUndoStack {
    private previous: IDifferences[];
    private current: IDifferences | undefined;
    private future: IDifferences[];

    public constructor() {
        this.previous = [];
        this.current = undefined;
        this.future = [];
    }

    public get canRedo(): boolean {
        return this.future.length > 0;
    }
    public get canUndo(): boolean {
        return this.previous.length > 0 && !!this.current;
    }
    public getCurrent(): IDifferences | undefined {
        return this.current;
    }
    public record(diff: IDifferences): void {
        this.future = [];
        if (this.current) {
            this.previous.push(this.current);
        }
        this.current = diff;
    }
    public doRedo(): IDifferences | undefined {
        if (!this.canRedo) {
            return undefined;
        }

        if (this.current) {
            this.previous.push(this.current);
        }
        this.current = this.future.pop();

        return this.current;
    }
    public doUndo(): IDifferences | undefined {
        if (!this.canUndo) {
            return undefined;
        }

        const currentDiff = this.current;
        if (this.current) {
            this.future.push(this.current);
        }
        this.current = this.previous.pop();
        return currentDiff;
    }
    public cleanHistory(): void {
        this.previous = [];
        this.current = undefined;
        this.future = [];
    }
}
