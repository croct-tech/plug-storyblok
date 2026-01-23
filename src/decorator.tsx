import type {SbPluginFactory, StoryblokClient, SbSDKOptions} from '@storyblok/js';
import type {FetchResponse} from '@croct/plug';
import type {DynamicSlotId} from '@croct/plug/slot';
import type {ISbStoriesParams} from '@storyblok/react';
import {resolveContent} from '@/content';

export type ApiDecorator = {
    resolveParams?: (params: ISbStoriesParams | undefined) => ISbStoriesParams | undefined,
    fetchContent: (id: string, params?: ISbStoriesParams) => Promise<FetchResponse<DynamicSlotId>>,
};

export function createOptionDecorator(decorator: ApiDecorator): <O extends SbSDKOptions>(options: O) => O {
    return <O extends SbSDKOptions>(options: O): O => {
        const result = {...options};

        if (result.use !== undefined) {
            result.use = result.use.map(plugin => decoratePlugin(plugin, decorator));
        }

        return result;
    };
}

export function decoratePlugin(plugin: SbPluginFactory, decorator: ApiDecorator): SbPluginFactory {
    return options => {
        const result = plugin(options) as {storyblokApi?: StoryblokClient};

        if (result.storyblokApi === undefined) {
            return result;
        }

        const {storyblokApi} = result;

        const get = storyblokApi.get.bind(storyblokApi);

        storyblokApi.get = async (path: string, params, ...args): Promise<any> => {
            const resolvedParams = decorator.resolveParams?.(params) ?? params;

            if (path.startsWith('cdn/stories/')) {
                return resolveContent(
                    await get(path, resolvedParams, ...args) as any,
                    id => decorator.fetchContent(id, params),
                );
            }

            return get(path, resolvedParams, ...args);
        };

        const getAll = storyblokApi.getAll.bind(storyblokApi);

        storyblokApi.getAll = async (path: string, params, ...args): Promise<any> => {
            const resolvedParams = decorator.resolveParams?.(params) ?? params;

            if (path.startsWith('cdn/stories/')) {
                return resolveContent(
                    await getAll(path, resolvedParams, ...args) as any,
                    id => decorator.fetchContent(id, params),
                );
            }

            return getAll(path, resolvedParams, ...args);
        };

        const getStory = storyblokApi.getStory.bind(storyblokApi);

        storyblokApi.getStory = async (slug: string, params, ...args): Promise<any> => (
            resolveContent(
                await getStory(slug, decorator.resolveParams?.(params) ?? params, ...args) as any,
                id => decorator.fetchContent(id, params),
            )
        );

        const getStories = storyblokApi.getStories.bind(storyblokApi);

        storyblokApi.getStories = async (params, ...args): Promise<any> => (
            resolveContent(
                await getStories(decorator.resolveParams?.(params) ?? params, ...args) as any,
                id => decorator.fetchContent(id, params),
            )
        );

        return result;
    };
}
