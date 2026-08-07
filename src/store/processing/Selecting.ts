/** @format */

import { InstanceId } from "src/types/InstanceId";
import { Missing } from "src/types/Model";
import {
    IInstanceSelector,
    SelectorResult,
    SelectorProvider,
    ParameterSelectorProvider,
    SelectorType,
    RawSelector,
    RawParameterSelector,
    MixSelectorProvider,
    RestrictSelectorProvider,
} from "src/types/Selector";
import { IStoreExecution, IStoreManager } from "src/types/Store";
import { TransactionType } from "src/types/Transaction";
import { getStoreTypeMatchedInstanceId } from "./InstanceProcessor";
import { MessageBundle } from "src/infra/Message";

export function doSelecting<RESULT>(
    manager: IStoreManager,
    selector: IInstanceSelector<RESULT>,
    forceStatic: boolean,
): SelectorResult<RESULT> {
    try {
        return doSelectingWithStateThrowWhenMissing<RESULT>(manager, selector, forceStatic);
    } catch (e) {
        manager.error(e as any, TransactionType.Selector);
        return new Missing();
    }
}

export function doSelectingWithThrow<RESULT>(
    manager: IStoreManager,
    selector: IInstanceSelector<RESULT>,
    forceStatic: boolean,
): RESULT {
    try {
        return doSelectingWithStateThrowWhenMissing<RESULT>(manager, selector, forceStatic);
    } catch (e) {
        manager.error(e as any, TransactionType.Selector);
        throw e;
    }
}

export function doSelectingWithState<RESULT>(
    state: any,
    executor: IStoreExecution,
    manager: IStoreManager,
    selector: IInstanceSelector<RESULT>,
): SelectorResult<RESULT> {
    try {
        const selectorImpl = manager.getSelector(selector.selector, !!selector.template, selector.instanceId);
        manager.select(selector);
        const type = selectorImpl.type;
        if (type !== SelectorType.NORMAL && type !== SelectorType.PARAMETER) {
            throw MessageBundle.getText("SELECTOR_NOT_SUPPORTED_FOR_LISTEN_OR_SUBSCRIBE", type.toString());
        }

        const getter = (selectorImpl as SelectorProvider<any, RESULT> | ParameterSelectorProvider<any, any, RESULT>)
            .getter;
        const externalResult = selectorImpl.external?.(executor.getExternalRegister(selector.instanceId));

        return doSimpleSelector(type, getter, state, selector.params, externalResult);
    } catch (e) {
        manager.error(e as any, TransactionType.Selector);
        return new Missing();
    }
}

function doSimpleSelector<RESULT>(
    type: SelectorType,
    getter: RawSelector<any, RESULT, any> | RawParameterSelector<any, any, RESULT, any>,
    state: any,
    param: any,
    externalResult: any,
): RESULT {
    return type === SelectorType.NORMAL
        ? (getter as RawSelector<any, RESULT, any>)(state, externalResult)
        : (getter as RawParameterSelector<any, any, RESULT, any>)(state, param, externalResult);
}

function doSelectingWithStateThrowWhenMissing<RESULT>(
    manager: IStoreManager,
    selector: IInstanceSelector<RESULT>,
    forceStatic: boolean,
): RESULT {
    const selectorImpl = manager.getSelector(selector.selector, !!selector.template, selector.instanceId);
    manager.select(selector);
    const type = selectorImpl.type;

    if (type === SelectorType.MIX) {
        return doMixSelecting(manager, selector, selectorImpl as MixSelectorProvider<any, RESULT>, forceStatic);
    }

    if (type === SelectorType.RESTRICT) {
        return doRestrictSelecting(
            manager,
            selector,
            selectorImpl as RestrictSelectorProvider<any, RESULT>,
            forceStatic,
        );
    }

    const getter = (selectorImpl as SelectorProvider<any, RESULT> | ParameterSelectorProvider<any, any, RESULT>).getter;
    const instanceIdMatchedStoreType = getStoreTypeMatchedInstanceId(selectorImpl.info.storeType, selector.instanceId);

    const executor = manager.getEntity(instanceIdMatchedStoreType.entity);
    const externalResult = selectorImpl.external?.(executor.getExternalRegister(selector.instanceId));

    const state = forceStatic
        ? executor.getOriginState(instanceIdMatchedStoreType)
        : executor.getState(instanceIdMatchedStoreType);
    return doSimpleSelector(type, getter, state, selector.params, externalResult);
}

function generateSelectorInstance(instanceId: InstanceId, selectorImpl: any, param: any): IInstanceSelector<any> {
    return selectorImpl.type === SelectorType.NORMAL
        ? (selectorImpl as SelectorProvider<any, any>)(instanceId)
        : (
              selectorImpl as
                  | MixSelectorProvider<any, any>
                  | ParameterSelectorProvider<any, any, any>
                  | RestrictSelectorProvider<any, any>
          )(instanceId, param);
}

function doMixSelecting<RESULT>(
    manager: IStoreManager,
    selector: IInstanceSelector<RESULT>,
    mixSelector: MixSelectorProvider<any, RESULT>,
    forceStatic: boolean,
): RESULT {
    const innerSelectors = mixSelector.getters;
    const innerResults: any[] = [];
    for (const selectorInfo of innerSelectors) {
        const selectorProvider = manager.getSelector(selectorInfo.fullName, !!selector.template, selector.instanceId);
        const selectorInstance = generateSelectorInstance(selector.instanceId, selectorProvider, selector.params);
        innerResults.push(doSelectingWithStateThrowWhenMissing(manager, selectorInstance, forceStatic));
    }
    return mixSelector.resultGenerator(...innerResults, selector.params);
}

function doRestrictSelecting<RESULT>(
    manager: IStoreManager,
    selector: IInstanceSelector<RESULT>,
    selectorImpl: RestrictSelectorProvider<any, RESULT>,
    forceStatic: boolean,
): RESULT {
    const fromSelector = manager.getSelector(
        selectorImpl.parameterGenerator.fullName,
        !!selector.template,
        selector.instanceId,
    );
    const toSelector = manager.getSelector(
        selectorImpl.resultGenerator.fullName,
        !!selector.template,
        selector.instanceId,
    );
    const fromInstance = generateSelectorInstance(selector.instanceId, fromSelector, selector.params);
    const fromValue = doSelectingWithStateThrowWhenMissing(manager, fromInstance, forceStatic);

    const toInstance = generateSelectorInstance(selector.instanceId, toSelector, fromValue);
    return doSelectingWithStateThrowWhenMissing(manager, toInstance, forceStatic);
}
