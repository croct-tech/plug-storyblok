import type {FetchResponse} from '@croct/plug';
import type {DynamicSlotId} from '@croct/plug/slot';
import croct from '@croct/plug';
import {isPreviewUrl} from '@/utils/preview';

/**
 * @internal
 */
export async function fetchBrowserContent(id: string): Promise<FetchResponse<DynamicSlotId> | undefined> {
    if (isPreviewUrl(window.location.href)) {
        return undefined;
    }

    const response = await croct.fetch(id, {includeSchema: true});

    if (response.metadata?.contentSource === 'slot') {
        return undefined;
    }

    return response;
}
