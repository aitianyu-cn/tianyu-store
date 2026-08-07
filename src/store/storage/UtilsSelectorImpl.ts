/** @format */

import { getBoolean } from "@aitianyu.cn/types";
import { SelectorFactor } from "../SelectorFactor";

export const ConvertAnyToBoolean = SelectorFactor.makeConstantSelector<boolean, any>(function (_, data) {
    return getBoolean(data);
});
