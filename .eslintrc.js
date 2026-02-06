module.exports = {
  root: true,
  extends: 'airbnb-base',
  env: {
    browser: true,
  },
  parser: '@babel/eslint-parser',
  parserOptions: {
    allowImportExportEverywhere: true,
    sourceType: 'module',
    requireConfigFile: false,
  },
  rules: {
    'import/extensions': ['error', { js: 'always' }],
    'linebreak-style': 0,
    'no-param-reassign': [2, { props: false }],
    // Add this line to ignore trailing whitespace on empty lines
    'no-trailing-spaces': ['error', { skipBlankLines: true }], 
  },
};