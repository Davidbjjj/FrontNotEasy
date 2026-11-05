/** @type { import('@storybook/react-webpack5').StorybookConfig } */
module.exports = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: [
    '@storybook/preset-create-react-app',
    '@storybook/addon-essentials',
    // axe-core: aba "Accessibility" em cada story
    '@storybook/addon-a11y',
  ],
  framework: { name: '@storybook/react-webpack5', options: {} },
  staticDirs: ['../public'],
};
