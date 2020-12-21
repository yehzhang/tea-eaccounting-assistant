import recognizeDigit from './recognizeDigit';
import getTestImage from './testData/getTestImage';

describe('recognizeDigit', () => {
  it('recognizes 3', async () => {
    const actual = await run('3_1.png');
    expect(actual).toBe('3');
  });

  it('recognizes 3 spec 2', async () => {
    const actual = await run('3_2.png');
    expect(actual).toBe('3');
  });

  it('recognizes lowres 3', async () => {
    const actual = await run('3_lowres.png');
    expect(actual).toBe('3');
  });

  it('recognizes 2', async () => {
    const actual = await run('2.png');
    expect(actual).toBe('2');
  });

  it('recognizes lowres 2', async () => {
    const actual = await run('2_lowres.png');
    expect(actual).toBe('2');
  });

  it('recognizes lowres 1', async () => {
    const actual = await run('1_lowres_1.png');
    expect(actual).toBe('1');
  });

  it('recognizes lowres 1 spec 2', async () => {
    const actual = await run('1_lowres_2.png');
    expect(actual).toBe('1');
  });

  it('recognizes lowres 1 spec 3', async () => {
    const actual = await run('1_lowres_3.png');
    expect(actual).toBe('1');
  });

  it('recognizes lowres 4', async () => {
    const actual = await run('4_lowres.png');
    expect(actual).toBe('4');
  });
});

async function run(imageFilename: string): Promise<string> {
  const image = await getTestImage(`digit/${imageFilename}`);
  return recognizeDigit(image);
}
