import packageJson from '../../package.json';
import { UI_VERSION } from './version';

describe('UI_VERSION', () => {
  it('acompanha a versão do package.json da biblioteca', () => {
    expect(UI_VERSION).toBe(packageJson.version);
  });
});
