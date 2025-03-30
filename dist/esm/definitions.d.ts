export interface AudioLoaderPlugin {
    /**
     * Loads a sound file from the app bundle's web assets.
     * @param options - Must include the filename.
     * @returns A promise resolving with the base64 encoded data of the file.
     * @rejects If the file cannot be found or read.
     */
    loadBundledSound(options: {
        filename: string;
    }): Promise<{
        base64Data: string;
    }>;
}
