import { registerPlugin } from '@capacitor/core';

import type { AudioLoaderPlugin } from './definitions';

const AudioLoader = registerPlugin<AudioLoaderPlugin>('AudioLoader', {
  web: () => import('./web').then((m) => new m.AudioLoaderWeb()),
});

export * from './definitions';
export { AudioLoader };
