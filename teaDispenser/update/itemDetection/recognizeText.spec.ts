import { Scheduler } from 'tesseract.js';
import recognizeText from './recognizeText';
import setupTesseract from './setupTesseract';
import getTestImage from './testData/getTestImage';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 120000;

describe('recognizeText', () => {
  let chineseRecognizer: Scheduler;
  let englishRecognizer: Scheduler;

  beforeAll(async () => {
    ({
      chineseRecognizer,
      englishRecognizer,
    } = await setupTesseract());
  });

  async function run(imageFilename: string): Promise<string> {
    let recognizer: Scheduler;
    if (imageFilename.startsWith('chn_')) {
      recognizer = chineseRecognizer;
    } else if (imageFilename.startsWith('eng_')) {
      recognizer = englishRecognizer;
    } else {
      throw new TypeError(`Expected filename '${imageFilename}' to annotate language`);
    }

    const image = await getTestImage(`name/${imageFilename}`);
    return recognizeText(recognizer, image);
  }

  it('recognizes chn_drone_1', async () => {
    const actual = await run('chn_drone_1.png');
    expect(actual).toBe('联邦海军 无f几导航….');
  });

  it('recognizes chn_remote_small_1', async () => {
    const actual = await run('chn_remote_small_1.png');
    expect(actual).toBe('随从 大型远程电容传…');
  });

  it('recognizes chn_laser_1', async () => {
    const actual = await run('chn_laser_1.png');
    expect(actual).toBe('激光炮发散调节装置.');
  });


  it('recognizes chn_debris_1', async () => {
    const actual = await run('chn_debris_1.png');
    expect(actual).toBe('艾玛7级受损结构');
  });


  it('recognizes chn_debris_2', async () => {
    const actual = await run('chn_debris_2.png');
    expect(actual).toBe('艾玛7级受损结构');
  });


  it('recognizes chn_debris_3', async () => {
    const actual = await run('chn_debris_3.png');
    expect(actual).toBe('艾玛4级受损结构');
  });


  it('recognizes chn_drone_2', async () => {
    const actual = await run('chn_drone_2.png');
    expect(actual).toBe('无人机射速加强装置..·');
  });
});
