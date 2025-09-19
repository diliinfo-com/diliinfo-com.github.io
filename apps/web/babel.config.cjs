module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          browsers: [
            'last 2 Chrome versions',
            'last 2 Firefox versions',
            'last 2 Safari versions',
            'last 2 Edge versions',
            'iOS >= 10',
            'Android >= 5'
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
    [
      '@babel/plugin-transform-runtime',
      {
        corejs: 3,
        helpers: true,
        regenerator: true,
        useESModules: true
      }
    ]
  ]
};