export interface AudioLoaderPlugin {
    echo(options: {
        value: string;
    }): Promise<{
        value: string;
    }>;
}
