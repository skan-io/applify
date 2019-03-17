/* eslint max-len: 0 */
/* eslint no-magic-numbers: 0 */


export const createHtmlMainTask = ({answers})=> `import React from 'react';
import {Provider} from 'react-redux';
import {Module, Scripts, Styles} from 'react-entry-loader/injectors';
import SecurityMeta from './html/security';
import ViewportMeta from './html/viewport';
import SocialMeta from './html/social';
import VersionMeta from './html/version';
import render from './html/render';
import theme from './${answers.htmlMain.replace('html.js', '')}${answers.styleChoice === 'sass' ? 'scss' : answers.styleChoice}';
import App from './app';
import {store} from './store';


const containerId = 'root';

/* eslint max-len: 0 */
/* eslint react/prop-types: off */

const Html = ({scripts, styles, version, appUrl})=> (
  <html>
    <head>
      <VersionMeta version={version} />
      <meta httpEquiv="Content-Type" content="text/html; charset=UTF-8" />

      <SecurityMeta appUrl={appUrl} />

      <ViewportMeta />

      <SocialMeta
        title="${answers.htmlTitle}"
        appUrl={appUrl}
        description="${answers.projectDescription}"
      />
    </head>
    <body>
      <Styles files={styles} />

      <div id={containerId} className={theme.root}>
        <Module onLoad={(cmp)=> render(containerId)(cmp)}>
          <Provider store={store}>
            <App workaroundDependency={theme} />
          </Provider>
        </Module>
      </div>

      <iframe id="rp" style={{display: 'none'}} />

      <Scripts files={scripts} async />

    </body>
  </html>
);

export default Html;
`;

export const createHtmlMainTestTask = ({answers})=> `import React from 'react';
import {shallow} from 'enzyme';
import {Provider} from 'react-redux';
import {Module, Scripts, Styles} from 'react-entry-loader/injectors';
import SecurityMeta from './html/security';
import ViewportMeta from './html/viewport';
import SocialMeta from './html/social';
import VersionMeta from './html/version';
import render from './html/render';
import App from './app';
import {store} from './store';
import Html from './${answers.htmlMain.replace('.html.js', '')}.html';
import theme from './${answers.htmlMain.replace('html.js', '')}${answers.styleChoice === 'sass' ? 'scss' : answers.styleChoice}';


/* eslint max-len: 0 */


jest.mock('./store', ()=> ({
  store: {
    subscribe: jest.fn(),
    dispatch: jest.fn(),
    getState: jest.fn()
  }
}));

jest.mock('./html/render', ()=> jest.fn(()=> jest.fn()));


describe('index.html', ()=> {
  it('renders page', ()=> {
    const scripts = ['test.js'];
    const styles = ['test.${answers.styleChoice === 'sass' ? 'scss' : answers.styleChoice}'];

    expect(
      <Html
        scripts={scripts}
        styles={styles}
        version="test-version"
        appUrl="${answers.deployEnv}"
      />
    ).toMatchElem(
      <html>
        <head>
          <VersionMeta version="test-version" />
          <meta httpEquiv="Content-Type" content="text/html; charset=UTF-8" />
          <SecurityMeta />
          <ViewportMeta />
          <SocialMeta
            title="${answers.htmlTitle}"
            appUrl="${answers.deployEnv}"
            description={
              '${answers.projectDescription}'
            }
          />
        </head>
        <body>
          <Styles files={styles} />
          <div id="root" className="mock-root">
            <Module>
              <Provider store={store}>
                <App workaroundDependency={theme} />
              </Provider>
            </Module>
          </div>
          <iframe id="rp" style={{display: 'none'}} />
          <Scripts files={scripts} async={true} />
        </body>
      </html>
    );
  });

  it('module onLoad handler renders app at runtime', ()=> {
    const app = 'app-component';
    const module = shallow(<Html appUrl="http://localhost" />).find(Module);
    const {onLoad} = module.props();

    onLoad(app);

    expect(render).toHaveBeenCalledWith('root');
    expect(render.mock.results[0].value).toHaveBeenCalledWith(app);
  });
});
`;
