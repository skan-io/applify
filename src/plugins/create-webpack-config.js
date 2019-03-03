/* eslint max-len: 0 */
import {parseArrayString} from './utils';
import isUrl from 'isurl';


const addStoryBook = ()=> `    devServer: {
      ...config.devServer,
      historyApiFallback: {
        rewrites: [
          {from: /^\\/$/, to: \`/\${deployPath}/\`},
          {from: /^\\/stories\\/?$/, to: '/stories/index.html'}
        ]
      },
      before: async (app)=> {
        const configDir = resolve(__dirname, 'storybook');
        const router = await storybook({configDir});
        app.use(router);
      }
    }`;


export const createWebpackConfig = ({answers})=> `/* eslint-env node */
/* eslint no-console: 0 */
${answers.useStorybook ? `import {resolve} from 'path';\n` : ''}import webpackInitialiser from '@skan-io/webpack-config-base';${answers.useStorybook ? '\nimport storybook from \'@storybook/core/dist/server/dev-server\';' : ''}
import {version, deployPath, deployUrl, nodeEnv} from './build/config';


export default ()=> {
  const buildEntries = [${parseArrayString(answers.buildEntries).array.map((target)=> `'${target}'`).toString()}];
  const buildOutputPath = '${answers.buildOutputPath}';
  const devServerPort = ${answers.devServerPort};
  const faviconUrl = '${isUrl(answers.faviconUrl) || answers.faviconUrl.startsWith('http') ? 'favicon.png' : answers.faviconUrl}';
  const useSass = ${answers.styleChoice === 'sass'};

  // Creates build entry points, output paths and plugin configs
  const webpackConfig = webpackInitialiser(
    buildEntries,
    buildOutputPath,
    devServerPort,
    faviconUrl,
    useSass
  );

  const isProduction = (nodeEnv === 'production');
  const appUrl = deployUrl;

  console.log(\`
    Running webpack with config from './build/config.json':
    NODE_ENV=\${nodeEnv}
    version=\${version}
    app-url=\${appUrl}
  \`);

  const config = webpackConfig(nodeEnv, appUrl, deployPath, version);

  return {
    ...config${answers.useStorybook ? `,\n${addStoryBook()}` : ''}
  };
}
`;
