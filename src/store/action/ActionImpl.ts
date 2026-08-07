/**@format */

import { guid } from "@aitianyu.cn/types";
import {
    createNonHandler,
    createDefaultReducer,
    createDefaultExternalOperator,
    createVoidHandler,
} from "src/common/ActionHelper";
import { defaultInfoGenerator } from "src/common/OperatorHelper";
import {
    ActionType,
    ActionProvider,
    ViewActionProvider,
    IInstanceViewAction,
    CreateStoreActionCreator,
    DestroyStoreActionCreator,
} from "src/types/Action";
import { ActionHandlerFunction } from "src/types/ActionHandler";
import { ExternalOperatorFunction } from "src/types/ExternalObject";
import { InstanceId } from "src/types/InstanceId";
import { IterableType, OperatorInfoType } from "src/types/Model";
import { ReducerFunction } from "src/types/Reducer";
import { actionBaseImpl } from "./ActionBaseImpl";

export function actionImpl<STATE extends IterableType, PARAMETER_TYPE, RETURN_TYPE>(
    id: string,
    handler: ActionHandlerFunction<PARAMETER_TYPE, RETURN_TYPE>,
    reducer?: ReducerFunction<STATE, RETURN_TYPE>,
    external?: ExternalOperatorFunction,
    actionType?: ActionType,
): ActionProvider<STATE, PARAMETER_TYPE, RETURN_TYPE> {
    const actionInstanceCaller = <ActionProvider<STATE, PARAMETER_TYPE, RETURN_TYPE>>(
        actionBaseImpl<STATE, PARAMETER_TYPE, RETURN_TYPE>(
            id,
            handler,
            actionType || ActionType.ACTION,
            reducer,
            external,
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

export function viewActionImpl<STATE extends IterableType, PARAMETER_TYPE, RETURN_TYPE>(
    id: string,
    handler: ActionHandlerFunction<PARAMETER_TYPE, RETURN_TYPE>,
    reducer?: ReducerFunction<STATE, RETURN_TYPE>,
    external?: ExternalOperatorFunction,
    actionType?: ActionType,
): ViewActionProvider<STATE, PARAMETER_TYPE, RETURN_TYPE> {
    const actionInstanceCaller = <ViewActionProvider<STATE, PARAMETER_TYPE, RETURN_TYPE>>(
        function (
            instanceId: InstanceId,
            params: PARAMETER_TYPE,
            viewInstanceId: InstanceId,
        ): IInstanceViewAction<PARAMETER_TYPE> {
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

export function createStoreActionCreatorImpl<STATE extends IterableType, PARAMETER_TYPE>(): CreateStoreActionCreator<
    STATE,
    PARAMETER_TYPE
> {
    const actionInstanceCaller = <CreateStoreActionCreator<STATE, PARAMETER_TYPE>>(
        actionBaseImpl<STATE, PARAMETER_TYPE, PARAMETER_TYPE>(
            guid(),
            createNonHandler<PARAMETER_TYPE>(),
            ActionType.CREATE,
            createDefaultReducer(),
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
        actionBaseImpl<any, void, void>(guid(), createVoidHandler(), ActionType.DESTROY, function () {
            return undefined;
        })
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
