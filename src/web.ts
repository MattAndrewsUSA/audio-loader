import { WebPlugin } from '@capacitor/core';

import type { AudioLoaderPlugin } from './definitions';

export class AudioLoaderWeb extends WebPlugin implements AudioLoaderPlugin {
  async echo(options: { value: string }): Promise<{ value: string }> {
    console.log('ECHO', options);
    return options;
  }
}
