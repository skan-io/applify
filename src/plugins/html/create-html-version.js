

export const createHtmlVersionTask = ()=> `import React from 'react';

/* eslint react/prop-types: off */

const VersionMeta = ({version})=> (
  <meta name="x-app-version" content={version} />
);

export default VersionMeta;
`;

export const createHtmlVersionTestTask = ()=> `import React from 'react';
import VersionMeta from './version';


describe('<VersionMeta /> regression', ()=> {
  it('renders tags', ()=> {
    expect(
      <VersionMeta version="test-version" />
    ).toMatchElem(
      <meta name="x-app-version" content="test-version" />
    );
  });
});
`;
