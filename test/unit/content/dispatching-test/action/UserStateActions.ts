/** @format */

import { ITestUserState, USER_CONNECTION_EXTERNAL_OBJ, USER_OPTIONS_EXTERNAL_OBJ } from "../Types";
import {
    CreateUserExternalConnectionActionCreator,
    CreateUserExternalOperationActionCreator,
    CreateUserStateActioCreator,
    RemoveUserExternalConnectionActionCreator,
    RemoveUserExternalOperationActionCreator,
    UserGetOptionActionCreator,
    UserLifecycleCreateActionCreator,
    UserLifecycleDestroyActionCreator,
    UserLogonActionCreator,
} from "./creator/UserStateActionCreator";
import { guid } from "@aitianyu.cn/types";
import { getUser, isUserLogon } from "../selector/UserStateSelector";
import { doAction, doReadExternal, doSelector, doSelectorWithThrow } from "src/utils/StoreHandlerUtils";
import { getNewStateBatch } from "src/utils/state-helper/GetNewStateBatch";
import { getNewState } from "src/utils/state-helper/GetNewState";
import { Missing } from "src/types/Model";

export const CreateAction = CreateUserStateActioCreator.withReducer(function (state: ITestUserState) {
    return {
        logon: false,
        user: "",
        token: "",
        operations: [],
    };
});

export const CreateUserExternalConnectionAction = CreateUserExternalConnectionActionCreator.withExternal(function (
    register,
) {
    register.add(USER_CONNECTION_EXTERNAL_OBJ, {
        verify: function (user: string) {
            return user === "admin";
        },
        getToken: function (user: string) {
            return `${user}-${guid()}`;
        },
        disconnect: function () {},
    });
});

export const CreateUserExternalOperationAction = CreateUserExternalOperationActionCreator.withExternal(function (
    register,
) {
    register.add(USER_OPTIONS_EXTERNAL_OBJ, {
        getOpt: function (user: string) {
            return user === "admin" ? ["Home", "Setting", "Help"] : ["Home"];
        },
    });
});

export const RemoveUserExternalConnectionAction = RemoveUserExternalConnectionActionCreator.withExternal(function (
    register,
) {
    register.remove(USER_CONNECTION_EXTERNAL_OBJ);
});
export const RemoveUserExternalOperationAction = RemoveUserExternalOperationActionCreator.withExternal(function (
    register,
) {
    register.remove(USER_OPTIONS_EXTERNAL_OBJ);
});

export const UserLifecycleCreateAction = UserLifecycleCreateActionCreator.withHandler(function* (action) {
    yield* doAction(CreateUserExternalConnectionAction(action.instanceId));
    yield* doAction(CreateUserExternalOperationAction(action.instanceId));
});

export const UserLifecycleDestroyAction = UserLifecycleDestroyActionCreator.withHandler(function* (action) {
    yield* doAction(RemoveUserExternalConnectionAction(action.instanceId));
    yield* doAction(RemoveUserExternalOperationAction(action.instanceId));
});

export const UserLogonAction = UserLogonActionCreator.withHandler(function* (action) {
    const user = action.params.user || "";
    const connection = yield* doReadExternal(function (register) {
        return register.get(USER_CONNECTION_EXTERNAL_OBJ);
    });

    const isLogon = !!connection?.verify(user);
    const token = (isLogon && connection?.getToken(user)) || undefined;

    return {
        isLogon,
        token,
        user,
    };
}).withReducer(function (state: ITestUserState, data) {
    return getNewStateBatch(state, [
        { path: ["user"], value: data.user },
        { path: ["logon"], value: data.isLogon },
        {
            path: ["token"],
            value: data.isLogon ? data.token : "",
        },
    ]);
});

export const UserGetOptionAction = UserGetOptionActionCreator.withHandler(function* (action) {
    const isLogon = yield* doSelector(isUserLogon(action.instanceId));
    if (isLogon instanceof Missing || !isLogon) {
        return [];
    }

    const user = yield* doSelectorWithThrow(getUser(action.instanceId));
    const options = yield* doReadExternal(function (register) {
        return register.get(USER_OPTIONS_EXTERNAL_OBJ);
    });

    const option: string[] = options.getOpt(user) || [];
    return option;
}).withReducer(function (state, data) {
    return getNewState(state, ["operations"], data);
});
