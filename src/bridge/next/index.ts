import {fetchContent} from '@croct/plug-next/server';
import croct from '@croct/plug';
import {createOptionDecorator} from '@/bridge/react/decorator';
import {isSsr} from '@/ssr';

export const withCroct = createOptionDecorator(id => (isSsr() ? fetchContent(id) : croct.fetch(id)));
