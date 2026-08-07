/**@format */

import { IDifferences } from "src/types/RedoUndoStack";

/**
 * try to parse a string into object
 *
 * @param json the source string
 * @returns return parsed object, if the source string is not a valid JSON object, return undefined instead
 */
export function parseJsonString(json: string): any {
    try {
        return JSON.parse(json);
    } catch {
        return undefined;
    }
}

export function isChangesEmpty(changes: IDifferences): boolean {
    return Object.keys(changes).length === 0;
}
