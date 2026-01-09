/**
 * Convert SVG to PNG using resvg
 */
import { Resvg } from '@resvg/resvg-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const svgPath = path.join(__dirname, '..', 'e2e', 'screenshots', 'hex-grid-preview.svg')
const pngPath = path.join(__dirname, '..', 'e2e', 'screenshots', 'hex-grid-preview.png')

console.log('Converting SVG to PNG...')

const svg = fs.readFileSync(svgPath, 'utf-8')

const resvg = new Resvg(svg, {
  fitTo: {
    mode: 'width',
    value: 1200,
  },
})

const pngData = resvg.render()
const pngBuffer = pngData.asPng()

fs.writeFileSync(pngPath, pngBuffer)

console.log(`✓ PNG written to: ${pngPath}`)
console.log(`  Size: ${(pngBuffer.length / 1024).toFixed(1)} KB`)
