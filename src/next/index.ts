import {fetchContent, type FetchOptions} from '@croct/plug-next/server';
import croct from '@croct/plug';
import {isSsr} from '@/ssr';
import {createOptionDecorator} from '@/react/decorator';

export const withCroct = createOptionDecorator({
    fetchContent: isSsr()
        ? (id, params) => fetchContent(id, {includeSchema: true, route: params?.route})
        : id => croct.fetch(id, {includeSchema: true}),
    resolveParams: params => {
        if (params === undefined) {
            return undefined;
        }

        const {route, ...rest} = params;

        return rest;
    },
});

declare module '@storyblok/js' {
    interface ISbStoriesParams {
        route?: FetchOptions['route'];
    }
}
