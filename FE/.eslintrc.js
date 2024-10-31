module.exports = {
  root: true,
  env: {
    node: true
  },
  parserOptions: {
    ecmaVersion: 2020,
    requireConfigFile: false // Tắt yêu cầu tìm tệp cấu hình Babel
  },
  extends: [
     'plugin:vue/vue3-essential',
    'eslint:recommended'
  ],
  rules: {
    
  }
}