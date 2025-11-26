
module.exports = {
  root: true,
  env: { es2021: true },
  parserOptions: { ecmaVersion: 2021, sourceType: 'module' },
  extends: ['eslint:recommended', 'plugin:import/recommended', 'prettier'],
  plugins: ['import', 'prettier'],
  rules: {
    'prettier/prettier': 'error',
    // ignore unused function args that start with an underscore (useful for Express _next)
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }]
  },
  overrides: [
    {
      files: ['backend/**/*.js', 'backend/**/*.mjs'],
      env: { node: true },
      parserOptions: { ecmaVersion: 2021, sourceType: 'module' }
    },
    {
      files: ['frontend/**/*.{js,jsx}'],
      env: { browser: true, es2021: true },
      parser: '@babel/eslint-parser',
      parserOptions: { ecmaFeatures: { jsx: true }, requireConfigFile: false },
      plugins: ['react', 'react-hooks', 'prettier'],
      extends: ['eslint:recommended', 'plugin:react/recommended', 'prettier'],
      settings: { react: { version: 'detect' } },
      rules: {
        'react/react-in-jsx-scope': 'off',
        'prettier/prettier': 'error'
      }
    }
  ]
};
