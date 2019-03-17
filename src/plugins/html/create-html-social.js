import {basename} from 'path';


/* eslint max-len: 0 */


export const createHtmlSocialTask = ({answers})=> `import React, {Fragment} from 'react';

/* eslint max-len: 0 */
/* eslint react/prop-types: off */

const SocialMeta =({title, appUrl, description})=> (
  <Fragment>
    <title>{title}</title>

    <meta name="author" content="${answers.projectAuthor}" />
    <meta name="title" content={title} />
    <meta name="description" content={description} />
    <meta
      name="keywords"
      content="${answers.htmlKeywords}"
    />
    <link rel="shortcut icon" href="${basename(answers.faviconUrl)}" />

    {/* Twitter Card data */}
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:site" content="${answers.htmlTwitter}" />

    {/* Open Graph data */}
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="${answers.projectAuthor}" />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />

    <meta property="og:image" content={\`\${appUrl}${basename(answers.htmlShareImg)}\`} />
    <meta property="og:url" content={\`\${appUrl}\`} />

    {/* Schema.org markup for Google+ */}
    <meta itemProp="name" content={title} />
    <meta itemProp="description" content={description} />
    <meta itemProp="image" content={\`\${appUrl}${basename(answers.htmlShareImg)}\`} />

    <meta name="robots" content="all" />
    <meta name="rating" content="General" />
    <meta name="copyright" content="&copy; ${answers.htmlCopyright}" />

    {/* Disables the ability for the pinterest plugin to save images */}
    <meta name="pinterest" content="nopin" />
  </Fragment>
);

export default SocialMeta;
`;


export const createHtmlSocialTestTask = ({answers})=> `import React, {Fragment} from 'react';
import SocialMeta from './social';


describe('<SocialMeta /> regression', ()=> {
  it('renders tags', ()=> {
    expect(
      <SocialMeta
        title="test-title"
        description="test-description"
        appUrl="test-url/"
      />
    ).toMatchElem(
      <Fragment>
        <title>test-title</title>

        <meta name="author" content="${answers.projectAuthor}" />
        <meta name="title" content="test-title" />
        <meta name="description" content="test-description" />
        <meta
          name="keywords"
          content="${answers.htmlKeywords}"
        />
        <link rel="shortcut icon" href="${basename(answers.faviconUrl)}" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="${answers.htmlTwitter}" />

        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="${answers.projectAuthor}" />
        <meta property="og:title" content="test-title" />
        <meta property="og:description" content="test-description" />

        <meta property="og:image" content="test-url/${basename(answers.htmlShareImg)}" />
        <meta property="og:url" content="test-url/" />

        <meta itemProp="name" content="test-title" />
        <meta itemProp="description" content="test-description" />
        <meta itemProp="image" content="test-url/${basename(answers.htmlShareImg)}" />

        <meta name="robots" content="all" />
        <meta name="rating" content="General" />
        <meta name="copyright" content="&copy; ${answers.htmlCopyright}" />

        <meta name="pinterest" content="nopin" />
      </Fragment>
    );
  });
});
`;
