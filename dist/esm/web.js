import { WebPlugin } from '@capacitor/core';
export class AudioLoaderWeb extends WebPlugin {
    async loadBundledSound(options) {
        console.warn('AudioLoader is primarily for native platforms.', options);
        throw this.unimplemented('loadBundledSound - Not implemented on web.');
    }
}
//# sourceMappingURL=web.js.map