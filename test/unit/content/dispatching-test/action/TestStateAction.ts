/** @format */

import { ActionFactor } from "src/store/ActionFactor";
import { ITestTestState } from "../Types";

export const CreateTestStateAction = ActionFactor.makeCreateStoreAction<ITestTestState>().withReducer(function () {
    return {
        index: "test",
    };
});

export const DestroyTestStateAction = ActionFactor.makeDestroyStoreAction();
