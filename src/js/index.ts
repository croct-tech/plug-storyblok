import croct from '@croct/plug';
import {createOptionDecorator} from '@/utils/decorator';
import {isPreviewUrl} from '@/utils/preview';

export const withCroct = createOptionDecorator({
    fetchContent: id => {
        if (isPreviewUrl(window.location.href)) {
            return Promise.resolve(undefined);
        }

        return croct.fetch(id, {includeSchema: true});
    },
});
