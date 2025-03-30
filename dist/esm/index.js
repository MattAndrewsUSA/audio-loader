import { registerPlugin } from '@capacitor/core';
const AudioLoader = registerPlugin('AudioLoader', {
    web: () => import('./web').then((m) => new m.AudioLoaderWeb()),
});
export * from './definitions';
export { AudioLoader };
//# sourceMappingURL=index.js.map