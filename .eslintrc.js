module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: ['@pitcher'],
  parserOptions: {
    parser: 'babel-eslint',
  },
  ignorePatterns: ['public/translations/**/*.json'],
  overrides: [
    {
      files: ['**/*.spec.{j,t}s?(x)'],
      env: {
        jest: true,
      },
    },
  ],
}
