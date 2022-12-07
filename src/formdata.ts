import { PassThrough, Readable } from 'stream';
import { streamMultipart } from '@web3-storage/multipart-parser';
import { UploadHandlerPart } from '@remix-run/server-runtime/dist/formData';
import { Request, writeAsyncIterableToWritable } from '@remix-run/node';
import { FileStream } from './file-stream';

export type InputStream = UploadHandlerPart & {
  stream?: Readable;
  text?: string;
};
export type InputData = InputStream | null | undefined;
export type Input = Readable | string | null | undefined;
export declare type UploadHandler = (
  part: UploadHandlerPart
) => Promise<InputData>;

export const uploadHandler: UploadHandler = async (
  part: UploadHandlerPart
): Promise<InputData> => {
  if (!part?.data) {
    return undefined;
  }

  if (part.filename) {
    const stream = new FileStream(part.filename, part.contentType);
    await writeAsyncIterableToWritable(part.data, stream);
    return { ...part, stream };
  }

  const stream = new PassThrough();
  await writeAsyncIterableToWritable(part.data, stream);
  const input = stream.read();

  return { ...part, text: input ? new TextDecoder().decode(input) : input };
};

/**
 * Allows you to handle multipart forms (file uploads) for your app.
 *
 * @see https://remix.run/api/remix#parsemultipartformdata-node
 */
export async function multipartFormDataHandler(
  request: Request,
  uploadHandler: UploadHandler,
  keepNull: boolean = false
): Promise<Map<string, InputData>> {
  let contentType = request.headers.get('Content-Type') || '';
  let [type, boundary] = contentType.split(/\s*;\s*boundary=/);

  if (!request.body || !boundary || type !== 'multipart/form-data') {
    throw new TypeError('Could not parse content as FormData.');
  }

  let formMap = new Map<string, any>();
  let parts: AsyncIterable<UploadHandlerPart & {
    done?: true;
  }> = streamMultipart(request.body, boundary);

  for await (let part of parts) {
    if (part.done) break;

    if (typeof part.filename === 'string') {
      // only pass basename as the multipart/form-data spec recommends
      // https://datatracker.ietf.org/doc/html/rfc7578#section-4.2
      part.filename = part.filename.split(/[/\\]/).pop();
    }

    const value = await uploadHandler(part);
    if (keepNull || (typeof value !== 'undefined' && value !== null)) {
      formMap.set(part.name, value || null);
    }
  }

  return formMap;
}

export async function parseMultipartFormDataStream(
  request: Request,
  keepNull: boolean = false
): Promise<Map<string, InputData>> {
  return multipartFormDataHandler(request, uploadHandler, keepNull);
}

export async function generateFormStream(
  request: Request,
  keepNull: boolean = false
): Promise<Record<string, Input>> {
  const formData = await parseMultipartFormDataStream(request, keepNull);

  return Object.entries(Object.fromEntries(formData)).reduce<any>(
    (prev, [key, value]) => {
      prev[key] = value?.stream || value?.text || null;

      return prev;
    },
    {}
  );
}
