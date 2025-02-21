import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
const _ = {
  ERROR: 'error',
  WARN: 'warn',
  OFF: 'off',
  NEVER:  'never',
  ALWAYS: 'always',
}
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "no-restricted-imports": [
        "error",
        {
          "patterns": ["@mui/*/*/*"]
        }
      ],
      'no-unused-vars': _.ERROR,
      'comma-dangle': [_.ERROR, 'always-multiline'],
      'space-infix-ops': _.OFF,
      'space-before-function-paren': _.OFF,
      'prefer-arrow-callback': _.ERROR,
      'func-style': [_.ERROR, 'expression'],
      'arrow-spacing': _.OFF,
      'brace-style': _.OFF,
      'keyword-spacing': _.OFF,
      'space-before-blocks': _.OFF,
      'operator-linebreak': _.OFF,
      'no-multiple-empty-lines': _.ERROR,
      'no-trailing-spaces': _.ERROR,
      'semi': [_.ERROR, _.NEVER],
      'quotes': [_.ERROR, 'single'],
      'no-useless-constructor':_.OFF,
      'indent': ['error', 2],
      'camelcase': [_.OFF, { properties: _.ALWAYS }],
      'object-curly-spacing': [_.ERROR, _.ALWAYS],
      'max-len':[_.WARN, {
        'code': 160,
        'tabWidth': 2,
        'ignoreTrailingComments': true,
        'ignoreUrls': true,
        'ignoreStrings': true,
        'ignoreTemplateLiterals': true,
      }],
      'react-hooks/exhaustive-deps': _.OFF,
      '@next/next/no-html-link-for-pages': [_.OFF],
      'no-relative-import-paths/no-relative-import-paths': [
        _.ERROR,
        { 'allowSameFolder': true },
      ],
      '@typescript-eslint/array-type':  ['error', { 'default': 'generic' }],
      '@typescript-eslint/no-empty-interface': _.OFF,
      '@typescript-eslint/no-namespace': _.OFF,
      '@typescript-eslint/no-explicit-any': _.OFF,
      '@typescript-eslint/no-var-requires': _.OFF,
      '@typescript-eslint/ban-ts-comment': _.OFF,
      '@typescript-eslint/no-empty-function': _.OFF,
    }
  }
];

export default eslintConfig;
