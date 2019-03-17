/* eslint max-len: 0 */


export const createHtmlSecurityTask = ()=> `import React, {Fragment} from 'react';
import PropTypes from 'prop-types';


const SecurityMeta = ()=> (
  <Fragment>
    <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
    <meta httpEquiv="X-XSS-Protection" content="1" />
  </Fragment>
);

SecurityMeta.propTypes = {
  appUrl: PropTypes.string
};

export default SecurityMeta;
`;

export const createHtmlSecurityTestTask = ()=> `import React, {Fragment} from 'react';
import SecurityMeta from './security';


describe('<SecurityMeta /> regression', ()=> {
  it('renders tags', ()=> {
    expect(
      <SecurityMeta />
    ).toMatchElem(
      <Fragment>
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-XSS-Protection" content="1" />
      </Fragment>
    );
  });
});
`;
