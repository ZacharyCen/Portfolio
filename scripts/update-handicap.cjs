const fs = require('node:fs/promises');

async function updateHandicap() {
  const licence = process.env.RFEG_LICENCE?.trim().toUpperCase();
  if (!licence || !/^[A-Z0-9]{5,16}$/.test(licence)) {
    throw new Error('Set RFEG_LICENCE to your federation licence number.');
  }

  const endpoint = new URL('https://rfegolf.es/wp-json/handicap-search/v1/search');
  endpoint.searchParams.set('q', licence);
  endpoint.searchParams.set('size', '5');
  const response = await fetch(endpoint, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(15000),
    redirect: 'error'
  });
  if (!response.ok) throw new Error('RFEG request failed (HTTP ' + response.status + ').');

  const result = await response.json();
  const matches = (result?.data?.hits || []).filter(
    hit => hit.document?.guid_licence?.trim().toUpperCase() === licence
  );
  if (matches.length !== 1) throw new Error('RFEG did not return one exact licence match.');

  const raw = String(matches[0].document.handicap ?? '').trim().replace(',', '.');
  if (!/^[+-]?\d{1,2}(?:\.\d)?$/.test(raw) || Math.abs(Number(raw)) > 54) {
    throw new Error('RFEG did not return a valid handicap index.');
  }

  // WHS displays indices better than scratch with a plus sign.
  const index = raw.startsWith('+') ? -Number(raw) : Number(raw);
  const entry = { index, source: 'RFEG', checked: new Date().toISOString().slice(0, 10) };
  await fs.writeFile('golf-handicap.json.tmp', JSON.stringify(entry, null, 2) + '\n');
  await fs.rename('golf-handicap.json.tmp', 'golf-handicap.json');
  console.log('Handicap refreshed from RFEG.');
}

updateHandicap().catch(error => {
  // Never log the request URL, licence, or response body.
  console.error('Handicap lookup failed:', [
    'Set RFEG_LICENCE to your federation licence number.',
    'RFEG did not return one exact licence match.',
    'RFEG did not return a valid handicap index.'
  ].includes(error.message) ? error.message : 'RFEG lookup unavailable.');
  process.exitCode = 1;
});
