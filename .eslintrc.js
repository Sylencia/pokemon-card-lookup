const OFF = 0,
  WARN = 1,
  ERROR = 2

module.exports = {
  env: {
    browser: true,
    es6: true,
    jest: true,
    node: true,
  },
  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 8,
    ecmaFeatures: {
      impliedStrict: true,
      jsx: true,
      experimentalObjectRestSpread: true,
    },
  },
  plugins: ['prettier', 'react', 'standard'],
  extends: [
    'prettier',
    'eslint:recommended',
    'plugin:react/recommended',
    'standard',
  ],
  settings: {
    'import/resolver': {
      node: {
        moduleDirectory: ['node_modules', 'src/js'],
      },
    },
  },
  rules: {
    'comma-dangle': [ERROR, 'always-multiline'],
    // 'object-curly-spacing': [ERROR, 'always'],
    // 'object-shorthand': [ERROR, 'properties'],
    // 'jsx-quotes': ['error', 'prefer-double'],
    'react/jsx-pascal-case': OFF,
    'react/forbid-prop-types': OFF,
    'space-before-function-paren': OFF,
    // 'no-extra-parens': OFF,
    // 'camelcase': OFF,
    'react/jsx-filename-extension': OFF,
    'prettier/prettier': 'error',
  },
}
