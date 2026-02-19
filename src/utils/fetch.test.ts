import type {FetchResponse} from '@croct/plug';
import type {DynamicSlotId} from '@croct/plug/slot';

jest.mock(
    '@croct/plug',
    () => ({
        __esModule: true,
        default: {fetch: jest.fn()},
    }),
);

jest.mock(
    '@/utils/preview',
    () => ({
        isPreviewUrl: jest.fn(),
    }),
);

describe('fetchBrowserContent', () => {
    beforeEach(() => {
        jest.resetModules();
        jest.clearAllMocks();
    });

    const mocks = {
        get croctFetch() {
            return jest.requireMock('@croct/plug').default.fetch;
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
            contentSource: 'experience',
        },
    };

    it('should call croct.fetch with includeSchema option', async () => {
        mocks.isPreviewUrl.mockReturnValue(false);

        const {fetchBrowserContent} = await import('@/utils/fetch');

        mocks.croctFetch.mockResolvedValue(fetchedContent);

        const result = await fetchBrowserContent('slot-id');

        expect(mocks.croctFetch).toHaveBeenCalledWith('slot-id', {includeSchema: true});
        expect(result).toBe(fetchedContent);
    });

    it('should return undefined when in preview mode to avoid overwriting content', async () => {
        mocks.isPreviewUrl.mockReturnValue(true);

        const {fetchBrowserContent} = await import('@/utils/fetch');

        const result = await fetchBrowserContent('slot-id');

        expect(mocks.isPreviewUrl).toHaveBeenCalledWith(window.location.href);
        expect(mocks.croctFetch).not.toHaveBeenCalled();
        expect(result).toBeUndefined();
    });

    it('should return undefined when content source is a slot', async () => {
        mocks.isPreviewUrl.mockReturnValue(false);

        const {fetchBrowserContent} = await import('@/utils/fetch');

        const slotContent: FetchResponse<DynamicSlotId> = {
            content: {
                _component: null,
            },
            metadata: {
                version: '1.0',
                contentSource: 'slot',
            },
        };

        mocks.croctFetch.mockResolvedValue(slotContent);

        const result = await fetchBrowserContent('slot-id');

        expect(mocks.croctFetch).toHaveBeenCalledWith('slot-id', {includeSchema: true});
        expect(result).toBeUndefined();
    });
});
