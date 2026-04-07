import StyleDictionary from 'style-dictionary';

const sd = new StyleDictionary({
  source: ['src/tokens.json'],
  platforms: {
    css: {
      transformGroup: 'css',
      prefix: 'vds',
      buildPath: 'dist/css/',
      files: [{
        destination: 'tokens.css',
        format: 'css/variables'
      }]
    },
    js: {
      transformGroup: 'js',
      buildPath: 'dist/js/',
      files: [{
        destination: 'tokens.js',
        format: 'javascript/es6'
      }]
    }
  }
});

await sd.buildAllPlatforms();
