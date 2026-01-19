'use client';

import {FunctionComponent} from 'react';
import {useContent} from '@croct/plug-react';
import {JsonObject} from '@croct/json';
import {StoryblokComponent} from '@storyblok/react';
import {createStoryblokContent} from '@/content';

type SlotProps = {
    id: string,
    component: string,
    props?: Record<string, any>,
};

export const Slot: FunctionComponent<SlotProps> = ({id, component, props}) => {
    const content = useContent(id, {
        initial: props?.blok ?? null,
        fallback: props?.blok ?? null,
    });

    return (
        <StoryblokComponent
            {...props}
            blok={{
                ...props?.blok,
                ...(createStoryblokContent(content) as JsonObject),
                component: component,
            }}
        />
    );
};
