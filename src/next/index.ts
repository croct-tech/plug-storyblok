import {fetchContent, type FetchOptions} from '@croct/plug-next/server';
import croct from '@croct/plug';
import {getRequestUri} from '@croct/plug-next/config/context';
import {isSsr} from '@/utils/ssr';
import {createOptionDecorator} from '@/react/decorator';
import {isPreviewUrl} from '@/utils/preview';

export const withCroct = createOptionDecorator({
    fetchContent: isSsr()
        ? async (id, params) => {
            const uri = await getRequestUri(params?.route).catch(() => null);

            if (uri !== null && isPreviewUrl(uri)) {
                // Do not overwrite content in preview mode
                return undefined;
            }

            return fetchContent(id, {
                includeSchema: true,
                route: params?.route,
            });
        }
        : id => {
            if (isPreviewUrl(window.location.href)) {
                // Do not overwrite content in preview mode
                return Promise.resolve(undefined);
            }

            return croct.fetch(id, {includeSchema: true});
        },
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
