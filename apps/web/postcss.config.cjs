module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {
      overrideBrowserslist: [
        '> 0.5%',
        'last 2 versions',
        'Firefox ESR',
        'not dead',
        'not IE 11',
        'Safari >= 10',
        'iOS >= 10'
      ],
      grid: 'autoplace',
      flexbox: 'no-2009'
    }
  }
}