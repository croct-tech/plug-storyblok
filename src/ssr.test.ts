import {isSsr} from '@/ssr';

describe('isSsr', () => {
    const originalWindow = globalThis.window;

    afterEach(() => {
        globalThis.window = originalWindow;
    });

    it('should return true when window is undefined', () => {
        // @ts-expect-error - simulating SSR environment
        delete globalThis.window;

        expect(isSsr()).toBe(true);
    });

    it('should return true when document is undefined', () => {
        // @ts-expect-error - simulating partial browser environment
        globalThis.window = {};

        expect(isSsr()).toBe(true);
    });

    it('should return true when document.createElement is undefined', () => {
        // @ts-expect-error - simulating partial browser environment
        globalThis.window = {document: {}};

        expect(isSsr()).toBe(true);
    });

    it('should return false when document.createElement is defined', () => {
        // @ts-expect-error - simulating browser environment
        globalThis.window = {document: {createElement: jest.fn()}};

        expect(isSsr()).toBe(false);
    });
});
