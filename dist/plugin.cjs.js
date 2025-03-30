'use strict';

var core = require('@capacitor/core');

const AudioLoader = core.registerPlugin('AudioLoader', {
    web: () => Promise.resolve().then(function () { return web; }).then((m) => new m.AudioLoaderWeb()),
});

class AudioLoaderWeb extends core.WebPlugin {
    async loadBundledSound(options) {
        console.warn('AudioLoader is primarily for native platforms.', options);
        throw this.unimplemented('loadBundledSound - Not implemented on web.');
    }
}

var web = /*#__PURE__*/Object.freeze({
    __proto__: null,
    AudioLoaderWeb: AudioLoaderWeb
});

exports.AudioLoader = AudioLoader;
//# sourceMappingURL=plugin.cjs.js.map
