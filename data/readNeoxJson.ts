import { readdirSync, readFileSync } from "fs";
import { join } from "path";

function readNeoxJson(dataDirectory: string): { [key: string]: any } {
  const filenames = readdirSync(dataDirectory);
  return filenames.filter(filename => filename.match(/\d+\.json/))
      .map(filename => {
        const data = readFileSync(join(dataDirectory, filename), 'utf8');
        return JSON.parse(data);
      })
      .reduce((acc, data) => Object.assign(acc, data), {});
}

export default readNeoxJson;
