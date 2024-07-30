import { XRequest } from '../lib/express.js';

export enum BrowserENUM {
  Edge = 'edg',
  Opera = 'opr',
  Chrome = 'chrome',
  Firefox = 'firefox',
  Safari = 'safari',
  Mozilla = 'mozilla',
  Gecko = 'gecko',
  OculusBrowser = 'oculusbrowser',
}

/**
 * UserAgent
 */
export class BaseUserAgent {
  private readonly raw: string;

  private readonly version: Map<string, number>;

  constructor(req: XRequest) {
    this.raw = req.headers['user-agent'] || '';
    this.version = new Map<string, number>();
    const parts = this.raw.matchAll(/[A-Za-z]*\/[0-9.]*/gm);
    for (const part of parts) {
      const [name, version] = part[0].split('/');
      const [release] = version.split('.');
      this.version.set(name.toLowerCase(), parseInt(release, 10));
    }
  }

  getBrowser() {
    if (this.version.has(BrowserENUM.Opera)) {
      return 'Opera';
    }
    if (this.version.has(BrowserENUM.Edge)) {
      return 'Edge';
    }
    if (this.version.has(BrowserENUM.Firefox)) {
      return 'Firefox';
    }
    if (this.version.has(BrowserENUM.OculusBrowser)) {
      return 'OculusBrowser';
    }
    if (this.version.has(BrowserENUM.Chrome)) {
      return 'Chrome';
    }
    if (this.version.has(BrowserENUM.Safari)) {
      return 'Safari';
    }
    if (this.version.has(BrowserENUM.Mozilla)) {
      return 'Mozilla';
    }
    if (this.version.has(BrowserENUM.Gecko)) {
      return 'Gecko';
    }

    return 'Unknown';
  }

  getChromeVersion(): number {
    return this.version.get(BrowserENUM.Chrome) || 0;
  }

  getEdgeVersion(): number {
    return this.version.get(BrowserENUM.Edge) || 0;
  }

  getFirefoxVersion(): number {
    return this.version.get(BrowserENUM.Firefox) || 0;
  }

  getGeckoVersion(): number {
    return this.version.get(BrowserENUM.Gecko) || 0;
  }

  getMozillaVersion(): number {
    return this.version.get(BrowserENUM.Mozilla) || 0;
  }

  getOculusVersion(): number {
    return this.version.get(BrowserENUM.OculusBrowser) || 0;
  }

  getOperaVersion(): number {
    return this.version.get(BrowserENUM.Opera) || 0;
  }

  getSafariVersion(): number {
    return this.version.get(BrowserENUM.Safari) || 0;
  }

  getXVersion(x: string) {
    return this.version.get(x) || 0;
  }

  getRaw(): string {
    return this.raw;
  }
}
