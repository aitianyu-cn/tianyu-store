/**@format */

import { Log } from "../../src/infra/Log";
import { SubscribeEntity } from "../../src/store/SubscribeEntity";

describe("aitianyu-cn.node-module.tianyu-store.store.SubscribeEntity", () => {
    it("get and set", () => {
        const entity = new SubscribeEntity();
        expect(entity.get().size).toEqual(0);

        const sub1 = entity.subscribe(() => undefined);
        expect(entity.get().size).toEqual(1);

        sub1.unsubscribe();
        expect(entity.get().size).toEqual(0);
    });

    describe("fire", () => {
        it("fire", (done) => {
            const entity = new SubscribeEntity();
            expect(entity.get().size).toEqual(0);

            const sub1 = entity.subscribe(() => {
                done();
            });
            expect(entity.get().size).toEqual(1);

            entity.fire();
        });

        it("fire with exception - known reason", (done) => {
            const entity = new SubscribeEntity();
            expect(entity.get().size).toEqual(0);

            const sub1 = entity.subscribe(() => {
                throw new Error("not implement");
            });
            expect(entity.get().size).toEqual(1);

            jest.spyOn(Log, "error").mockImplementation((msg) => {
                expect(msg.endsWith("not implement")).toBeTruthy();
                done();
            });

            entity.fire();
        });

        it("fire with exception - unknown reason", (done) => {
            const entity = new SubscribeEntity();
            expect(entity.get().size).toEqual(0);

            const sub1 = entity.subscribe(() => {
                throw new Error();
            });
            expect(entity.get().size).toEqual(1);

            jest.spyOn(Log, "error").mockImplementation((msg) => {
                expect(msg.endsWith("Unknown Reason")).toBeTruthy();
                done();
            });

            entity.fire();
        });
    });
});