const inclusiveLanguage = require('@11ty/eleventy-plugin-inclusive-language');

const postcss = require('postcss');

module.exports = function(eleventyConfig) {
  eleventyConfig.addPlugin(inclusiveLanguage);

  eleventyConfig.addFilter('postcss', function(css) {
    const plugins = [
      require('postcss-import'),
      require('colorguard'),
      require('postcss-preset-env'),
      require('postcss-flexbugs-fixes')
    ];

    return postcss(plugins).process(css)
      .then(function(result) {
        return result.code
      })
      .catch(function(error) {
        console.log(error)
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
