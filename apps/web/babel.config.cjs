module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          browsers: [
            '> 0.5%',
            'last 2 versions',
            'Firefox ESR',
            'not dead',
            'not IE 11',
            'Safari >= 10',
            'iOS >= 10'
          ]
        },
        useBuiltIns: 'usage',
        corejs: 3,
        modules: false,
        debug: false
      }
    ],
    '@babel/preset-typescript'
  ],
  plugins: [
    '@babel/plugin-transform-runtime'
  ]
}