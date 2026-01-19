import {SbSDKOptions} from '@storyblok/js';
import croct from '@croct/plug';
import {decoratePlugin} from '@/bridge/decorator';

export function withCroct<O extends SbSDKOptions>(options: O): O {
    const result = {...options};

    if (result.use !== undefined) {
        result.use = result.use.map(plugin => decoratePlugin(plugin, id => croct.fetch(id)));
    }

    return result;
}
