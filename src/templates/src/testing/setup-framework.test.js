import React from 'react';
import {matchers} from './setup-framework';


describe('matchers', ()=> {
  it('fails toShallowEqual', ()=> {
    expect(()=> {
      expect(<div />).toShallowEqual(<span />);
    }).toThrow();
  });

  it('fails toMatchElem', ()=> {
    expect(()=> {
      expect(<div />).toMatchElem(<div foo='spam' />);
    }).toThrow();
  });

  it('fails toContainMatching', ()=> {
    const result = matchers.toContainMatching(<div />, <span />);

    expect(result).toEqual(
      {pass: false, message: expect.any(Function)}
    );

    expect(result.message()).toBe(
      'Expected:\n<div />\n\nto contain matching:\n\n<span />.'
    );
  });

  it('fails toContainMatching', ()=> {
    // eslint-disable-next-line react/jsx-key
    const result = matchers.toContainAllMatching(<div />, [<li />, <a />]);

    expect(result).toEqual(
      {pass: false, message: expect.any(Function)}
    );

    expect(result.message()).toBe(
      'Expected:\n<div />\n\nto contain all matching:\n\n<li />,\n<a />.'
    );
  });


  it('waits for asyncToHaveBeenCalledWith', async ()=> {
    const fn = jest.fn();

    (async ()=> await '' || fn('foo'))();

    await expect(fn).asyncToHaveBeenCalledWith('foo');
  });

  it('fails asyncToHaveBeenCalledWith because never called', async ()=> {
    const fn = jest.fn();

    await expect(
      expect(fn).asyncToHaveBeenCalledWith('foo')
    ).rejects.toThrow();
  });

  it('fails not.asyncToHaveBeenCalledWith because it was called', async ()=> {
    const fn = jest.fn();

    (async ()=> await '' || fn('foo'))();

    await expect(
      expect(fn).not.asyncToHaveBeenCalledWith('foo')
    ).rejects.toThrow();
  });
});
