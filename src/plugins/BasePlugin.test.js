import BasePlugin from './BasePlugin';


/* eslint no-underscore-dangle: 0 */


describe('BasePlugin - constructor', ()=> {
  it('has no runnable functions', ()=> {
    const base = new BasePlugin();

    expect(base.getRunnables()).toEqual(new Map());
  });

  it('constructs with debug false by default', ()=> {
    const base = new BasePlugin();

    expect(base._debug).toBe(false);
  });

  it('constructs with debug option if passed one', ()=> {
    const base = new BasePlugin(true);

    expect(base._debug).toBe(true);
  });

  it('constructs with debug true if global log true but debug opt false', ()=> {
    global.log = true;
    const base = new BasePlugin(false);

    expect(base._debug).toBe(true);
  });

  it('gets the plugin pipe', ()=> {
    const base = new BasePlugin();

    expect(base.getPipe()).toBe(null);
  });
});
