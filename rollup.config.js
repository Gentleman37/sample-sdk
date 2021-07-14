import typescript from '@rollup/plugin-typescript'
import commonjs from 'rollup-plugin-commonjs'
import resolve from 'rollup-plugin-node-resolve'
import peerDepsExternal from 'rollup-plugin-peer-deps-external'

export default {
  input: 'src/index.ts',
  output: [
    {
      format: 'cjs',
      file: 'dist/cjs/bundle.js',
    },
    {
      format: 'es',
      file: 'dist/es/bundle.js',
    },
  ],
  plugins: [
    typescript({ target: 'ESNext' }),
    peerDepsExternal(),
    resolve({ extensions: ['.mjs', '.js', '.jsx', '.json'] }),
    commonjs({
      include: 'node_modules/**',
    }),
  ],
}
