import croct from '@croct/plug';
import {createOptionDecorator} from '@/decorator';

export const withCroct = createOptionDecorator({
    fetchContent: id => croct.fetch(id, {includeSchema: true}),
});
