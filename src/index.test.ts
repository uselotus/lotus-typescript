import {Lotus} from "./index";

const API_KEY = "5oA3iZtJ.EXWflNUfL69oLlIWrVZyYeH4CWaN3QHq"
const lotus = new Lotus(API_KEY, {
    host: 'https://api.uselotus.io/', // You can omit this line if using Lotus Cloud
    flushAT: 1,
})

jest.mock('axios', () => jest.fn(() => Promise.resolve({ data: 'data' })));

jest.mock('axios', () => {
    return {
        interceptors: {
            request: { use: jest.fn(), eject: jest.fn() },
            response: { use: jest.fn(), eject: jest.fn() },
        },
    };
});

describe("First Test", () => {
    it("should return 15 for add(10,5)", () => {
        console.log(lotus)
        expect(lotus.getAllPlans()).toBe(15);
    });
});