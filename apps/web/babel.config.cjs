module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          browsers: [
            'defaults',
            'Safari >= 11',
            'iOS >= 10',
            'Chrome >= 60',
            'Firefox >= 55',
            'Edge >= 16'
          ]
        },
        useBuiltIns: 'entry',
        corejs: 3,
        modules: false
      }
    ],
    '@babel/preset-typescript'
  ],
  plugins: [
    '@babel/plugin-transform-runtime'
  ]
}