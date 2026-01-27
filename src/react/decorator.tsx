import type {ComponentType, FunctionComponent} from 'react';
import type {SbSDKOptions} from '@storyblok/js';
import type {ApiDecorator} from '@/utils/decorator';
import {createOptionDecorator as createDefaultOptionDecorator} from '@/utils/decorator';
import {Slot} from '@/react/slot';
import {isSsr} from '@/utils/ssr';
import {isPreviewUrl} from '@/utils/preview';

type ComponentMap = {
    [key: string]: ComponentType<any>,
};

type BlockProps = {
    blok?: Record<string, any>,
};

/**
 * @internal
 */
export function createOptionDecorator(decorator: ApiDecorator): <O extends SbSDKOptions>(options: O) => O {
    const defaultDecorator = createDefaultOptionDecorator(decorator);

    return <O extends SbSDKOptions>(options: O): O => {
        const resolvedOptions = {...options};

        if ('components' in resolvedOptions && isComponentMap(resolvedOptions.components)) {
            resolvedOptions.components = decorateComponentMap(resolvedOptions.components);
        }

        return defaultDecorator(resolvedOptions);
    };
}

function decorateComponentMap(components: ComponentMap): ComponentMap {
    return Object.fromEntries(
        Object.entries(components).flatMap<[string, ComponentType]>(([key, Component]) => {
            const originalKey = `${key}_original`;

            const DecoratedComponent: FunctionComponent<BlockProps> = props => {
                const slot = getSlot(props);

                if (slot !== null && (isSsr() || !isPreviewUrl(window.location.href))) {
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

function getSlot({blok}: BlockProps): string | null {
    if (typeof blok?.croct !== 'string' || blok.croct.trim() === '') {
        return null;
    }

    return blok.croct;
}

function isComponentMap(value: any): value is ComponentMap {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
