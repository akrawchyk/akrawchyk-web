const inclusiveLanguage = require('@11ty/eleventy-plugin-inclusive-language');
const markdownIt = require('markdown-it')
const htmlmin = require('html-minifier');
const postcss = require('postcss');

module.exports = function(eleventyConfig) {
  eleventyConfig.setLibrary('md', markdownIt({
    html: true,
    linkify: true,
    typographer: true
  }).use(require('markdown-it-attrs'), {
    allowedAttributes: ['id', 'class', 'rel', 'target']
  }));

  eleventyConfig.addPlugin(inclusiveLanguage);

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
      });
  });

  return {
    dir: {
      input: 'src'
    },
    htmlTemplateEngine: 'njk',
    templateFormats: ['njk', 'md', 'ico', 'png']
  };
};
