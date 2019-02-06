import EventEmitter from 'events';
import {prompt} from 'inquirer';
import ApplifyPromptPlugin from './ApplifyPromptPlugin';


jest.mock('inquirer', ()=> ({
  prompt: jest.fn(async ()=> ({answer: 'test-answer'}))
}));


describe('ApplifyPromptPlugin - constructor', ()=> {
  it('constructs with empty questions and answers', ()=> {
    const prompter = new ApplifyPromptPlugin();

    expect(prompter.questions).toEqual([]);
    expect(prompter.answers).toEqual([]);
  });
});


describe('ApplifyPromptPlugin - pipe', ()=> {
  it('can set/get the pipe', async ()=> {
    const prompter = new ApplifyPromptPlugin();

    await prompter.init({});

    const newPipe = {};

    prompter.setPipe(newPipe);

    expect(prompter.getPipe()).toBe(newPipe);
  });
});


describe('ApplifyPromptPlugin - init', ()=> {
  it('creates a new prompt emmitter if not passed one in the pipe', async ()=> {
    const prompter = new ApplifyPromptPlugin();
    const config = {printer: 'test-printer'};

    await prompter.init(config);

    expect(prompter.getPipe().prompt).toBeInstanceOf(EventEmitter);
    expect(prompter.printer).toBe('test-printer');
  });

  it('uses pipe and prompt emitter if passed one', async ()=> {
    const prompter = new ApplifyPromptPlugin();
    const promptEmitter = new EventEmitter();
    const config = {};

    await prompter.init(config, {prompt: promptEmitter});

    expect(prompter.getPipe().prompt).toBe(promptEmitter);
  });
});


describe('ApplifyPromptPlugin - events', ()=> {
  it('adds a question with default format on question event', async ()=> {
    const prompter = new ApplifyPromptPlugin();
    const config = {};

    await prompter.init(config);
    prompter.getPipe().prompt.emit(
      'question', 'test-id', 'value', 'Is this a test:'
    );

    expect(prompter.questions).toEqual([{
      message: 'Is this a test:',
      name: 'test-id',
      type: 'input',
      choices: []
    }]);
    expect(prompter.questionMap.get('test-id')).toBe('value');
  });

  it('adds a question with option parameters', async ()=> {
    const prompter = new ApplifyPromptPlugin();

    await prompter.init({});
    prompter.getPipe().prompt.emit(
      'question',
      'test-id',
      'value',
      'Is this a test:',
      'confirm',
      true,
      [1, 2, 3]
    );

    expect(prompter.questions).toEqual([{
      message: 'Is this a test:',
      name: 'test-id',
      type: 'confirm',
      default: true,
      choices: [1, 2, 3]
    }]);
    expect(prompter.questionMap.get('test-id')).toBe('value');
  });

  it('prompts the user with pending questions on ask', async ()=> {
    const prompter = new ApplifyPromptPlugin();

    await prompter.init({});
    prompter.getPipe().prompt.emit(
      'question',
      'test-id',
      'value',
      'Is this a test:',
      'confirm',
      true,
      [1, 2, 3]
    );

    await prompter.getPipe().prompt.emit('ask');

    expect(prompt).toHaveBeenCalledWith([{
      message: 'Is this a test:',
      name: 'test-id',
      type: 'confirm',
      default: true,
      choices: [1, 2, 3]
    }]);
  });
});
