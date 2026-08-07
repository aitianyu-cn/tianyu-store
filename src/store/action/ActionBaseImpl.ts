/**@format */

import { defaultInfoGenerator } from "src/common/OperatorHelper";
import { ActionType, IActionProvider, IInstanceAction } from "src/types/Action";
import { ActionHandlerFunction } from "src/types/ActionHandler";
import { ExternalOperatorFunction } from "src/types/ExternalObject";
import { InstanceId } from "src/types/InstanceId";
import { IterableType, ReturnableType, OperatorInfoType } from "src/types/Model";
import { ReducerFunction } from "src/types/Reducer";

export function actionBaseImpl<STATE extends IterableType, PARAMETER_TYPE, RETURN_TYPE>(
    id: string,
    handler: ActionHandlerFunction<PARAMETER_TYPE, RETURN_TYPE>,
    type: ActionType,
    reducer?: ReducerFunction<STATE, RETURN_TYPE>,
    external?: ExternalOperatorFunction,
): IActionProvider<STATE, PARAMETER_TYPE, RETURN_TYPE> {
    const actionInstanceCaller = <IActionProvider<STATE, PARAMETER_TYPE, RETURN_TYPE>>(
        function (instanceId: InstanceId, params: PARAMETER_TYPE): IInstanceAction<PARAMETER_TYPE> {
            return {
                id: actionInstanceCaller.actionId,
                action: actionInstanceCaller.info.fullName,
                storeType: actionInstanceCaller.info.storeType,
                actionType: actionInstanceCaller.getType(),
                instanceId,
                params,
                template: actionInstanceCaller.info.template,
            };
        }
    );
    actionInstanceCaller.id = id;
    actionInstanceCaller.actionId = actionInstanceCaller.id;
    actionInstanceCaller.handler = handler;
    actionInstanceCaller.reducer = reducer;
    actionInstanceCaller.external = external;
    actionInstanceCaller.getType = function (): ActionType {
        return type;
    };
    actionInstanceCaller.info = defaultInfoGenerator(OperatorInfoType.ACTION);

    return actionInstanceCaller;
}
