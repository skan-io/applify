import EventEmitter from 'events';


class PipeEmitter extends EventEmitter {
  // eslint-disable-next-line
  constructor(debug) {
    super();

    this.pipe = null;

    this.debug = debug ? debug : false;

    if (global.log) {
      this.debug = true;
    }
  }

  getPipe() {
    return this.pipe;
  }

  setPipe(pipe) {
    this.pipe = pipe;
  }
}
