/** @format */

import { SelectorFactor } from "src/store/SelectorFactor";
import { ITestUserState } from "../Types";

export const isUserLogon = SelectorFactor.makeSelector(function (state: ITestUserState): boolean {
    return state.logon;
});

export const getUser = SelectorFactor.makeSelector(function (state: ITestUserState): string {
    return state.user;
});

export const getConnectToken = SelectorFactor.makeSelector(function (state: ITestUserState): string {
    return state.token;
});

export const getUserSpecifiedOperations = SelectorFactor.makeParameterSelector(function (
    state: ITestUserState,
    commonOp: string[],
): string[] {
    return [...state.operations, ...commonOp];
});

export const getCommonOperations = SelectorFactor.makeConstantSelector(function () {
    return ["Theme", "Language"];
});

export const getUserOperations = SelectorFactor.makeRestrictSelector(getCommonOperations, getUserSpecifiedOperations);

export const getUserStatus = SelectorFactor.makeMixingSelector(
    getUser,
    isUserLogon,
    getConnectToken,
    (user, logon, token) => {
        return {
            user,
            logon,
            token,
        };
    },
);

export const getUserInfo = SelectorFactor.makeMixingSelector(getUserStatus, getUserOperations, (status, operate) => {
    return {
        ...status,
        operations: operate,
    };
});
