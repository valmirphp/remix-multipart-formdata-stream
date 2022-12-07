import {PassThrough} from "stream";
import {AppendOptions} from "form-data";

export class FileStream extends PassThrough {
    get appendOptions(): AppendOptions {
        return {
            filename: this.filename,
            contentType: this.contentType,
        };
    }

    constructor(private readonly filename: string, private readonly contentType: string) {
        super();
    }
}
