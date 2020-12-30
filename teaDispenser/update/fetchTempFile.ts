import axios from 'axios';
import { createWriteStream } from 'fs';
import { basename } from 'path';
import getTempPath from './getTempPath';

async function fetchTempFile(url: string): Promise<string> {
  const response = await axios({
    url,
    responseType: 'stream',
  });

  const filename = basename(url);
  const filePath = await getTempPath(filename);
  await new Promise(
    (resolve, reject) =>
      void response.data.pipe(createWriteStream(filePath)).on('finish', resolve).on('error', reject)
  );

  return filePath;
}

export default fetchTempFile;
