const inclusiveLanguage = require('@11ty/eleventy-plugin-inclusive-language');
const markdownIt = require('markdown-it');
const htmlmin = require('html-minifier');
const postcss = require('postcss');

module.exports = function(eleventyConfig) {
  // extend markdown processing
  const md = markdownIt({
    html: true,
    linkify: true,
    typographer: true
  }).use(require('markdown-it-attrs'), {
    allowedAttributes: ['id', 'class', 'rel', 'target']
  }).use(require('markdown-it-anchor'));

  // set target="_blank" for all links: https://github.com/markdown-it/markdown-it/blob/master/docs/architecture.md#renderer:qa
  const defaultRender =
    md.renderer.rules.link_open ||
    function(tokens, idx, options, env, self) {
      return self.renderToken(tokens, idx, options);
    };

  md.renderer.rules.link_open = function(tokens, idx, options, env, self) {
    const aIndex = tokens[idx].attrIndex('target');

    if (aIndex < 0) {
      tokens[idx].attrPush(['target', '_blank']);
    } else {
      tokens[idx].attrs[aIndex][1] = '_blank';
    }

    return defaultRender(tokens, idx, options, env, self);
  };

  eleventyConfig.setLibrary('md', md);

  eleventyConfig.addPlugin(inclusiveLanguage);

  // html optimizing
  eleventyConfig.addTransform('htmlmin', function(content, outputPath) {
    if (outputPath.endsWith('.html')) {
      return htmlmin.minify(content, {
        collapseBooleanAttributes: true,
        collapseWhitespace: true,
        decodeEntities: true,
        removeAttributeQuotes: true,
        removeComments: true,
        removeEmptyAttributes: true,
        removeOptionalTags: true,
        removeRedundantAttributes: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true,
        sortAttributes: true,
        sortClassName: true,
        useShortDoctype: true
      });
    }

    return content;
  });

  // postcss processing and optimizing
  eleventyConfig.addNunjucksAsyncFilter('postcss', function(content, callback) {
    postcss([
      require('postcss-import'),
      require('postcss-preset-env')({ stage: 1 }),
      require('postcss-flexbugs-fixes'),
      require('colorguard'),
      require('cssnano')({
        preset: ['advanced']
      })
    ])
      .process(content)
      .then(function(result) {
        callback(null, result.css);
      })
      .catch(function(err) {
        callback(err, null);
      });
  });

  // match on first div tag since html-minifier removes body tag
  eleventyConfig.setBrowserSyncConfig({
    snippetOptions: {
      rule: {
        match: /<div/i,
        fn: function (snippet, match) {
          return snippet + match;
        }
      }
    }
  });

  return {
    dir: {
      input: 'src'
    },
    htmlTemplateEngine: 'njk',
    templateFormats: ['njk', 'md', 'ico', 'png']
  };
};
