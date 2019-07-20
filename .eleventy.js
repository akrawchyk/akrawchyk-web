const inclusiveLanguage = require('@11ty/eleventy-plugin-inclusive-language');

const htmlmin = require('html-minifier');
const postcss = require('postcss');

module.exports = function(eleventyConfig) {
  eleventyConfig.addPlugin(inclusiveLanguage);

  eleventyConfig.addTransform('htmlmin', function(content, outputPath) {
    if (outputPath.endsWith('.html')) {
      const minified = htmlmin.minify(content, {
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

      return minified;
    }

    return content;
  });

  eleventyConfig.addNunjucksAsyncFilter('postcss', function(content, callback) {
    const plugins = [
      require('postcss-import'),
      require('colorguard'),
      require('postcss-preset-env'),
      require('postcss-flexbugs-fixes'),
      require('cssnano')
    ];

    postcss(plugins).process(content)
      .then(function(result) {
        callback(null, result.css)
      });
  });

  return {
    dir: {
      input: 'src'
    },
    htmlTemplateEngine: 'njk',
    templateFormats: [
      'njk',
      'md',
      'ico',
      'png'
    ]
  };
};
