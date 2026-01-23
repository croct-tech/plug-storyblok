import croct from '@croct/plug';
import {createOptionDecorator} from '@/react/decorator';

export const withCroct = createOptionDecorator({
    fetchContent: id => croct.fetch(id, {includeSchema: true}),
});
