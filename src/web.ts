import { WebPlugin } from '@capacitor/core';
import type { AudioLoaderPlugin } from './definitions';

export class AudioLoaderWeb extends WebPlugin implements AudioLoaderPlugin {
  async loadBundledSound(options: { filename: string }): Promise<{ base64Data: string }> {
    console.warn('AudioLoader is primarily for native platforms.', options);
    throw this.unimplemented('loadBundledSound - Not implemented on web.');
  }
}
