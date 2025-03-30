import { WebPlugin } from '@capacitor/core';
import type { AudioLoaderPlugin } from './definitions';
export declare class AudioLoaderWeb extends WebPlugin implements AudioLoaderPlugin {
    loadBundledSound(options: {
        filename: string;
    }): Promise<{
        base64Data: string;
    }>;
}
