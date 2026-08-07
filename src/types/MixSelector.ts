/** @format */

import { MixSelectorProvider, ParameterSelectorProvider, SelectorProvider, SPB } from "./Selector";

export interface ICreateMixingSelector {
    /**
     * Takes an array of selectors and a function that get the results of those selectors and return the merged result
     *
     * @template STATE the type of state
     * @template PARAMETER_TYPE type of selector parameter
     * @template RESULT_TYPE type of selector return value
     *
     * @template S the types of selectors
     *
     * @param selectors an array of selectors
     * @param resultGenerator a pure function to union all selectors' results and get a merged result
     *
     * @returns return a new selector
     */
    <PARAMETER_TYPE, RESULT_TYPE, S>(
        selectors: SPB<S>[],
        resultGenerator: (selectors: S[], param: PARAMETER_TYPE) => RESULT_TYPE,
    ): MixSelectorProvider<PARAMETER_TYPE, RESULT_TYPE>;

    /**
     * Takes a selector and a function that get the result of selector and return the merged result
     *
     * @template STATE the type of state
     * @template PARAMETER_TYPE type of selector parameter
     * @template RESULT_TYPE type of selector return value
     *
     * @template SA the type of selector result
     *
     * @param selector a selector to merge
     * @param resultGenerator a pure function to union selector's result and selector parameters and get a merged result
     *
     * @returns return a new selector
     */
    <PARAMETER_TYPE, RESULT_TYPE, SA>(
        selector: SPB<SA>,
        resultGenerator: (selector: SA, param: PARAMETER_TYPE) => RESULT_TYPE,
    ): MixSelectorProvider<PARAMETER_TYPE, RESULT_TYPE>;

    /**
     * Takes two selectors and a function that get the results of selectors and return the merged result
     *
     * @template STATE the type of state
     * @template PARAMETER_TYPE type of selector parameter
     * @template RESULT_TYPE type of selector return value
     *
     * @template SA the type of the first selector result
     * @template SB the type of the second selector result
     *
     * @param selectorA the first selector to merge
     * @param selectorB the second selector to merge
     * @param resultGenerator a pure function to union two selector's results and selector parameters and get a merged result
     *
     * @returns return a new selector
     */
    <PARAMETER_TYPE, RESULT_TYPE, SA, SB>(
        selectorA: SPB<SA>,
        selectorB: SPB<SB>,
        resultGenerator: (selectorA: SA, selectorB: SB, param: PARAMETER_TYPE) => RESULT_TYPE,
    ): MixSelectorProvider<PARAMETER_TYPE, RESULT_TYPE>;

    /** Overload which same as previous but with 3 selectors */
    <PARAMETER_TYPE, RESULT_TYPE, SA, SB, SC>(
        selectorA: SPB<SA>,
        selectorB: SPB<SB>,
        selectorC: SPB<SC>,
        resultGenerator: (selectorA: SA, selectorB: SB, selectorC: SC, param: PARAMETER_TYPE) => RESULT_TYPE,
    ): MixSelectorProvider<PARAMETER_TYPE, RESULT_TYPE>;

    /** Overload which same as previous but with 4 selectors */
    <PARAMETER_TYPE, RESULT_TYPE, SA, SB, SC, SD>(
        selectorA: SPB<SA>,
        selectorB: SPB<SB>,
        selectorC: SPB<SC>,
        selectorD: SPB<SD>,
        resultGenerator: (
            selectorA: SA,
            selectorB: SB,
            selectorC: SC,
            selectorD: SD,
            param: PARAMETER_TYPE,
        ) => RESULT_TYPE,
    ): MixSelectorProvider<PARAMETER_TYPE, RESULT_TYPE>;

    /** Overload which same as previous but with 5 selectors */
    <PARAMETER_TYPE, RESULT_TYPE, SA, SB, SC, SD, SE>(
        selectorA: SPB<SA>,
        selectorB: SPB<SB>,
        selectorC: SPB<SC>,
        selectorD: SPB<SD>,
        selectorE: SPB<SE>,
        resultGenerator: (
            selectorA: SA,
            selectorB: SB,
            selectorC: SC,
            selectorD: SD,
            selectorE: SE,
            param: PARAMETER_TYPE,
        ) => RESULT_TYPE,
    ): MixSelectorProvider<PARAMETER_TYPE, RESULT_TYPE>;

    /** Overload which same as previous but with 6 selectors */
    <PARAMETER_TYPE, RESULT_TYPE, SA, SB, SC, SD, SE, SF>(
        selectorA: SPB<SA>,
        selectorB: SPB<SB>,
        selectorC: SPB<SC>,
        selectorD: SPB<SD>,
        selectorE: SPB<SE>,
        selectorF: SPB<SF>,
        resultGenerator: (
            selectorA: SA,
            selectorB: SB,
            selectorC: SC,
            selectorD: SD,
            selectorE: SE,
            selectorF: SF,
            param: PARAMETER_TYPE,
        ) => RESULT_TYPE,
    ): MixSelectorProvider<PARAMETER_TYPE, RESULT_TYPE>;

    /** Overload which same as previous but with 7 selectors */
    <PARAMETER_TYPE, RESULT_TYPE, SA, SB, SC, SD, SE, SF, SG>(
        selectorA: SPB<SA>,
        selectorB: SPB<SB>,
        selectorC: SPB<SC>,
        selectorD: SPB<SD>,
        selectorE: SPB<SE>,
        selectorF: SPB<SF>,
        selectorG: SPB<SG>,
        resultGenerator: (
            selectorA: SA,
            selectorB: SB,
            selectorC: SC,
            selectorD: SD,
            selectorE: SE,
            selectorF: SF,
            selectorG: SG,
            param: PARAMETER_TYPE,
        ) => RESULT_TYPE,
    ): MixSelectorProvider<PARAMETER_TYPE, RESULT_TYPE>;

    /** Overload which same as previous but with 8 selectors */
    <PARAMETER_TYPE, RESULT_TYPE, SA, SB, SC, SD, SE, SF, SG, SH>(
        selectorA: SPB<SA>,
        selectorB: SPB<SB>,
        selectorC: SPB<SC>,
        selectorD: SPB<SD>,
        selectorE: SPB<SE>,
        selectorF: SPB<SF>,
        selectorG: SPB<SG>,
        selectorH: SPB<SH>,
        resultGenerator: (
            selectorA: SA,
            selectorB: SB,
            selectorC: SC,
            selectorD: SD,
            selectorE: SE,
            selectorF: SF,
            selectorG: SG,
            selectorH: SH,
            param: PARAMETER_TYPE,
        ) => RESULT_TYPE,
    ): MixSelectorProvider<PARAMETER_TYPE, RESULT_TYPE>;

    /** Overload which same as previous but with 9 selectors */
    <PARAMETER_TYPE, RESULT_TYPE, SA, SB, SC, SD, SE, SF, SG, SH, SI>(
        selectorA: SPB<SA>,
        selectorB: SPB<SB>,
        selectorC: SPB<SC>,
        selectorD: SPB<SD>,
        selectorE: SPB<SE>,
        selectorF: SPB<SF>,
        selectorG: SPB<SG>,
        selectorH: SPB<SH>,
        selectorI: SPB<SI>,
        resultGenerator: (
            selectorA: SA,
            selectorB: SB,
            selectorC: SC,
            selectorD: SD,
            selectorE: SE,
            selectorF: SF,
            selectorG: SG,
            selectorH: SH,
            selectorI: SI,
            param: PARAMETER_TYPE,
        ) => RESULT_TYPE,
    ): MixSelectorProvider<PARAMETER_TYPE, RESULT_TYPE>;

    /** Overload which same as previous but with 10 selectors */
    <PARAMETER_TYPE, RESULT_TYPE, SA, SB, SC, SD, SE, SF, SG, SH, SI, SJ>(
        selectorA: SPB<SA>,
        selectorB: SPB<SB>,
        selectorC: SPB<SC>,
        selectorD: SPB<SD>,
        selectorE: SPB<SE>,
        selectorF: SPB<SF>,
        selectorG: SPB<SG>,
        selectorH: SPB<SH>,
        selectorI: SPB<SI>,
        selectorJ: SPB<SJ>,
        resultGenerator: (
            selectorA: SA,
            selectorB: SB,
            selectorC: SC,
            selectorD: SD,
            selectorE: SE,
            selectorF: SF,
            selectorG: SG,
            selectorH: SH,
            selectorI: SI,
            selectorJ: SJ,
            param: PARAMETER_TYPE,
        ) => RESULT_TYPE,
    ): MixSelectorProvider<PARAMETER_TYPE, RESULT_TYPE>;
}
