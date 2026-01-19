import {SbPluginFactory, StoryblokClient} from '@storyblok/js';
import {ContentFetcher, resolveContent} from '@/content';

export function decoratePlugin(plugin: SbPluginFactory, fetcher: ContentFetcher): SbPluginFactory {
    return options => {
        const result = plugin(options) as {storyblokApi?: StoryblokClient};

        if (result.storyblokApi === undefined) {
            return result;
        }

        const {storyblokApi} = result;

        const get = storyblokApi.get.bind(storyblokApi);

        storyblokApi.get = async (path: string, ...args): Promise<any> => {
            if (path.startsWith('cdn/stories/')) {
                return resolveContent(await get(path, ...args) as any, fetcher);
            }

            return get(path, ...args);
        };

        const getAll = storyblokApi.getAll.bind(storyblokApi);

        storyblokApi.getAll = async (path: string, ...args): Promise<any> => {
            if (path.startsWith('cdn/stories/')) {
                return resolveContent(await getAll(path, ...args) as any, fetcher);
            }

            return getAll(path, ...args);
        };

        const getStory = storyblokApi.getStory.bind(storyblokApi);

        storyblokApi.getStory = async (slug: string, ...args): Promise<any> => resolveContent(await getStory(slug, ...args) as any, fetcher);

        const getStories = storyblokApi.getStories.bind(storyblokApi);

        storyblokApi.getStories = async (params?: any, ...args): Promise<any> => resolveContent(await getStories(params, ...args) as any, fetcher);

        return result;
    };
}
