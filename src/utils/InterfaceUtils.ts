/**@format */

import { IActionProviderBase } from "src/types/Action";
import { ITianyuStoreInterfaceImplementation, ITianyuStoreInterfaceList } from "src/types/Interface";
import { ISelectorProviderBase } from "src/types/Selector";

/**
 * Function to register the store interface to generate operator information
 *
 * @param element the store interface implementation element
 * @param storeType the store type of store interface
 *
 * WARNING:
 * IF STORE TYPE IS NOT PROVIDED,
 * THE EXPOSE REGISTERED ACTIONS AND SELECTORS WILL NOT BE ABLE TO BE USED IN STORE
 */
export function registerExpose(element: ITianyuStoreInterfaceImplementation, storeType?: string): void {
    _registerExposeInternal(element, storeType || "", storeType || "");
}

/**
 * Function to register the store template interface to generate operator information
 *
 * @param element the store template interface implementation element
 *
 * INFORMATION:
 * THIS FUNCTION WILL REGISTER A COMMON INTERFACE FOR STORE THAT THE INTERFACE CAN BE RUN IN MULTIPLE
 * INSTANCES WHICH ARE IMPLEMENTED THE INTERFACE
 */
export function registerTemplate(element: ITianyuStoreInterfaceImplementation): void {
    _registerExposeInternal(element, "", true);
}

/** this is for internal using */
export function registerInterface(
    element: ITianyuStoreInterfaceImplementation,
    storeType: string,
): ITianyuStoreInterfaceList {
    return _registerExposeInternal(element, storeType, storeType);
}

function checkSelector(obj: any): boolean {
    return typeof obj !== "undefined" && !!(obj as ISelectorProviderBase<any, any>)?.selector;
}

function checkAction(obj: any): boolean {
    return typeof obj !== "undefined" && !!(obj as IActionProviderBase<any>)?.actionId;
}

function _registerExposeInternal(
    element: ITianyuStoreInterfaceImplementation,
    path: string,
    storeTypeOrTemplate: string | boolean,
): ITianyuStoreInterfaceList {
    let interfaceList: ITianyuStoreInterfaceList = {};
    for (const key of Object.keys(element)) {
        const dir = element[key];
        if (!dir) {
            continue;
        }

        const dirPath = path ? `${path}.${key}` : key;
        const isSelector = checkSelector(dir);
        const isAction = checkAction(dir);
        if (isSelector || isAction) {
            // this is an action or selector
            const operator = isSelector ? (dir as ISelectorProviderBase<any, any>) : (dir as IActionProviderBase<any>);
            operator.info.name = key;
            operator.info.path = path;
            operator.info.fullName = dirPath;
            operator.info.storeType = typeof storeTypeOrTemplate === "string" ? storeTypeOrTemplate : "";
            operator.info.template = typeof storeTypeOrTemplate === "boolean" ? storeTypeOrTemplate : false;

            // insert a new operator
            interfaceList[dirPath] = operator;
        } else {
            // this is a sub element
            // to merge two object
            interfaceList = {
                ...interfaceList,
                ..._registerExposeInternal(dir as ITianyuStoreInterfaceImplementation, dirPath, storeTypeOrTemplate),
            };
        }
    }

    return interfaceList;
}
