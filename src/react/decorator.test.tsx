import type {ComponentType, FunctionComponent, ReactElement} from 'react';
import type {SbSDKOptions} from '@storyblok/js';
import {render, screen} from '@testing-library/react';
import type {SbReactSDKOptions} from '@storyblok/react';
import type {ApiDecorator} from '@/utils/decorator';
import {createOptionDecorator} from '@/react/decorator';
import {createOptionDecorator as createDefaultOptionDecorator} from '@/utils/decorator';
import {Slot} from '@/react/slot';

jest.mock(
    '@/utils/decorator',
    () => ({
        createOptionDecorator: jest.fn(),
    }),
);

jest.mock(
    '@/react/slot',
    () => ({
        Slot: jest.fn(() => null),
    }),
);

describe('createOptionDecorator', () => {
    beforeEach(() => {
        jest.mocked(createDefaultOptionDecorator).mockReturnValue(options => options);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should call the default decorator factory with the provided decorator', () => {
        const decorator: ApiDecorator = {
            fetchContent: jest.fn(),
        };

        createOptionDecorator(decorator);

        expect(createDefaultOptionDecorator).toHaveBeenCalledWith(decorator);
    });

    it('should return options unchanged when the components option is undefined', () => {
        const decorator: ApiDecorator = {
            fetchContent: jest.fn(),
        };

        const options: SbSDKOptions = {
            accessToken: 'token',
        };

        const result = createOptionDecorator(decorator)(options);

        expect(result).toEqual(options);
    });

    it('should decorate components when the components option is a valid component map', () => {
        const decorator: ApiDecorator = {
            fetchContent: jest.fn(),
        };

        const TestComponent: FunctionComponent = () => <div>Test</div>;

        TestComponent.displayName = 'TestComponent';

        const options: SbReactSDKOptions = {
            accessToken: 'token',
            components: {
                test: TestComponent,
            },
        };

        const result = createOptionDecorator(decorator)(options);

        expect(result.components).toHaveProperty('test');
        expect(result.components).toHaveProperty('test_original');
        expect(result.components!.test_original).toBe(TestComponent);
    });

    it('should set the display name of the decorated component', () => {
        const decorator: ApiDecorator = {
            fetchContent: jest.fn(),
        };
        const TestComponent: FunctionComponent = () => <div>Test</div>;

        TestComponent.displayName = 'TestComponent';

        const options: SbReactSDKOptions = {
            accessToken: 'token',
            components: {
                test: TestComponent,
            },
        };

        const result = createOptionDecorator(decorator)(options);

        expect((result.components!.test as FunctionComponent).displayName).toBe('Croct<TestComponent>');
    });

    it('should use the function name when displayName is not set', () => {
        const decorator: ApiDecorator = {
            fetchContent: jest.fn(),
        };

        function NamedComponent(): ReactElement {
            return <div>Test</div>;
        }

        const options: SbReactSDKOptions = {
            accessToken: 'token',
            components: {
                test: NamedComponent,
            },
        };

        const result = createOptionDecorator(decorator)(options);

        expect((result.components!.test as FunctionComponent).displayName).toBe('Croct<NamedComponent>');
    });

    it('should render the Slot component when blok.croct is a non-empty string', () => {
        const decorator: ApiDecorator = {
            fetchContent: jest.fn(),
        };
        const TestComponent: FunctionComponent = () => <div>Original</div>;

        const options: SbReactSDKOptions = {
            accessToken: 'token',
            components: {
                test: TestComponent,
            },
        };

        const result = createOptionDecorator(decorator)(options);

        const DecoratedComponent = result.components!.test as ComponentType<{blok: Record<string, any>}>;

        render(<DecoratedComponent blok={{croct: 'slot-id'}} />);

        expect(Slot).toHaveBeenCalledWith(
            {
                id: 'slot-id',
                component: 'test_original',
                props: {
                    blok: {
                        croct: 'slot-id',
                    },
                },
            },
            undefined,
        );
    });

    it('should render the original component when blok is undefined', () => {
        const decorator: ApiDecorator = {
            fetchContent: jest.fn(),
        };

        const TestComponent: FunctionComponent = () => <div data-testid="original">Original</div>;

        const options: SbReactSDKOptions = {
            accessToken: 'token',
            components: {
                test: TestComponent,
            },
        };

        const result = createOptionDecorator(decorator)(options);

        const DecoratedComponent = result.components!.test as ComponentType<{blok?: Record<string, any>}>;

        render(<DecoratedComponent />);

        expect(screen.getByTestId('original')).toBeInTheDocument();
    });

    it('should render the original component when blok.croct is undefined', () => {
        const decorator: ApiDecorator = {
            fetchContent: jest.fn(),
        };

        const TestComponent: FunctionComponent = () => <div data-testid="original">Original</div>;

        const options: SbReactSDKOptions = {
            accessToken: 'token',
            components: {
                test: TestComponent,
            },
        };

        const result = createOptionDecorator(decorator)(options);

        const DecoratedComponent = result.components!.test as ComponentType<{blok: Record<string, any>}>;

        render(<DecoratedComponent blok={{other: 'value'}} />);

        expect(screen.getByTestId('original')).toBeInTheDocument();
    });

    it('should render the original component when blok.croct is an empty string', () => {
        const decorator: ApiDecorator = {
            fetchContent: jest.fn(),
        };

        const TestComponent: FunctionComponent = () => <div data-testid="original">Original</div>;

        const options: SbReactSDKOptions = {
            accessToken: 'token',
            components: {
                test: TestComponent,
            },
        };

        const result = createOptionDecorator(decorator)(options);

        const DecoratedComponent = result.components!.test as ComponentType<{blok: Record<string, any>}>;

        render(<DecoratedComponent blok={{croct: ''}} />);

        expect(screen.getByTestId('original')).toBeInTheDocument();
    });

    it('should render the original component when blok.croct is whitespace only', () => {
        const decorator: ApiDecorator = {
            fetchContent: jest.fn(),
        };
        const TestComponent: FunctionComponent = () => <div data-testid="original">Original</div>;

        const options: SbReactSDKOptions = {
            accessToken: 'token',
            components: {
                test: TestComponent,
            },
        };

        const result = createOptionDecorator(decorator)(options);
        const DecoratedComponent = result.components!.test as ComponentType<{blok: Record<string, any>}>;

        render(<DecoratedComponent blok={{croct: '   '}} />);

        expect(screen.getByTestId('original')).toBeInTheDocument();
    });

    it('should render the original component when blok.croct is not a string', () => {
        const decorator: ApiDecorator = {
            fetchContent: jest.fn(),
        };
        const TestComponent: FunctionComponent = () => <div data-testid="original">Original</div>;

        const options: SbReactSDKOptions = {
            accessToken: 'token',
            components: {
                test: TestComponent,
            },
        };

        const result = createOptionDecorator(decorator)(options);
        const DecoratedComponent = result.components!.test as ComponentType<{blok: Record<string, any>}>;

        render(<DecoratedComponent blok={{croct: 123}} />);

        expect(screen.getByTestId('original')).toBeInTheDocument();
    });

    it('should pass all props to the original component', () => {
        const decorator: ApiDecorator = {
            fetchContent: jest.fn(),
        };
        const TestComponent: FunctionComponent<{blok: Record<string, any>, extra: string}> = ({extra}) => (
            <div data-testid="original">{extra}</div>
        );

        const options: SbReactSDKOptions = {
            accessToken: 'token',
            components: {
                test: TestComponent,
            },
        };

        const result = createOptionDecorator(decorator)(options);
        const DecoratedComponent = result.components!.test as ComponentType<{
            blok: Record<string, any>,
            extra: string,
        }>;

        render(<DecoratedComponent blok={{}} extra="extra-value" />);

        expect(screen.getByTestId('original')).toHaveTextContent('extra-value');
    });
});
