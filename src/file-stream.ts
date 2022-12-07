import { PassThrough } from 'stream';

export class FileStream extends PassThrough {
  get appendOptions() {
    return {
      filename: this.filename,
      contentType: this.contentType,
    };
  }

  constructor(
    private readonly filename: string,
    private readonly contentType: string
  ) {
    super();
  }
}
