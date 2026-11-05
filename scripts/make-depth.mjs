// Mapas de profundidad (Depth Anything v2, ONNX vía transformers.js) para la escena de la casa.
// Requiere, solo para generar (no es dependencia de la web): npm i --no-save @huggingface/transformers@3.7.5
// Uso: node scripts/make-depth.mjs assets-demo/depth assets-demo/casa-salon.jpg ...
import { pipeline, RawImage } from '@huggingface/transformers';
import { writeFileSync } from 'node:fs';
const [, , outDir, ...files] = process.argv;
const est = await pipeline('depth-estimation', 'onnx-community/depth-anything-v2-base', { dtype: 'fp32' });
for (const f of files) {
  const img = await RawImage.read(f);
  const small = await img.resize(1280, Math.round(1280 * img.height / img.width));
  const { depth } = await est(small);
  const name = f.split(/[\/]/).pop().replace('.jpg', '');
  await depth.save(`${outDir}/${name}-depth.png`);
  console.log('depth', name, depth.width, depth.height);
}
