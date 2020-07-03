module.exports = {
  env: {
    browser: true,
    node: true,
    mocha: true,
  },
  extends: ['airbnb-base', 'plugin:prettier/recommended'],
  rules: {
    'eol-last': 1,
    'no-multiple-empty-lines': 1,
    'no-underscore-dangle': [
      'error',
      {
        allow: ['_id', '_source', '_index'],
      },
    ],
    'no-param-reassign': 0,
    'object-property-newline': [
      'error',
      {
        allowMultiplePropertiesPerLine: false,
      },
    ],
    'no-shadow': 0,
    'consistent-return': 0,
    'func-names': 0,
    'object-curly-spacing': 0,
    'no-console': 0,
    'no-mixed-operators': 0,
    'no-plusplus': [
      'error',
      {
        allowForLoopAfterthoughts: true,
      },
    ],
    'padding-line-between-statements': [
      'error',
      {
        blankLine: 'always',
        prev: ['const', 'let', 'var'],
        next: '*',
      },
      {
        blankLine: 'any',
        prev: ['const', 'let', 'var'],
        next: ['const', 'let', 'var'],
      },
      {
        blankLine: 'always',
        prev: 'block-like',
        next: '*',
      },
      {
        blankLine: 'always',
        prev: '*',
        next: 'block-like',
      },
    ],
    'security/detect-object-injection': 0,
    'no-use-before-define': ['error', { functions: false }],
    'arrow-parens': ['error', 'as-needed'],
    'lines-between-class-members': [
      'error',
      'always',
      { exceptAfterSingleLine: true },
    ],
  },
  parserOptions: {
    ecmaVersion: 10,
    sourceType: 'module',
  },
};
