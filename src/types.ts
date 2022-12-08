import { Readable } from 'stream';
import { UploadHandlerPart } from '@remix-run/server-runtime/dist/formData';
import { FileStream } from './file-stream';

export type InputStream = UploadHandlerPart & {
  stream?: Readable;
  text?: string;
};

export type InputData = InputStream | null | undefined;

export type Input = FileStream | string | null | undefined;

export declare type UploadHandler = (
  part: UploadHandlerPart
) => Promise<InputData>;
