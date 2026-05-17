import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

const dir = path.resolve(__dirname);
const nm = path.join(dir, 'node_modules');

export default defineConfig({
    plugins: [react()],
    root: dir,
    resolve: {
        alias: [
            { find: 'react', replacement: path.join(nm, 'react') },
            { find: 'react-dom', replacement: path.join(nm, 'react-dom') },
            { find: 'react-router-dom', replacement: path.join(nm, 'react-router-dom') },
            { find: 'react-router', replacement: path.join(nm, 'react-router') },
        ],
        dedupe: ['react', 'react-dom'],
    },
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: [path.join(dir, 'src/test-setup.ts')],
        include: ['src/**/*.test.{ts,tsx}'],
    },
});
