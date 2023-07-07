import ServerTimingElement, { IServerElement } from './ServerTimingElement.js';

export default class ServerTiming implements IServerElement {
  map: Map<string, ServerTimingElement[]>;

  constructor() {
    this.map = new Map();
  }

  start(chanel: string) {
    return new ServerTimingElement(this, chanel);
  }

  async startFunc<T>(chanel: string, fc: () => Promise<T>): Promise<T> {
    const el = new ServerTimingElement(this, chanel);
    const content = await fc();
    el.stop();
    return content;
  }

  completeElement(e: ServerTimingElement) {
    const cur = this.map.get(e.chanel) ?? [];
    cur.push(e);
    this.map.set(e.chanel, cur);
  }
}
