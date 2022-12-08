import {
  Request as NodeRequest,
  FormData as NodeFormData,
} from '@remix-run/web-fetch';
import { Blob, File } from '@remix-run/web-file';
import { FileStream, generateFormStream } from '../src';

type ExpectedType = {
  name: string;
  file_blob: FileStream;
  file_file: FileStream;
};

describe('Form Data', () => {
  it('works', async () => {
    let formData = new NodeFormData();
    formData.set('name', 'Bilu');
    formData.set('file_blob', new Blob(['blob'.repeat(1000)]), 'blob.txt');
    formData.set('file_file', new File(['file'.repeat(1000)], 'file.txt'));

    let req = new NodeRequest('https://test.com', {
      method: 'post',
      body: formData,
    });

    const gen = await generateFormStream<ExpectedType>(req);

    expect(gen.name).toBe('Bilu');

    expect(gen.file_blob.appendOptions).toEqual({
      filename: 'blob.txt',
      contentType: 'application/octet-stream',
    });

    expect(gen.file_file.appendOptions).toEqual({
      filename: 'file.txt',
      contentType: 'application/octet-stream',
    });

    const [blobContent, fileContent] = await Promise.all([
      gen.file_blob.read(),
      gen.file_file.read(),
    ]);

    expect(blobContent.toString()).toEqual('blob'.repeat(1000));
    expect(fileContent.toString()).toEqual('file'.repeat(1000));
  });
});
