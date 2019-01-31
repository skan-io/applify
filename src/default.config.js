import ApplifyPrompterPlugin from './plugins/prompts/';
import OraListPrinterPlugin from './plugins/printers/';
import NpmAdapterPlugin from './plugins/adapters/package/npm';
import GitSourceAdapterPlugin from './plugins/adapters/source/git';
import AmplifyAdapterPlugin from './plugins/adapters/backend/amplify';
import CopyFilePlugin from './plugins/copy-file';


const config = ()=> ({
  mode: 'development',
  output: resolve(__dirname, 'src'),

  prompter: new ApplifyPrompterPlugin(),
  executor: new ApplifyExecutionPlugin(),
  module: new ApplifyModuleBuilderPlugin(),
  printer: new ApplifyListPrinterPlugin(),
  order: ['package', 'source', 'bundle', 'backend', 'services'],

  packageAdapter: new NpmAdapterPlugin(),
  sourceAdapter: new GitSourceAdapterPlugin({
    branches: ['master', 'test', 'dev']
  }),
  backendAdapter: new AmplifyAdapterPlugin({
    profiles: ['default'],
    envs: ['master', 'test', 'dev']
  }),
  bundleAdapter: new WebpackAdapterPlugin(webpackConfig),

  resources: {
    use: [
      new CopyFilePlugin({
        from: __dirname,
        to: join(__dirname, 'src'),
        include: ['logo.png, README.md']
      }),
      new ArgonUiPlugin()
    ]
  },

  services: {
    use: [
      new AmplifyAuthServicePlugin(),
      new AmplifyGraphQLServicePlugin(schema, endpoints)
    ]
  }
});

export default config;
