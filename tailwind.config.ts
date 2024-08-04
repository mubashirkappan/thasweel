import type { Config } from 'tailwindcss'
// import defaultTheme from 'tailwindcss/defaultTheme'

export default <Partial<Config>>{
  theme: {
    extend: {
      colors: {
        red: {
          '50': '#fff2f1',
          '100': '#ffe1e0',
          '200': '#ffc9c6',
          '300': '#ffa39f',
          '400': '#ff6e67',
          '500': '#fc544c',
          '600': '#e92219',
          '700': '#c51810',
          '800': '#a21912',
          '900': '#861b16',
          '950': '#490906',
      },
      'secondary': {
        '50': '#fefce8',
        '100': '#fffbc2',
        '200': '#fff488',
        '300': '#ffe544',
        '400': '#fed10e',
        '500': '#eeb804',
        '600': '#cd8e01',
        '700': '#a46404',
        '800': '#874f0c',
        '900': '#734010',
        '950': '#432105',
    },
    
      }
    }
  }
}
