/**@format */

import { IOperatorInfo, OperatorInfoType } from "src/types/Model";

export function defaultInfoGenerator(type: OperatorInfoType): IOperatorInfo {
    return {
        type: type,
        storeType: "",
        path: "",
        name: "",
        fullName: "",
        template: false,
    };
}
