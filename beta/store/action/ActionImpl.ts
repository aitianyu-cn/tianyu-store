/**@format */

import { guid } from "@aitianyu.cn/types";
import {
    ActionProvider,
    ActionType,
    CreateStoreActionCreator,
    DestroyStoreActionCreator,
    IInstanceViewAction,
    ViewActionProvider,
} from "beta/types/Action";
import { ActionHandlerFunction } from "beta/types/ActionHandler";
import { InstanceId } from "beta/types/InstanceId";
import { IterableType, OperatorInfoType, ReturnableType } from "beta/types/Model";
import { ReducerFunction } from "beta/types/Reducer";
import { actionBaseImpl } from "./ActionBaseImpl";
import {
    createDefaultExternalOperator,
    createDefaultReducer,
    createNonHandler,
    createUndefinedHandler,
    createVoidHandler,
} from "beta/common/ActionHelper";
import { ExternalOperatorFunction } from "beta/types/ExternalObject";
import { defaultInfoGenerator } from "beta/common/OperatorHelper";

export function actionImpl<
    STATE extends IterableType,
    PARAMETER_TYPE extends IterableType | undefined | void,
    RETURN_TYPE extends ReturnableType,
>(
    id: string,
    handler: ActionHandlerFunction<PARAMETER_TYPE, RETURN_TYPE>,
    reducer: ReducerFunction<STATE, RETURN_TYPE>,
    external: ExternalOperatorFunction,
    actionType?: ActionType,
): ActionProvider<STATE, PARAMETER_TYPE, RETURN_TYPE> {
    const actionInstanceCaller = <ActionProvider<STATE, PARAMETER_TYPE, RETURN_TYPE>>(
        actionBaseImpl<STATE, PARAMETER_TYPE, RETURN_TYPE>(
            id,
            handler,
            reducer,
            external,
            actionType || ActionType.ACTION,
        )
    );

    actionInstanceCaller.asViewAction = function (): ViewActionProvider<STATE, PARAMETER_TYPE, RETURN_TYPE> {
        return viewActionImpl<STATE, PARAMETER_TYPE, RETURN_TYPE>(
            actionInstanceCaller.id,
            actionInstanceCaller.handler,
            actionInstanceCaller.reducer,
            actionInstanceCaller.external,
            actionType,
        );
    };

    return actionInstanceCaller;
}

export function viewActionImpl<
    STATE extends IterableType,
    PARAMETER_TYPE extends IterableType | undefined | void,
    RETURN_TYPE extends ReturnableType,
>(
    id: string,
    handler: ActionHandlerFunction<PARAMETER_TYPE, RETURN_TYPE>,
    reducer: ReducerFunction<STATE, RETURN_TYPE>,
    external: ExternalOperatorFunction,
    actionType?: ActionType,
): ViewActionProvider<STATE, PARAMETER_TYPE, RETURN_TYPE> {
    const actionInstanceCaller = <ViewActionProvider<STATE, PARAMETER_TYPE, RETURN_TYPE>>(
        function (instanceId: InstanceId, params: PARAMETER_TYPE, viewInstanceId: InstanceId): IInstanceViewAction {
            return {
                id: actionInstanceCaller.actionId,
                action: actionInstanceCaller.info.fullName,
                storeType: actionInstanceCaller.info.storeType,
                transaction: false,
                actionType: actionInstanceCaller.getType(),
                viewInstanceId,
                instanceId,
                params,
            };
        }
    );
    actionInstanceCaller.id = id;
    actionInstanceCaller.info = defaultInfoGenerator(OperatorInfoType.ACTION);
    actionInstanceCaller.actionId = actionInstanceCaller.id;
    actionInstanceCaller.handler = handler;
    actionInstanceCaller.reducer = reducer;
    actionInstanceCaller.external = external;
    actionInstanceCaller.getType = function (): ActionType {
        return actionType || ActionType.VIEW_ACTION;
    };

    return actionInstanceCaller;
}

export function createStoreActionCreatorImpl<
    STATE extends IterableType,
    PARAMETER_TYPE extends IterableType | undefined | void = void,
>(): CreateStoreActionCreator<STATE, PARAMETER_TYPE> {
    const actionInstanceCaller = <CreateStoreActionCreator<STATE, PARAMETER_TYPE>>(
        actionBaseImpl<STATE, PARAMETER_TYPE, PARAMETER_TYPE>(
            guid(),
            createNonHandler<PARAMETER_TYPE>(),
            createDefaultReducer<STATE, PARAMETER_TYPE>(),
            createDefaultExternalOperator(),
            ActionType.CREATE,
        )
    );
    actionInstanceCaller.withReducer = function (
        reducer: ReducerFunction<STATE, PARAMETER_TYPE>,
    ): ActionProvider<STATE, PARAMETER_TYPE, PARAMETER_TYPE> {
        return actionImpl<STATE, PARAMETER_TYPE, PARAMETER_TYPE>(
            actionInstanceCaller.id,
            actionInstanceCaller.handler,
            reducer,
            actionInstanceCaller.external,
            ActionType.CREATE,
        );
    };

    return actionInstanceCaller;
}

export function destroyStoreActionCreatorImpl(): DestroyStoreActionCreator {
    const actionInstanceCaller = <DestroyStoreActionCreator>(
        actionBaseImpl<any, void, void>(
            guid(),
            createVoidHandler(),
            createDefaultReducer<any, void>(),
            createDefaultExternalOperator(),
            ActionType.DESTROY,
        )
    );
    actionInstanceCaller.withReducer = function (reducer: ReducerFunction<any, void>): ActionProvider<any, void, void> {
        return actionImpl<any, void, void>(
            actionInstanceCaller.id,
            actionInstanceCaller.handler,
            reducer,
            actionInstanceCaller.external,
            ActionType.DESTROY,
        );
    };

    return actionInstanceCaller;
}
