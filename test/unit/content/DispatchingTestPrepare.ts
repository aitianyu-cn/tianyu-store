/** @format */

import { createStore } from "src/Store";
import {
    TestPageStateInterface,
    TestPageStateStoreType,
    TestTestStateInterface,
    TestTestStateStoreType,
    TestUserStateInterface,
    TestUserStateStoreType,
} from "./DispatchingTestContent";

export const TianyuStore = createStore();

TianyuStore.registerInterface({
    [TestUserStateStoreType]: TestUserStateInterface,
    [TestPageStateStoreType]: TestPageStateInterface,
    [TestTestStateStoreType]: TestTestStateInterface,
});

export const internalCache = {};
