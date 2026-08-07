/**@format */

import {
    selectorCreator,
    parameterSelectorCreator,
    mixingSelectorCreator,
    restrictSelectorCreator,
} from "src/common/SelectorHelper";
import { MessageBundle } from "src/infra/Message";
import { ExternalObjectHandleFunction } from "src/types/ExternalObject";
import { IterableType } from "src/types/Model";
import {
    RawSelector,
    SelectorProvider,
    RawParameterSelector,
    ParameterSelectorProvider,
    MixSelectorProvider,
    RestrictSelectorProvider,
    SPB,
} from "src/types/Selector";

/** Tianyu Store Selector Create Factor */
export class SelectorFactor {
    /**
     * To create a new selector with no parameteres
     *
     * @template STATE the type of state
     * @template RETURN_TYPE type of selector return value
     * @template EXTERNAL_RESULT the external object handler return value
     *
     * @param rawSelector selector raw process function
     * @param enternal external object handler
     * @returns return a new selector
     */
    public static makeSelector<STATE extends IterableType, RETURN_TYPE, EXTERNAL_RESULT = void>(
        rawSelector: RawSelector<STATE, RETURN_TYPE, EXTERNAL_RESULT>,
        enternal?: ExternalObjectHandleFunction<EXTERNAL_RESULT>,
    ): SelectorProvider<STATE, RETURN_TYPE> {
        return selectorCreator<STATE, RETURN_TYPE>(rawSelector, enternal);
    }

    /**
     * To create a new selector with parameteres
     *
     * @template STATE the type of state
     * @template PARAMETER_TYPE type of selector parameter
     * @template RETURN_TYPE type of selector return value
     * @template EXTERNAL_RESULT the external object handler return value
     *
     * @param rawSelector selector raw process function
     * @param enternal external object handler
     * @returns return a new selector
     */
    public static makeParameterSelector<
        STATE extends IterableType,
        PARAMETER_TYPE,
        RETURN_TYPE,
        EXTERNAL_RESULT = void,
    >(
        rawSelector: RawParameterSelector<STATE, PARAMETER_TYPE, RETURN_TYPE, EXTERNAL_RESULT>,
        enternal?: ExternalObjectHandleFunction<EXTERNAL_RESULT>,
    ): ParameterSelectorProvider<STATE, PARAMETER_TYPE, RETURN_TYPE> {
        return parameterSelectorCreator<STATE, PARAMETER_TYPE, RETURN_TYPE>(rawSelector, enternal);
    }

    /**
     * To create a new constant selector to return a value out of store state
     *
     * @template RETURN_TYPE type of selector return value
     * @template PARAMETER_TYPE type of selector parameter (default parameter is void type)
     *
     * @param rawSelector selector raw process function
     * @returns return a new selector
     */
    public static makeConstantSelector<RETURN_TYPE, PARAMETER_TYPE = void>(
        rawSelector: RawParameterSelector<{}, PARAMETER_TYPE, RETURN_TYPE, void>,
    ): ParameterSelectorProvider<{}, PARAMETER_TYPE, RETURN_TYPE> {
        return parameterSelectorCreator<{}, PARAMETER_TYPE, RETURN_TYPE>(rawSelector);
    }

    /** To create a new mixing selector */
    /* istanbul ignore next */
    public static makeMixingSelector = mixingSelectorCreator;

    /**
     * To create a new restrict selector
     *
     * @template RETURN_TYPE type of selector return value
     * @template PARAMETER_TYPE type of selector parameter (default parameter is void type)
     * @template RTo type of first selector generated result and the second selector parameter
     *
     * @param restrictSelector a selector to generate an intermediate state as the target selector parameter from input parameter
     * @param targetSelector a selector receive an intermediate state as parameter and return a result
     * @returns return a new selector
     */
    public static makeRestrictSelector<RETURN_TYPE, PARAMETER_TYPE = void, RTo = any>(
        restrictSelector: SPB<RTo, PARAMETER_TYPE>,
        targetSelector: ParameterSelectorProvider<any, RTo, RETURN_TYPE>,
    ): RestrictSelectorProvider<PARAMETER_TYPE, RETURN_TYPE> {
        return restrictSelectorCreator(restrictSelector, targetSelector);
    }

    /**
     * To create a virtual selector with no parameteres
     *
     * @template STATE the type of state
     * @template RETURN_TYPE type of selector return value
     *
     * @returns return a new virtual selector
     */
    public static makeVirtualSelector<STATE extends IterableType, RETURN_TYPE>(): SelectorProvider<STATE, RETURN_TYPE> {
        return selectorCreator<STATE, RETURN_TYPE>(function (_state: STATE): RETURN_TYPE {
            throw new Error(MessageBundle.getText("SELECTOR_VIRTUAL_NO_RANNABLE"));
        });
    }

    /**
     * To create a virtual selector with parameteres
     *
     * @template STATE the type of state
     * @template PARAMETER_TYPE type of selector parameter
     * @template RETURN_TYPE type of selector return value
     *
     * @returns return a new virtual selector
     */
    public static makeVirtualParameterSelector<
        STATE extends IterableType,
        PARAMETER_TYPE,
        RETURN_TYPE,
    >(): ParameterSelectorProvider<STATE, PARAMETER_TYPE, RETURN_TYPE> {
        return parameterSelectorCreator<STATE, PARAMETER_TYPE, RETURN_TYPE>(function (
            _state: STATE,
            _params: PARAMETER_TYPE,
        ): RETURN_TYPE {
            throw new Error(MessageBundle.getText("SELECTOR_VIRTUAL_NO_RANNABLE"));
        });
    }

    /**
     * To create a virtual constant selector
     *
     * @template RETURN_TYPE type of selector return value
     * @template PARAMETER_TYPE type of selector parameter (default parameter is void type)
     *
     * @returns return a new virtual selector
     */
    public static makeVirtualConstantSelector<RETURN_TYPE, PARAMETER_TYPE = void>(): ParameterSelectorProvider<
        {},
        PARAMETER_TYPE,
        RETURN_TYPE
    > {
        return parameterSelectorCreator<{}, PARAMETER_TYPE, RETURN_TYPE>(function (
            _state: {},
            _params: PARAMETER_TYPE,
        ): RETURN_TYPE {
            throw new Error(MessageBundle.getText("SELECTOR_VIRTUAL_NO_RANNABLE"));
        });
    }

    public static makeVirtualMxingSelector<PARAMETER_TYPE, RETURN_TYPE>(): MixSelectorProvider<
        PARAMETER_TYPE,
        RETURN_TYPE
    > {
        return mixingSelectorCreator([], function (_selectors, _params) {
            throw new Error(MessageBundle.getText("SELECTOR_VIRTUAL_NO_RANNABLE"));
        });
    }

    public static makeVirtualRestrictSelector<
        RETURN_TYPE,
        PARAMETER_TYPE = void,
        _RTo = any,
    >(): RestrictSelectorProvider<PARAMETER_TYPE, RETURN_TYPE> {
        return restrictSelectorCreator(SelectorFactor.makeVirtualSelector(), SelectorFactor.makeVirtualSelector());
    }
}
