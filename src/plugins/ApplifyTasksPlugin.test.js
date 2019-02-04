import EventEmitter from 'events';
import Listr from 'listr';
import ApplifyTasksPlugin from './ApplifyTasksPlugin';


const mockRun = jest.fn();
const mockAdd = jest.fn();
jest.mock('listr', ()=> jest.fn().mockImplementation(()=> ({
  run: mockRun,
  add: mockAdd
})));


describe('ApplifyTasksPlugin - constructor', ()=> {
  it('has no runnable functions', ()=> {
    const tasker = new ApplifyTasksPlugin();

    // eslint-disable-next-line no-underscore-dangle
    expect(tasker._runnable).toEqual({});
  });

  it('constructs with success and fail in context', ()=> {
    const tasker = new ApplifyTasksPlugin();

    expect(tasker.context).toEqual({
      success: [],
      fail: [],
      warning: []
    });
  });

  it('constructs with list style by default and creates new Listr', ()=> {
    const tasker = new ApplifyTasksPlugin();

    expect(tasker.style).toBe('list');
    expect(Listr).toHaveBeenCalledTimes(1);
  });

  it('constructs with debug false by default', ()=> {
    const tasker = new ApplifyTasksPlugin();

    expect(tasker.debug).toBe(false);
  });

  it('constructs with debug true if global log is true', ()=> {
    global.log = true;
    const tasker = new ApplifyTasksPlugin();

    expect(tasker.debug).toBe(true);
  });

  it('constructs with options', ()=> {
    const tasker = new ApplifyTasksPlugin({debug: true, style: 'progress'});

    expect(tasker.debug).toBe(true);
    expect(tasker.style).toBe('progress');
  });

  it('constructs with debug true if global log true but debug opt false', ()=> {
    global.log = true;
    const tasker = new ApplifyTasksPlugin({debug: false});

    expect(tasker.debug).toBe(true);
  });

  it('constructs with debug false debug undefined in opts', ()=> {
    global.log = undefined;
    const tasker = new ApplifyTasksPlugin({});

    expect(tasker.debug).toBe(false);
  });
});

describe('ApplifyTasksPlugin - pipe', ()=> {
  it('can set/get the pipe', async ()=> {
    const tasker = new ApplifyTasksPlugin();

    await tasker.init({});

    const newPipe = {};

    tasker.setPipe(newPipe);

    expect(tasker.getPipe()).toBe(newPipe);
  });
});

describe('ApplifyTasksPlugin - init', ()=> {
  it('creates a new task emmitter if not passed one in the pipe', async ()=> {
    const tasker = new ApplifyTasksPlugin();
    const config = {printer: 'test-printer'};

    await tasker.init(config);

    expect(tasker.getPipe().tasks).toBeInstanceOf(EventEmitter);
    expect(tasker.printer).toBe('test-printer');
  });

  it('uses task emitter from pipe if one is passed', async ()=> {
    const tasker = new ApplifyTasksPlugin();
    const config = {};
    const taskEmitter = new EventEmitter();
    const pipe = {tasks: taskEmitter};

    await tasker.init(config, pipe);

    expect(tasker.getPipe().tasks).toBe(taskEmitter);
  });
});
