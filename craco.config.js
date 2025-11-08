const path = require('path');

module.exports = {
  webpack: {
    alias: {
      '@api': path.resolve(__dirname, 'src/api'),
      '@components': path.resolve(__dirname, 'src/components/index.ts'),
      '@pages': path.resolve(__dirname, 'src/pages/index.ts'),
      '@shared': path.resolve(__dirname, 'src/shared'),
      '@store': path.resolve(__dirname, 'src/store'),
      '@widgets': path.resolve(__dirname, 'src/widgets/index.ts'),
    },
  },
};
