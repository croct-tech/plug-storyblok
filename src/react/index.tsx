import {createOptionDecorator} from '@/react/decorator';
import {fetchBrowserContent} from '@/utils/fetch';

export const withCroct = createOptionDecorator({
    fetchContent: fetchBrowserContent,
});
