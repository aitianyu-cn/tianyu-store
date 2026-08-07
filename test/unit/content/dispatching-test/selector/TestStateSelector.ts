/** @format */

import { SelectorFactor } from "src/store/SelectorFactor";
import { ITestTestState } from "../Types";

export const GetTestStateIndex = SelectorFactor.makeSelector<ITestTestState, string>(function (state) {
    return state.index;
});
