import type {ContentDefinitionBundle} from '@croct/content-model/definition';
import {render} from '@testing-library/react';
import {useContent} from '@croct/plug-react';
import {StoryblokComponent} from '@storyblok/react';
import {createStoryblokContent} from '@/utils/content';
import {Slot} from '@/react/slot';

jest.mock(
    '@croct/plug-react',
    () => ({
        useContent: jest.fn(),
    }),
);

jest.mock(
    '@storyblok/react',
    () => ({
        StoryblokComponent: jest.fn(() => null),
    }),
);

jest.mock(
    '@/utils/content',
    () => ({
        createStoryblokContent: jest.fn(),
    }),
);

describe('Slot', () => {
    beforeEach(() => {
        jest.mocked(useContent).mockReturnValue({
            content: {},
            metadata: undefined,
        });

        jest.mocked(createStoryblokContent).mockReturnValue(undefined);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should call useContent with the slot ID and options', () => {
        render(<Slot id="slot-id" component="test_original" />);

        expect(useContent).toHaveBeenCalledWith('slot-id', {
            includeSchema: true,
            initial: null,
            fallback: null,
        });
    });

    it('should use props.blok as initial and fallback when provided', () => {
        const blok = {title: 'Test'};

        render(<Slot id="slot-id" component="test_original" props={{blok: blok}} />);

        expect(useContent).toHaveBeenCalledWith('slot-id', {
            includeSchema: true,
            initial: blok,
            fallback: blok,
        });
    });

    it('should call transform fetched content to Storyblok format', () => {
        const content = {_component: 'hero', title: 'Title'};
        const schema: ContentDefinitionBundle = {
            root: {
                type: 'structure',
                attributes: {},
            },
            definitions: {},
        };

        jest.mocked(useContent).mockReturnValue({
            content: content,
            metadata: {
                version: '1.0',
                schema: schema,
            },
        });

        render(<Slot id="slot-id" component="test_original" />);

        expect(createStoryblokContent).toHaveBeenCalledWith(content, schema);
    });

    it('should render StoryblokComponent with merged blok props', () => {
        const originalBlok = {
            _uid: '123',
            title: 'Original',
        };

        const storyblokContent = {
            _uid: '456',
            title: 'Fetched',
            extra: 'data',
        };

        jest.mocked(useContent).mockReturnValue({
            content: {},
            metadata: undefined,
        });

        jest.mocked(createStoryblokContent).mockReturnValue(storyblokContent);

        render(<Slot id="slot-id" component="test_original" props={{blok: originalBlok}} />);

        expect(StoryblokComponent).toHaveBeenCalledWith(
            expect.objectContaining({
                blok: {
                    ...originalBlok,
                    ...storyblokContent,
                    component: 'test_original',
                },
            }),
            undefined,
        );
    });

    it('should override component with the provided component prop', () => {
        const storyblokContent = {
            _uid: '456',
            component: 'hero',
        };

        jest.mocked(createStoryblokContent).mockReturnValue(storyblokContent);

        render(<Slot id="slot-id" component="custom_component" />);

        expect(StoryblokComponent).toHaveBeenCalledWith(
            expect.objectContaining({
                blok: expect.objectContaining({
                    component: 'custom_component',
                }),
            }),
            undefined,
        );
    });

    it('should forward extra props to StoryblokComponent', () => {
        render(<Slot id="slot-id" component="test_original" props={{extra: 'value', another: 123}} />);

        expect(StoryblokComponent).toHaveBeenCalledWith(
            expect.objectContaining({
                extra: 'value',
                another: 123,
            }),
            undefined,
        );
    });

    it('should handle undefined props.blok', () => {
        jest.mocked(createStoryblokContent).mockReturnValue({_uid: '123'});

        render(<Slot id="slot-id" component="test_original" props={{}} />);

        expect(StoryblokComponent).toHaveBeenCalledWith(
            expect.objectContaining({
                blok: {
                    _uid: '123',
                    component: 'test_original',
                },
            }),
            undefined,
        );
    });

    it('should handle unsuccessful content transformation', () => {
        const originalBlok = {_uid: '123', title: 'Original'};

        jest.mocked(createStoryblokContent).mockReturnValue(undefined);

        render(<Slot id="slot-id" component="test_original" props={{blok: originalBlok}} />);

        expect(StoryblokComponent).toHaveBeenCalledWith(
            expect.objectContaining({
                blok: {
                    ...originalBlok,
                    component: 'test_original',
                },
            }),
            undefined,
        );
    });
});
