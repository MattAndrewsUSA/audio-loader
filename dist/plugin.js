var capacitorAudioLoader = (function (exports, core) {
    'use strict';

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

    return exports;

})({}, capacitorExports);
//# sourceMappingURL=plugin.js.map
