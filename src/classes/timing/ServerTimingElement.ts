export type IServerElement = {
  completeElement: (e: ServerTimingElement) => void;
};

export default class ServerTimingElement {
  private el: IServerElement;

  readonly chanel: string;

  private readonly start: number;

  private end: number;

  constructor(el: IServerElement, chanel: string) {
    this.el = el;
    this.chanel = chanel;
    this.start = new Date().getTime();
    this.end = -1;
  }

  stop() {
    if (this.end === -1) {
      this.end = new Date().getTime();
      this.el.completeElement(this);
    }
  }

  getDuration() {
    if (this.end === -1) {
      return 0;
    }
    return this.end - this.start;
  }
}
