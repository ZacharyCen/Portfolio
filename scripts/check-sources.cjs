const fs = require('node:fs');
const vm = require('node:vm');
const crypto = require('node:crypto');

const urls = vm.runInNewContext(fs.readFileSync('data.js', 'utf8') + '\n; sources');
const outputPath = 'source-status.json';
const previous = fs.existsSync(outputPath) ? JSON.parse(fs.readFileSync(outputPath, 'utf8')) : {};
const checked = new Date().toISOString().slice(0, 10);

async function check([id, [, url]]) {
  const old = previous.sources?.[id] || {};
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(18000), headers: { 'User-Agent': 'ApplicationAtlas/1.0 public policy monitor' } });
    if (!response.ok) throw new Error('HTTP ' + response.status);
    const html = await response.text();
    const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1] || html;
    const content = main
      .replace(/<(script|style|svg|noscript)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ')
      .replace(/<[^>]+>/g, ' ').replace(/&nbsp;/gi, ' ').replace(/\s+/g, ' ').trim();
    if (content.length < 220 || /^(just a moment|access denied|verify you are human)/i.test(content)) throw new Error('Source text unavailable');
    const hash = crypto.createHash('sha256').update(content).digest('hex');
    return [id, { hash, changed: old.hash && old.hash !== hash ? checked : old.changed || null }];
  } catch (error) {
    console.warn(id, error.message);
    return [id, { ...old, error: true }];
  }
}

Promise.all(Object.entries(urls).map(check)).then(results => {
  fs.writeFileSync(outputPath, JSON.stringify({ checked, sources: Object.fromEntries(results) }, null, 2) + '\n');
});
