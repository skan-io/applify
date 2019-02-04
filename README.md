# Applify

:zap: A configurable React application generator

```bash
npm i -g @skan-io/applify
```

```bash
applify init
```

## Configuration

:book: `applify.config.js`

```js
const config = (production)=> ({
  mode: production ? 'production' : 'development',

  release: new ApplifyReleasePlugin({
    private: false,
    semantic: true
  }),

  prompt: new ApplifyPromptPlugin(),
  printer: new ApplifyPrinterPlugin(),
  tasks: new ApplifyTasksPlugin({
    debug: true,
    style: 'list' // or 'progress'
  }),
  execution: new ApplifyExecutionPlugin(),

  sourceControlManager: new ApplifySourcePlugin({
    use: 'github',
    initBranches: ['master', 'dev', 'test'],
    match: 'amplify'
  }),
  packageManager: new ApplifyPackagePlugin({
    use: 'npm'
  }),
  buildManager: new ApplifyBuildPlugin({
    use: ['webpack', 'react-entry-loader'],
    entry: {
      inputs: {
        app: 'src/index.html.js'
      }
    },
    output: 'build/pkg',
    loaders: ['babel', 'css', 'sass', 'file', 'url']
  }),
  developmentServer: new ApplifyServerPlugin({
    use: 'webpack-dev-server'
  }),
  moduleManager: new ApplifyModulePlugin({
    structure: {
      module: 'index.js',
      test: 'index.test.js',
      style: 'index.css',
      helpers: 'utils.js'
    },
    use: {
      component: 'react',
      store: 'redux',
      reducer: true,
      actions: true
    }
  }),
  backendManager: new ApplifyBackendPlugin({
    use: 'amplify',
    initEnvs: ['master', 'dev', 'test'],
    profiles: {
      master: 'default',
      dev: 'default',
      test: 'default'
    }
  }),

  services: [
    new ApplifyAuthServicePlugin(),
    new ApplifyGraphQlServicePlugin({
      ...
    })
  ],

  resources: [
    new ApplifyLogoResourcePlugin({
      url: 'http://www.link-to-my-logo.com/logo.png'
    })
  ]
});

export default config;
```
