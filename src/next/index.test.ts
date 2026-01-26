import type {FetchOptions} from '@croct/plug-next/server';
import type {FetchResponse} from '@croct/plug';
import type {DynamicSlotId} from '@croct/plug/slot';
import type {ISbStoriesParams} from '@storyblok/react';
import type {ApiDecorator} from '@/utils/decorator';

jest.mock(
    '@croct/plug-next/server',
    () => ({
        fetchContent: jest.fn(),
    }),
);

jest.mock(
    '@croct/plug-next/config/context',
    () => ({
        getRequestUri: jest.fn(() => Promise.resolve('')),
    }),
);

jest.mock(
    '@croct/plug',
    () => ({
        __esModule: true,
        default: {
            fetch: jest.fn(),
        },
    }),
);

jest.mock(
    '@/utils/ssr',
    () => ({
        isSsr: jest.fn(),
    }),
);

jest.mock(
    '@/utils/preview',
    () => ({
        isPreviewUrl: jest.fn(),
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

    const fetchedContent: FetchResponse<DynamicSlotId> = {
        content: {
            _component: null,
        },
        metadata: {
            version: '1.0',
        },
    };

    const mocks = {
        get createOptionDecorator() {
            return jest.requireMock('@/react/decorator').createOptionDecorator;
        },
        get isSsr() {
            return jest.requireMock('@/utils/ssr').isSsr;
        },
        get fetchContent() {
            return jest.requireMock('@croct/plug-next/server').fetchContent;
        },
        get croctFetch() {
            return jest.requireMock('@croct/plug').default.fetch;
        },
        get getRequestUri() {
            return jest.requireMock('@croct/plug-next/config/context').getRequestUri;
        },
        get isPreviewUrl() {
            return jest.requireMock('@/utils/preview').isPreviewUrl;
        },
    };

    it('should resolve params as undefined when params is undefined', async () => {
        await import('@/next/index');

        const decorator: ApiDecorator = mocks.createOptionDecorator.mock.calls[0][0];

        expect(decorator.resolveParams!(undefined)).toBeUndefined();
    });

    it('should return params without route when route is present', async () => {
        await import('@/next/index');

        const decorator: ApiDecorator = mocks.createOptionDecorator.mock.calls[0][0];

        const params: ISbStoriesParams = {
            version: 'draft',
            per_page: 10,
            route: {} as FetchOptions['route'],
        };

        const result = decorator.resolveParams!(params);

        expect(result).toEqual({version: 'draft', per_page: 10});
        expect(result).not.toHaveProperty('route');
    });

    it('should return params without route when route is not present', async () => {
        await import('@/next/index');

        const decorator: ApiDecorator = mocks.createOptionDecorator.mock.calls[0][0];

        const params: ISbStoriesParams = {
            version: 'draft',
            per_page: 10,
        };

        const result = decorator.resolveParams!(params);

        expect(result).toEqual({version: 'draft', per_page: 10});
    });

    it('should call fetchContent from plug-next/server when fetchContent is called in SSR environment', async () => {
        mocks.isSsr.mockReturnValue(true);
        mocks.isPreviewUrl.mockReturnValue(false);

        await import('@/next/index');

        const decorator: ApiDecorator = mocks.createOptionDecorator.mock.calls[0][0];

        const {fetchContent} = mocks;

        fetchContent.mockResolvedValue(fetchedContent);

        const context = {} as FetchOptions['route'];

        const result = await decorator.fetchContent('slot-id', {
            version: 'draft',
            route: context,
        });

        expect(fetchContent).toHaveBeenCalledWith('slot-id', {includeSchema: true, route: context});
        expect(result).toBe(fetchedContent);
    });

    it('should return undefined in SSR when URL is a preview URL to avoid overwriting content', async () => {
        mocks.isSsr.mockReturnValue(true);
        mocks.isPreviewUrl.mockReturnValue(true);

        await import('@/next/index');

        const decorator: ApiDecorator = mocks.createOptionDecorator.mock.calls[0][0];

        const context = {} as FetchOptions['route'];

        const result = await decorator.fetchContent('slot-id', {
            version: 'draft',
            route: context,
        });

        expect(mocks.getRequestUri).toHaveBeenCalledWith(context);
        expect(mocks.isPreviewUrl).toHaveBeenCalledWith('https://example.com/page?_storyblok_c=123');
        expect(mocks.fetchContent).not.toHaveBeenCalled();
        expect(result).toBeUndefined();
    });

    it('should fetch content normally when request context is not available in SSR', async () => {
        mocks.isSsr.mockReturnValue(true);
        mocks.getRequestUri.mockRejectedValue(new Error('No request context'));
        mocks.fetchContent.mockResolvedValue(fetchedContent);

        await import('@/next/index');

        const decorator: ApiDecorator = mocks.createOptionDecorator.mock.calls[0][0];

        const context = {} as FetchOptions['route'];

        const result = await decorator.fetchContent('slot-id', {
            version: 'draft',
            route: context,
        });

        expect(mocks.getRequestUri).toHaveBeenCalledWith(context);
        expect(mocks.isPreviewUrl).not.toHaveBeenCalled();
        expect(mocks.fetchContent).toHaveBeenCalledWith('slot-id', {includeSchema: true, route: context});
        expect(result).toBe(fetchedContent);
    });

    it('should call croct.fetch when fetchContent is called in browser environment', async () => {
        mocks.isSsr.mockReturnValue(false);
        mocks.isPreviewUrl.mockReturnValue(false);

        await import('@/next/index');

        const decorator: ApiDecorator = mocks.createOptionDecorator.mock.calls[0][0];

        const {croctFetch} = mocks;

        croctFetch.mockResolvedValue(fetchedContent);

        const result = await decorator.fetchContent('slot-id');

        expect(croctFetch).toHaveBeenCalledWith('slot-id', {includeSchema: true});
        expect(result).toBe(fetchedContent);
    });

    it('should return undefined in browser when URL is a preview URL to avoid overwriting content', async () => {
        mocks.isSsr.mockReturnValue(false);
        mocks.isPreviewUrl.mockReturnValue(true);

        await import('@/next/index');

        const decorator: ApiDecorator = mocks.createOptionDecorator.mock.calls[0][0];

        const result = await decorator.fetchContent('slot-id');

        expect(mocks.isPreviewUrl).toHaveBeenCalledWith(window.location.href);
        expect(mocks.croctFetch).not.toHaveBeenCalled();
        expect(result).toBeUndefined();
    });
});
