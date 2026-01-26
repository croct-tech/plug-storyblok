import type {FetchResponse} from '@croct/plug';
import type {DynamicSlotId} from '@croct/plug/slot';
import type {ApiDecorator} from '@/utils/decorator';

jest.mock(
    '@croct/plug',
    () => ({
        __esModule: true,
        default: {fetch: jest.fn()},
    }),
);

jest.mock(
    '@/utils/decorator',
    () => ({
        createOptionDecorator: jest.fn(() => jest.fn()),
    }),
);

jest.mock(
    '@/utils/preview',
    () => ({
        isPreviewUrl: jest.fn(),
    }),
);

describe('withCroct', () => {
    beforeEach(() => {
        jest.resetModules();
        jest.clearAllMocks();
    });

    const mocks = {
        get croctFetch() {
            return jest.requireMock('@croct/plug').default.fetch;
        },
        get createOptionDecorator() {
            return jest.requireMock('@/utils/decorator').createOptionDecorator;
        },
        get isPreviewUrl() {
            return jest.requireMock('@/utils/preview').isPreviewUrl;
        },
    };

    const fetchedContent: FetchResponse<DynamicSlotId> = {
        content: {
            _component: null,
        },
        metadata: {
            version: '1.0',
        },
    };

    it('should call croct.fetch with includeSchema option when fetchContent is called', async () => {
        mocks.isPreviewUrl.mockReturnValue(false);

        await import('@/js/index');

        const decorator: ApiDecorator = mocks.createOptionDecorator.mock.calls[0][0];

        mocks.croctFetch.mockResolvedValue(fetchedContent);

        const result = await decorator.fetchContent('slot-id');

        expect(mocks.croctFetch).toHaveBeenCalledWith('slot-id', {includeSchema: true});
        expect(result).toBe(fetchedContent);
    });

    it('should return undefined when in preview mode to avoid overwriting content', async () => {
        mocks.isPreviewUrl.mockReturnValue(true);

        await import('@/js/index');

        const decorator: ApiDecorator = mocks.createOptionDecorator.mock.calls[0][0];

        const result = await decorator.fetchContent('slot-id');

        expect(mocks.isPreviewUrl).toHaveBeenCalledWith(window.location.href);
        expect(mocks.croctFetch).not.toHaveBeenCalled();
        expect(result).toBeUndefined();
    });
});
