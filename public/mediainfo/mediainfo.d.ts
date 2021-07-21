import type {
	FormatType,
	GetSizeFunc,
	MediaInfo as MediaInfoInterface,
	MediaInfoOptions,
	MediaInfoWasmInterface,
	ReadChunkFunc,
	Result,
} from './types';
/**
 * Wrapper around MediaInfoLib WASM module.
 */
declare class MediaInfo implements MediaInfoInterface {
	private readonly wasmInstance;
	readonly options: MediaInfoOptions;
	/**
     * Create an instance of MediaInfo. The constructor should not be called directly.
     * Instead use {@link MediaInfoFactory} to receive {@link MediaInfo} instance.
     *
     * @param wasmInstance WASM module instance to be used
     * @param options User options
     */
	constructor(wasmInstance: MediaInfoWasmInterface, options: MediaInfoOptions);
	analyzeData(
		getSize: GetSizeFunc,
		readChunk: ReadChunkFunc,
		callback?: (result: Result, err?: Error) => void,
	): Promise<Result> | void;
	close(): void;
	inform(): string;
	openBufferContinue(data: Uint8Array, size: number): boolean;
	openBufferContinueGotoGet(): number;
	openBufferFinalize(): void;
	openBufferInit(size: number, offset: number): void;
}
declare function MediaInfoFactory(options?: MediaInfoOptions): Promise<MediaInfoInterface>;
declare function MediaInfoFactory(options: MediaInfoOptions, callback: (mediainfo: MediaInfoInterface) => void): void;
declare function MediaInfoFactory(
	options: MediaInfoOptions,
	callback: (mediainfo: MediaInfoInterface) => void,
	errCallback: (error: Error) => void,
): void;
export type { FormatType, GetSizeFunc, MediaInfo, MediaInfoOptions, MediaInfoWasmInterface, ReadChunkFunc, Result };
export default MediaInfoFactory;
