/** @format */

import { CreatePageStateAction, PageIndexChangeAction } from "./dispatching-test/action/PageStateActions";
import {
    CreateAction,
    CreateUserExternalConnectionAction,
    CreateUserExternalOperationAction,
    RemoveUserExternalConnectionAction,
    RemoveUserExternalOperationAction,
    UserGetOptionAction,
    UserLifecycleCreateAction,
    UserLifecycleDestroyAction,
    UserLogonAction,
} from "./dispatching-test/action/UserStateActions";
import { DestroyPageStateActionCreator } from "./dispatching-test/action/creator/PageStateActionCreator";
import { DestroyUserStateActionCreator } from "./dispatching-test/action/creator/UserStateActionCreator";
import { getCurrentPage } from "./dispatching-test/selector/PageStateSelector";
import {
    getCommonOperations,
    getConnectToken,
    getUser,
    getUserInfo,
    getUserOperations,
    getUserSpecifiedOperations,
    getUserStatus,
    isUserLogon,
} from "./dispatching-test/selector/UserStateSelector";
import { ITestUserState } from "./DispatchingTestContent";
import { ITestPageState } from "./DispatchingTestContent";
import { ITianyuStoreInterface } from "src/types/Interface";
import { CreateTestStateAction, DestroyTestStateAction } from "./dispatching-test/action/TestStateAction";
import { GetTestStateIndex } from "./dispatching-test/selector/TestStateSelector";
import { ITestTestState } from "./dispatching-test/Types";

export {
    type ITestUserState,
    type ITestPageState,
    USER_CONNECTION_EXTERNAL_OBJ,
    USER_OPTIONS_EXTERNAL_OBJ,
} from "./dispatching-test/Types";

export const TestUserStateInterface = {
    core: {
        creator: CreateAction,
        destroy: DestroyUserStateActionCreator,
    },
    action: {
        userLifecycleCreateAction: UserLifecycleCreateAction,
        userLifecycleDestroyAction: UserLifecycleDestroyAction,
        userLogonAction: UserLogonAction,
        userGetOptionAction: UserGetOptionAction,
        createUserExternalConnectionAction: CreateUserExternalConnectionAction,
        createUserExternalOperationAction: CreateUserExternalOperationAction,
        removeUserExternalConnectionAction: RemoveUserExternalConnectionAction,
        removeUserExternalOperationAction: RemoveUserExternalOperationAction,
    },
    selector: {
        isUserLogon,
        getUser,
        getConnectToken,
        getUserOperations,
        getUserStatus,
        getUserInfo,
        getUserSpecifiedOperations,
        getCommonOperations,
    },
};

export const TestPageStateInterface = {
    core: {
        creator: CreatePageStateAction,
        destroy: DestroyPageStateActionCreator,
    },
    action: {
        pageIndexChangeAction: PageIndexChangeAction,
    },
    selector: {
        getCurrentPage,
    },
};

export const TestTestStateInterface = {
    core: {
        creator: CreateTestStateAction,
        destroy: DestroyTestStateAction,
    },
    selector: {
        getIndex: GetTestStateIndex,
    },
};

export const TestUserStateStoreType = "user-state";
export const TestPageStateStoreType = "page-state";
export const TestTestStateStoreType = "test-state";

TestUserStateInterface as ITianyuStoreInterface<ITestUserState>;
TestPageStateInterface as ITianyuStoreInterface<ITestPageState>;
TestTestStateInterface as ITianyuStoreInterface<ITestTestState>;
