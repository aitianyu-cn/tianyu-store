/** @format */

import { IDifferences } from "src/types/RedoUndoStack";
import { IRedoUndoStack } from "./interface/RedoUndoStack";

export class RedoUndoStackImpl implements IRedoUndoStack {
    private readonly history: IDifferences[];

    private previous: IDifferences[];
    private current: IDifferences | undefined;
    private future: IDifferences[];

    public constructor() {
        this.history = [];
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
        this.current = Object.freeze(diff);
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
        this.history.splice(0, this.history.length);
        this.cleanStack();
    }
    public resetRedoUndo(): void {
        this.history.push(...this.previous);
        this.current && this.history.push(this.current);

        this.cleanStack();
    }
    public getHistroies(): { histroy: IDifferences[]; index: number } {
        const histroy: IDifferences[] = this.history.concat();
        histroy.push(...this.previous);
        const index = this.current ? histroy.length : histroy.length - 1;
        if (this.current) {
            histroy.push(this.current);
            histroy.push(...this.future);
        }

        return { histroy, index };
    }

    private cleanStack(): void {
        this.previous = [];
        this.current = undefined;
        this.future = [];
    }
}
