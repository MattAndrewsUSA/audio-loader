import { WebPlugin } from '@capacitor/core';
import type { AudioLoaderPlugin } from './definitions';
export declare class AudioLoaderWeb extends WebPlugin implements AudioLoaderPlugin {
    echo(options: {
        value: string;
    }): Promise<{
        value: string;
    }>;
}
