# remix-multipart-formdata-stream

Cria um parse de dados de formulário multipart para streams.

## Installation

```bash
npm install remix-multipart-formdata-stream
```

or

```bash
yarn add remix-multipart-formdata-stream
```

## Usage

```ts
import {generateFormStream, FileStream} from "remix-multipart-formdata-stream";

type ExpectedType = {
    username: string;
    file: FileStream;
};

export const action: ActionFunction = async ({request}) => {

    // Quando TRUE ira retornar os input NULOS no objeto data (parametro opcional)
    const keepNull = false;

    const data = await generateFormStream<ExpectedType>(request, keepNull);
    console.log(data);
    console.log(data.file.appendOptions);

    return null;
};
```

