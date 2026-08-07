/** @format */

import { IActionProvider } from "src/types/Action";
import { IStoreState } from "./StoreState";
import { IDifferences } from "src/types/RedoUndoStack";

export interface StoreUndoActionCreator extends IActionProvider<IDifferences, void, void> {}

export interface StoreRedoActionCreator extends IActionProvider<IDifferences, void, void> {}
