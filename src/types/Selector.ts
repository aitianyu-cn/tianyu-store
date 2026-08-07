/**@format */

import { ExternalObjectHandleFunction } from "./ExternalObject";
import { InstanceId } from "./InstanceId";
import { IOperator, IOperatorInfo, IterableType, Missing } from "./Model";

/**
 * Tianyu Store Selector Instance
 *
 * Selector Instance is generated from a selector instance provider
 */
export interface IInstanceSelector<_RESULT> {
    /** Selector id */
    id: string;
    /** Selector Full Name */
    selector: string;
    /** Store Entity Type */
    storeType: string;
    /** Target Store Instance Id */
    instanceId: InstanceId;
    /** Additional Parameter */
    params: any;
    /** Indicates the store operator is a template or fact */
    template?: boolean;
}

export enum SelectorType {
    NORMAL = "normal selector",
    PARAMETER = "parameter selector",
    MIX = "mix selector",
    RESTRICT = "restrict selector",
}

/**
 * Type of Tianyu Store Selector Returned result.
 * Combine Missing type and specified type together.
 * If the selector could not get the state to return Missing to ensure a value returned.
 */
export type SelectorResult<RETURN_TYPE> = Missing | RETURN_TYPE;

/**
 * Raw Selector Provided function
 *
 * @template STATE the type of store state
 * @template RETURN_TYPE the type of selector returns
 */
export interface RawSelector<STATE extends IterableType, RETURN_TYPE, EXTERNAL_RESULT = any> {
    /**
     * @param state the input state of store
     * @returns return values
     */
    (state: STATE, externalReaderResult?: EXTERNAL_RESULT | void): RETURN_TYPE;
}

/**
 * Raw Parameter Selector Provided function
 *
 * @template STATE the type of store state
 * @template PARAMETER_TYPE the type of selector parameter
 * @template RETURN_TYPE the type of selector returns
 */
export interface RawParameterSelector<STATE extends IterableType, PARAMETER_TYPE, RETURN_TYPE, EXTERNAL_RESULT = any> {
    /**
     * @param state the input state of store
     * @param params the parameter of selector
     * @returns return values
     */
    (state: STATE, params: PARAMETER_TYPE, externalReaderResult?: EXTERNAL_RESULT | void): RETURN_TYPE;
}

/**
 * Tianyu Store Base Selector Definition
 *
 * @template _STATE the state type of selector provider (placeholder for type checking)
 */
export interface ISelectorProviderBase<_STATE extends IterableType, _RETURN_TYPE> extends IOperator {
    /** Store Selector Id */
    id: string;
    /** Store Selector Unified Name (Same as Id currently) */
    selector: string;
    type: SelectorType;
    /** Store Seletor External Object Operator */
    external?: ExternalObjectHandleFunction<any>;
}

/**
 * Tianyu Store Selector Instance Creator
 *
 * @template STATE the type of store state
 * @template RETURN_TYPE the type of selector return value
 */
export interface SelectorProvider<STATE extends IterableType, RETURN_TYPE>
    extends ISelectorProviderBase<STATE, RETURN_TYPE> {
    /**
     * Store Selector Instance Creator to generate a store selector instance
     *
     * @param instanceId store instance that indicates the state which should be gotten from
     * @returns return a selector instance
     */
    (instanceId: InstanceId): IInstanceSelector<RETURN_TYPE>;
    /** Store Selector Execution Function */
    getter: RawSelector<STATE, RETURN_TYPE>;
}

/**
 * Tianyu Store Parameter Selector Instance Creator
 *
 * @template STATE the type of store state
 * @template PARAMETER_TYPE the type of selector parameter
 * @template RETURN_TYPE the type of selector return value
 */
export interface ParameterSelectorProvider<STATE extends IterableType, PARAMETER_TYPE, RETURN_TYPE>
    extends ISelectorProviderBase<STATE, RETURN_TYPE> {
    /**
     * Store Parameter Selector Instance Creator to generate a store selector instance
     *
     * @param instanceId store instance that indicates the state which should be gotten from
     * @param params parameter of created selector instance
     * @returns return a selector instance
     */
    (instanceId: InstanceId, params: PARAMETER_TYPE): IInstanceSelector<RETURN_TYPE>;
    /** Store Selector Execution Function */
    getter: RawParameterSelector<STATE, PARAMETER_TYPE, RETURN_TYPE>;
}

/**
 * Tianyu Store Selector Instance Creator of Mixing-Selectors
 *
 * @template PARAMETER_TYPE the type of selector parameter
 * @template RETURN_TYPE the type of selector return value
 */
export interface MixSelectorProvider<PARAMETER_TYPE, RETURN_TYPE> extends ISelectorProviderBase<any, RETURN_TYPE> {
    /**
     * Store Mixing-Selectors Selector Instance Creator to generate a store selector instance
     *
     * @param instanceId store instance that indicates the state which should be gotten from
     * @param params parameter of created selector instance
     * @returns return a selector instance
     */
    (instanceId: InstanceId, params?: PARAMETER_TYPE | void): IInstanceSelector<RETURN_TYPE>;
    /** to be mixed selector infos */
    getters: IOperatorInfo[];
    /** function to merge all states from mixing-selectors and generate a final result */
    resultGenerator(...params: any[]): RETURN_TYPE;
}

/**
 * Tianyu Store Selector Instance Creator of Restroct Selectors
 *
 * @template PARAMETER_TYPE the type of selector parameter
 * @template RETURN_TYPE the type of selector return value
 */
export interface RestrictSelectorProvider<PARAMETER_TYPE, RETURN_TYPE> extends ISelectorProviderBase<any, RETURN_TYPE> {
    /**
     * Store restrict Selector Instance Creator to generate a store selector instance
     *
     * @param instanceId store instance that indicates the state which should be gotten from
     * @param params parameter of created selector instance
     * @returns return a selector instance
     */
    (instanceId: InstanceId, params?: PARAMETER_TYPE | void): IInstanceSelector<RETURN_TYPE>;
    /** a selector to generate a result to be used for the another selector */
    parameterGenerator: IOperatorInfo;
    /** a selector to generate the selector result */
    resultGenerator: IOperatorInfo;
}

/** Selector Provider Combination type */
export type SPB<RT, PR = void> =
    | SelectorProvider<any, RT>
    | ParameterSelectorProvider<any, PR, RT>
    | MixSelectorProvider<PR, RT>
    | RestrictSelectorProvider<PR, RT>;
