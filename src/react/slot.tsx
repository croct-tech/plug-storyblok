'use client';

import type {FunctionComponent} from 'react';
import {useContent} from '@croct/plug-react';
import {StoryblokComponent} from '@storyblok/react';
import {createStoryblokContent} from '@/utils/content';

type SlotProps = {
    id: string,
    component: string,
    props?: Record<string, any>,
};

/**
 * @internal
 */
export const Slot: FunctionComponent<SlotProps> = ({id, component, props}) => {
    const {content, metadata} = useContent(id, {
        includeSchema: true,
        initial: props?.blok ?? null,
        fallback: props?.blok ?? null,
    });

    return (
        <StoryblokComponent
            {...props}
            blok={{
                ...props?.blok,
                ...createStoryblokContent(content, metadata?.schema),
                component: component,
            }}
        />
    );
};
