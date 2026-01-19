import {ComponentType, FunctionComponent} from 'react';
import {SbSDKOptions} from '@storyblok/js';
import {ContentFetcher} from '@/content';
import {decoratePlugin} from '@/bridge/decorator';
import {Slot} from '@/bridge/react/slot';

type ComponentMap = {
    [key: string]: ComponentType<any>,
};

type BlockProps = {
    blok?: Record<string, any>,
};

export function createOptionDecorator(fetcher: ContentFetcher): <O extends SbSDKOptions>(options: O) => O {
    return <O extends SbSDKOptions>(options: O): O => {
        const result = {...options};

        if ('components' in result && isComponentMap(result.components)) {
            result.components = decorateComponentMap(result.components);
        }

        if (result.use !== undefined) {
            result.use = result.use.map(plugin => decoratePlugin(plugin, fetcher));
        }

        return result;
    };
}

function decorateComponentMap(components: ComponentMap): ComponentMap {
    return Object.fromEntries(
        Object.entries(components).flatMap<[string, ComponentType]>(([key, Component]) => {
            const originalKey = `${key}_original`;

            const DecoratedComponent: FunctionComponent<BlockProps> = props => {
                const slot = getSlot(props);

                if (slot !== null) {
                    return (<Slot id={slot} component={originalKey} props={props} />);
                }

                return <Component {...props} />;
            };

            DecoratedComponent.displayName = `Croct<${Component.displayName ?? Component.name}>`;

            return [
                [key, DecoratedComponent],
                [originalKey, Component],
            ];
        }),
    );
}

function getSlot(props: BlockProps): string | null {
    if (
        props.blok === undefined
        || props.blok === null
        || typeof props.blok.croct !== 'string'
        || props.blok
            .croct
            .trim() === ''
    ) {
        return null;
    }

    return props.blok.croct;
}

function isComponentMap(value: any): value is ComponentMap {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
