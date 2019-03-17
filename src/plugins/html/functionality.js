import {join} from 'path';
import {writeFileSync} from 'fs';
import {createDirectory} from '../../utils/fs';
import {createHtmlMainTask, createHtmlMainTestTask} from './create-html-main';
import {
  createHtmlRenderTask,
  createHtmlRenderTestTask
} from './create-html-render';
import {
  createHtmlSecurityTask,
  createHtmlSecurityTestTask
} from './create-html-security';
import {
  createHtmlSocialTask,
  createHtmlSocialTestTask
} from './create-html-social';
import {
  createHtmlVersionTask,
  createHtmlVersionTestTask
} from './create-html-version';
import {
  createHtmlViewportTask,
  createHtmlViewportTestTask
} from './create-html-viewport';


export const writeHtmlFiles = async (store)=> {
  store.addTask({
    type: 'batch',
    description: 'Write html files',
    children: [
      {
        type: 'task',
        description: 'create html directory',
        task: (storeCtx)=>
          createDirectory(join(storeCtx.appSrcDir, 'html'))
      },
      {
        type: 'task',
        description: 'write main html file',
        task: (storeCtx)=> {
          const mainFile = join(storeCtx.appSrcDir, storeCtx.answers.htmlMain);
          const mainFileString = createHtmlMainTask(store);
          const mainTestFile = join(
            storeCtx.appSrcDir,
            `${storeCtx.answers.htmlMain.replace('.html.js', '.html.test.js')}`
          );
          const mainTestFileString = createHtmlMainTestTask(store);

          writeFileSync(mainFile, mainFileString);
          writeFileSync(mainTestFile, mainTestFileString);

          return {
            printInfo: `Wrote ${mainFile}`,
            printSuccess: mainFileString
          };
        }
      },
      {
        type: 'task',
        description: 'write html render file',
        task: (storeCtx)=> {
          const renderFile = join(
            storeCtx.appSrcDir,
            'html',
            'render.js'
          );
          const renderFileString = createHtmlRenderTask(store);
          const renderTestFile = join(
            storeCtx.appSrcDir,
            'html',
            'render.test.js'
          );
          const renderTestFileString = createHtmlRenderTestTask(store);

          writeFileSync(renderFile, renderFileString);
          writeFileSync(renderTestFile, renderTestFileString);

          return {
            printInfo: `Wrote ${renderFile}`,
            printSuccess: renderFileString
          };
        }
      },
      {
        type: 'task',
        description: 'write html security file',
        task: (storeCtx)=> {
          const securityFile = join(
            storeCtx.appSrcDir,
            'html',
            'security.js'
          );
          const securityFileString = createHtmlSecurityTask(store);
          const securityTestFile = join(
            storeCtx.appSrcDir,
            'html',
            'security.test.js'
          );
          const securityTestFileString = createHtmlSecurityTestTask(store);

          writeFileSync(securityFile, securityFileString);
          writeFileSync(securityTestFile, securityTestFileString);

          return {
            printInfo: `Wrote ${securityFile}`,
            printSuccess: securityFileString
          };
        }
      },
      {
        type: 'task',
        description: 'write html social file',
        task: (storeCtx)=> {
          const socialFile = join(
            storeCtx.appSrcDir,
            'html',
            'social.js'
          );
          const socialFileString = createHtmlSocialTask(store);
          const socialTestFile = join(
            storeCtx.appSrcDir,
            'html',
            'social.test.js'
          );
          const socialTestFileString = createHtmlSocialTestTask(store);

          writeFileSync(socialFile, socialFileString);
          writeFileSync(socialTestFile, socialTestFileString);

          return {
            printInfo: `Wrote ${socialFile}`,
            printSuccess: socialFileString
          };
        }
      },
      {
        type: 'task',
        description: 'write html version file',
        task: (storeCtx)=> {
          const versionFile = join(
            storeCtx.appSrcDir,
            'html',
            'version.js'
          );
          const versionFileString = createHtmlVersionTask(store);
          const versionTestFile = join(
            storeCtx.appSrcDir,
            'html',
            'version.test.js'
          );
          const versionTestFileString = createHtmlVersionTestTask(store);

          writeFileSync(versionFile, versionFileString);
          writeFileSync(versionTestFile, versionTestFileString);

          return {
            printInfo: `Wrote ${versionFile}`,
            printSuccess: versionFileString
          };
        }
      },
      {
        type: 'task',
        description: 'write html viewport file',
        task: (storeCtx)=> {
          const viewportFile = join(
            storeCtx.appSrcDir,
            'html',
            'viewport.js'
          );
          const viewportFileString = createHtmlViewportTask(store);
          const viewportTestFile = join(
            storeCtx.appSrcDir,
            'html',
            'viewport.test.js'
          );
          const viewportTestFileString = createHtmlViewportTestTask(store);

          writeFileSync(viewportFile, viewportFileString);
          writeFileSync(viewportTestFile, viewportTestFileString);

          return {
            printInfo: `Wrote ${viewportFile}`,
            printSuccess: viewportFileString
          };
        }
      }
    ]
  });
};
