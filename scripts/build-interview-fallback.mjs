import { build } from 'vite'
import { readFileSync, statSync } from 'node:fs'
import { resolve } from 'node:path'

// The public/ fallback is copied verbatim by Vite, so browser-relative imports
// into src/ would 404 after deployment. Build it as a separate ESM entry and
// overwrite only the copied fallback JS inside the already-built dist folder.
const outfile = resolve('dist/interview-studio/app.js')
await build({
  configFile: false,
  publicDir: false,
  base: './',
  logLevel: 'warn',
  build: {
    target: 'es2020',
    outDir: resolve('dist/interview-studio'),
    emptyOutDir: false,
    sourcemap: false,
    minify: true,
    lib: {
      entry: resolve('public/interview-studio/app.js'),
      formats: ['es'],
      fileName: () => 'app.js',
    },
  },
})
const output = readFileSync(outfile, 'utf8')
if (!output.trim() || /(?:\.\.\/){2}src\//.test(output)) {
  throw new Error('Interview fallback was not fully bundled for GitHub Pages')
}
console.log('Interview fallback bundle: ' + (statSync(outfile).size / 1024).toFixed(1) + ' KB')
