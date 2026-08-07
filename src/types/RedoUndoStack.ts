/** @format */

import { IterableType } from "./Model";

/** Tianyu Store State change type */
export enum DifferenceChangeType {
    /** State is changed */
    Change,
    /** State is new created */
    Create,
    /** State is deleted */
    Delete,
}

/** Tianyu Store State delta Changes */
export interface IDifferences extends IterableType {
    [storeType: string]: {
        [instanceId: string]: {
            old: any;
            new: any;
            type: DifferenceChangeType;
        };
    };
}
