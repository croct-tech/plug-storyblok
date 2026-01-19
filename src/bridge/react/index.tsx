import croct from '@croct/plug';
import {createOptionDecorator} from '@/bridge/react/decorator';

export const withCroct = createOptionDecorator(id => croct.fetch(id));
