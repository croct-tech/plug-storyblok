import type {FetchResponse} from '@croct/plug';
import croct from '@croct/plug';
import type {DynamicSlotId} from '@croct/plug/slot';
import {createOptionDecorator} from '@/react/decorator';

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
    '@/react/decorator',
    () => ({
        createOptionDecorator: jest.fn(() => jest.fn()),
    }),
);

describe('withCroct', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should call croct.fetch with includeSchema option when fetchContent is called', async () => {
        await import('@/react/index');

        const decorator = jest.mocked(createOptionDecorator).mock.calls[0][0];

        const fetchedContent: FetchResponse<DynamicSlotId> = {
            content: {
                _component: null,
            },
            metadata: {
                version: '1.0',
            },
        };

        jest.mocked(croct.fetch).mockResolvedValue(fetchedContent);

        const result = await decorator.fetchContent('slot-id');

        expect(croct.fetch).toHaveBeenCalledWith('slot-id', {includeSchema: true});

        expect(result).toBe(fetchedContent);
    });
});
