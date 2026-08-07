/** @format */

import { IterableType } from "src/types/Model";

export interface ITestUserState extends IterableType {
    logon: boolean;
    user: string;
    token: string;
    operations: string[];
}

export interface ITestPageState extends IterableType {
    index: number;
}

export interface ITestTestState extends IterableType {
    index: string;
}

export const USER_CONNECTION_EXTERNAL_OBJ = "user-connection";
export const USER_OPTIONS_EXTERNAL_OBJ = "user-options";
