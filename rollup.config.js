import typescript from '@rollup/plugin-typescript'
import commonjs from 'rollup-plugin-commonjs'
import resolve from 'rollup-plugin-node-resolve'
import peerDepsExternal from 'rollup-plugin-peer-deps-external'
import json from '@rollup/plugin-json'
import { uglify } from 'rollup-plugin-uglify'

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
    resolve({ preferBuiltins: true, extensions: ['.mjs', '.js', '.jsx', '.json'] }),
    commonjs({
      include: 'node_modules/**',
    }),
    json(),
    uglify(),
  ],
}
