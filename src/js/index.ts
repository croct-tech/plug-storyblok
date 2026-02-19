import {createOptionDecorator} from '@/utils/decorator';
import {fetchBrowserContent} from '@/utils/fetch';

export const withCroct = createOptionDecorator({
    fetchContent: fetchBrowserContent,
});
