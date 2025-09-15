# Hangulling 한글링

# 커밋 유형
Feat: 새로운 기능 추가  
Fix: 버그 수정  
Docs: 문서 수정  
Style: 코드 formatting, 세미콜론 누락, 코드 자체의 변경이 없는 경우  
Refactor: 코드 리팩토링  
Test: 테스트 코드, 리팩토링 테스트 코드 추가  
Chore: 패키지 매니저 수정, 그 외 기타 수정 ex) .gitignore  
Design: CSS 등 사용자 UI 디자인 변경  
Comment: 필요한 주석 추가 및 변경  
Rename: 파일 또는 폴더 명을 수정하거나 옮기는 작업만인 경우  
Remove: 파일을 삭제하는 작업만 수행한 경우  
!BREAKING CHANGE: 커다란 API 변경의 경우  
!HOTFIX: 급하게 치명적인 버그를 고쳐야 하는 경우  

# 폴더구조



## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
