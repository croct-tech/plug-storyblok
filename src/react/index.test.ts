import type {ApiDecorator} from '@/utils/decorator';

jest.mock(
    '@/utils/fetch',
    () => ({
        fetchBrowserContent: jest.fn(),
    }),
);

jest.mock(
    '@/react/decorator',
    () => ({
        createOptionDecorator: jest.fn(() => jest.fn()),
    }),
);

describe('withCroct', () => {
    beforeEach(() => {
        jest.resetModules();
        jest.clearAllMocks();
    });

    const mocks = {
        get createOptionDecorator() {
            return jest.requireMock('@/react/decorator').createOptionDecorator;
        },
        get fetchBrowserContent() {
            return jest.requireMock('@/utils/fetch').fetchBrowserContent;
        },
    };

    it('should use fetchBrowserContent as the fetchContent implementation', async () => {
        await import('@/react/index');

        const decorator: ApiDecorator = mocks.createOptionDecorator.mock.calls[0][0];

        expect(decorator.fetchContent).toBe(mocks.fetchBrowserContent);
    });
});
