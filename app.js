const $ = id => document.getElementById(id);
const key = 'application-atlas-v1';
const day = 86_400_000;
const displayDate = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeZone: 'UTC' });
const load = () => {
  try { return JSON.parse(localStorage.getItem(key)) || {}; }
  catch { return {}; }
};
const saved = load();
let completed = new Set(saved.completed || []);
let schools = saved.schools || seedSchools.map(([name, course, url], index) => ({
  id: 'seed-' + index, name, course, url, stage: 'Researching', date: '', cost: ''
}));
let expanded = false;
let selected;

function persist() {
  try { localStorage.setItem(key, JSON.stringify({ completed: [...completed], schools })); }
  catch { document.querySelector('footer').textContent = 'Browser storage unavailable. Changes will be lost on reload.'; }
}

function node(tag, content, className) {
  const element = document.createElement(tag);
  if (content) element.textContent = content;
  if (className) element.className = className;
  return element;
}

function link(label, url) {
  const element = node('a', label);
  element.href = url;
  element.target = '_blank';
  element.rel = 'noopener noreferrer';
  return element;
}

function when(date) {
  const now = new Date();
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const days = Math.round((Date.parse(date) - today) / day);
  if (days === 0) return 'Today';
  const period = Math.abs(days) + (Math.abs(days) === 1 ? ' day' : ' days');
  return days < 0 ? period + ' overdue' : 'In ' + period;
}

function setMeter(progress, count, total) {
  progress.max = total;
  progress.value = count;
  progress.parentElement.style.setProperty('--completion', count / total);
}

const categoryMeters = [...new Set(milestones.map(row => row[2]))].map(category => {
  const section = node('div', '', 'category-meter');
  const track = node('span', '', 'animated-meter');
  const progress = node('progress');
  progress.setAttribute('aria-label', category + ' milestones complete');
  const fill = node('span', '', 'meter-fill');
  fill.setAttribute('aria-hidden', 'true');
  const count = node('small');
  track.append(progress, fill);
  section.append(node('span', category), track, count);
  $('category-meters').append(section);
  return { progress, count, ids: milestones.filter(row => row[2] === category).map(row => row[0]) };
});

function updateStats() {
  const next = milestones.find(([id]) => !completed.has(id));
  $('next').textContent = next ? next[3] : 'Roadmap complete';
  $('when').textContent = next ? when(next[1]) + ' · ' + displayDate.format(new Date(next[1])) : '';
  $('progress').textContent = completed.size + ' / ' + milestones.length + ' complete';
  setMeter($('bar'), completed.size, milestones.length);
  for (const { progress, count, ids } of categoryMeters) {
    const done = ids.filter(id => completed.has(id)).length;
    setMeter(progress, done, ids.length);
    count.textContent = done + ' / ' + ids.length;
  }
  $('percent').textContent = Math.round(completed.size * 100 / milestones.length) + '%';
  $('school-count').textContent = schools.length + (schools.length === 1 ? ' school' : ' schools');
}

function showTasks() {
  const search = $('query').value.trim().toLowerCase();
  const status = $('status').value;
  const rows = milestones.filter(([id, date, category, title, description]) =>
    (status === 'all' || completed.has(id) === (status === 'done')) &&
    (!$('year').value || date.startsWith($('year').value)) &&
    (!$('category').value || category === $('category').value) &&
    (title + ' ' + description).toLowerCase().includes(search));
  const visible = expanded ? rows : rows.slice(0, 8);
  $('tasks').replaceChildren(...visible.map(renderTask));
  if (!rows.length) $('tasks').append(node('p', 'No milestones match these filters.'));
  $('more').hidden = rows.length <= 8;
  $('more').textContent = expanded ? 'Show fewer' : 'Show all ' + rows.length + ' milestones';
}

function renderTask([id, date, category, title, description, source]) {
  const row = node('div', '', completed.has(id) ? 'task done' : 'task');
  const details = node('details');
  const line = node('div', '', 'task-line');
  const label = node('div', '', 'task-label');
  const box = node('input');
  box.type = 'checkbox';
  box.checked = completed.has(id);
  box.setAttribute('aria-label', 'Mark ' + title + ' complete');
  box.addEventListener('change', () => {
    if (box.checked) completed.add(id);
    else completed.delete(id);
    persist();
    updateStats();
    if ($('status').value === 'all') row.classList.toggle('done', box.checked);
    else { showTasks(); ($('tasks').querySelector('input') || $('status')).focus(); }
  });
  const summary = node('summary', title);
  label.append(box);
  const tag = node('span', category, 'tag');
  tag.dataset.type = category;
  const time = node('time', displayDate.format(new Date(date)), 'target');
  time.dateTime = date;
  line.append(label, tag, time);
  // The summary is the first direct child of details for native keyboard disclosure.
  details.append(summary);
  const detail = node('p', description);
  if (source) detail.append(' ', link(...sources[source]));
  details.append(detail);
  label.append(details);
  row.append(line);
  return row;
}

function showSchools() {
  $('school-list').replaceChildren(...schools.map(school => {
    const row = node('article', '', 'school');
    const info = node('div');
    info.append(node('h3', school.name), node('small', [school.course, school.stage].filter(Boolean).join(' · ')));
    const notes = [];
    if (school.date) notes.push(displayDate.format(new Date(school.date)) + ' · ' + when(school.date));
    if (school.cost !== '') notes.push('$' + Number(school.cost).toLocaleString('en-US') + '/yr est.');
    if (notes.length) info.append(node('div', notes.join(' • '), 'target'));
    const edit = node('button', 'Edit');
    edit.type = 'button';
    edit.setAttribute('aria-label', 'Edit ' + school.name);
    edit.addEventListener('click', () => openSchool(school));
    const actions = node('div', '', 'school-actions');
    if (school.url && school.url.startsWith('https://')) actions.append(link('Admissions', school.url));
    actions.append(edit);
    row.append(info, actions);
    return row;
  }));
  if (!schools.length) $('school-list').append(node('p', 'Add a school to start comparing options.'));
}

function openSchool(school) {
  selected = school;
  $('school-form').reset();
  $('form-title').textContent = school ? 'Edit school' : 'Add school';
  if (school) {
    for (const field of ['name', 'course', 'url', 'stage', 'cost', 'date']) {
      $('school-form').elements.namedItem(field).value = school[field];
    }
  }
  $('remove').hidden = !school;
  $('editor').showModal();
}

$('school-form').addEventListener('submit', event => {
  event.preventDefault();
  const fields = Object.fromEntries(new FormData(event.currentTarget));
  fields.name = fields.name.trim();
  if (!fields.name) { event.currentTarget.elements.namedItem('name').focus(); return; }
  const school = { ...fields, id: selected?.id || crypto.randomUUID() };
  schools = selected ? schools.map(item => item.id === school.id ? school : item) : [...schools, school];
  persist();
  $('editor').close();
  showSchools();
  updateStats();
  $('add').focus();
});
$('remove').addEventListener('click', () => {
  if (!selected) return;
  schools = schools.filter(school => school.id !== selected.id);
  persist();
  $('editor').close();
  showSchools();
  updateStats();
  $('add').focus();
});
$('cancel').addEventListener('click', () => $('editor').close());
$('add').addEventListener('click', () => openSchool());
$('more').addEventListener('click', () => { expanded = !expanded; showTasks(); });

for (const value of new Set(milestones.map(row => row[2]))) $('category').add(new Option(value, value));
for (const value of new Set(milestones.map(row => row[1].slice(0, 4)))) $('year').add(new Option(value, value));
for (const id of ['status', 'category', 'year', 'query']) {
  $(id).addEventListener(id === 'query' ? 'input' : 'change', () => { expanded = false; showTasks(); });
}

async function refreshSources() {
  let report;
  try {
    const response = await fetch('./source-status.json', { cache: 'no-store' });
    if (!response.ok) throw new Error(response.status);
    report = await response.json();
  } catch { /* The app can still show official links when previewed from disk. */ }

  const date = report?.checked ? displayDate.format(new Date(report.checked)) : '';
  $('monitor-status').textContent = date ? 'Last automated source check · ' + date : 'Automated source check unavailable in this preview.';
  $('source-list').replaceChildren(...Object.entries(sources).map(([id, [name, url]]) => {
    const status = report?.sources?.[id];
    const message = status?.error ? 'Check unavailable · open source'
      : status?.changed ? 'Page changed ' + displayDate.format(new Date(status.changed))
      : status?.hash ? 'Source reachable' : 'Open for latest policy';
    const row = node('div', '', 'source');
    row.append(link(name, url), node('small', message));
    return row;
  }));
}

showTasks();
showSchools();
updateStats();
refreshSources();
let renderedDay = new Date().toDateString();
function refreshDates() {
  const today = new Date().toDateString();
  if (today === renderedDay) return;
  renderedDay = today;
  updateStats();
  showSchools();
}

setInterval(refreshDates, 60_000);
setInterval(refreshSources, 900_000);
window.addEventListener('focus', () => { refreshDates(); refreshSources(); });

async function refreshHandicap() {
  try {
    const response = await fetch('./golf-handicap.json', { cache: 'no-store' });
    if (!response.ok) return;
    const { index, source, checked } = await response.json();
    if (!Number.isFinite(index) || Math.abs(index) > 54) return;
    const date = new Date(checked);
    const verified = source === 'RFEG' && Number.isFinite(date.getTime());
    const label = index < 0 ? '+' + Math.abs(index).toFixed(1) : index.toFixed(1);
    $('golf-handicap').textContent = label + ' handicap';
    $('golf-handicap-status').textContent = verified
      ? 'RFEG · Last checked ' + displayDate.format(date)
      : 'Self-reported';
  } catch { /* Keep the last displayed value when the snapshot is unavailable. */ }
}

refreshHandicap();
setInterval(refreshHandicap, 900_000);
window.addEventListener('focus', refreshHandicap);

function setupMotion() {
  const hero = document.querySelector('.hero');
  const ring = document.querySelector('.cursor-orbit');
  const backdrop = document.querySelector('.space-backdrop');
  const sceneWindows = [...document.querySelectorAll('.parallax-window')];
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  let frame = 0;
  let pointer = null;
  let cursor = null;
  let orbitX = 0;
  let orbitY = 0;
  let fieldX = 0;
  let fieldY = 0;

  const clampUnit = value => Math.max(0, Math.min(1, value));

  function requestFrame() {
    if (!frame && !reduceMotion.matches) frame = requestAnimationFrame(renderMotion);
  }

  function renderMotion() {
    frame = 0;
    if (reduceMotion.matches) return;

    const bounds = hero.getBoundingClientRect();
    const windowDepths = sceneWindows.map(pass => {
      const rect = pass.getBoundingClientRect();
      return clampUnit((innerHeight - rect.top) / (innerHeight + rect.height)) * 2 - 1;
    });
    for (const [index, pass] of sceneWindows.entries()) {
      pass.style.setProperty('--pass-scroll', (windowDepths[index] * 80).toFixed(2) + 'px');
    }
    const inside = pointer && pointer.x >= bounds.left && pointer.x <= bounds.right
      && pointer.y >= bounds.top && pointer.y <= bounds.bottom;
    const x = inside ? (pointer.x - bounds.left) / bounds.width : .85;
    const y = inside ? (pointer.y - bounds.top) / bounds.height : .52;
    const heroTravel = clampUnit(-bounds.top / (bounds.height || 1));
    const scrollOffset = heroTravel * bounds.height * .19;
    hero.style.setProperty('--grid-depth', (heroTravel * 55).toFixed(2) + 'px');
    const targetX = inside ? (x - .5) * 65 : 0;
    const targetY = scrollOffset + (inside ? (y - .5) * 48 : 0);
    orbitX += (targetX - orbitX) * .16;
    orbitY += (targetY - orbitY) * .16;
    hero.style.setProperty('--orbit-x', orbitX.toFixed(2) + 'px');
    hero.style.setProperty('--orbit-y', orbitY.toFixed(2) + 'px');
    hero.style.setProperty('--light-x', (x * 100).toFixed(1) + '%');
    hero.style.setProperty('--light-y', (y * 100).toFixed(1) + '%');
    hero.style.setProperty('--tilt-y', (orbitX * .28).toFixed(2) + 'deg');
    hero.style.setProperty('--tilt-x', ((orbitY - scrollOffset) * -.36).toFixed(2) + 'deg');

    const fieldTargetX = pointer ? (pointer.x / innerWidth - .5) * 34 : 0;
    const pageTravel = clampUnit(scrollY / (document.documentElement.scrollHeight - innerHeight || 1));
    const fieldTargetY = pageTravel * 205 + (pointer ? (pointer.y / innerHeight - .5) * 32 : 0);
    fieldX += (fieldTargetX - fieldX) * .12;
    fieldY += (fieldTargetY - fieldY) * .12;
    backdrop.style.setProperty('--field-x', fieldX.toFixed(2) + 'px');
    backdrop.style.setProperty('--field-y', fieldY.toFixed(2) + 'px');

    let cursorMoving = false;
    if (pointer) {
      cursor ||= { ...pointer };
      cursor.x += (pointer.x - cursor.x) * .19;
      cursor.y += (pointer.y - cursor.y) * .19;
      ring.style.setProperty('--cursor-x', cursor.x.toFixed(2) + 'px');
      ring.style.setProperty('--cursor-y', cursor.y.toFixed(2) + 'px');
      ring.classList.add('visible');
      cursorMoving = Math.hypot(pointer.x - cursor.x, pointer.y - cursor.y) > .25;
    }
    const orbitMoving = Math.hypot(targetX - orbitX, targetY - orbitY) > .2;
    const fieldMoving = Math.hypot(fieldTargetX - fieldX, fieldTargetY - fieldY) > .2;
    if (cursorMoving || orbitMoving || fieldMoving) requestFrame();
  }

  function clearPointer() {
    pointer = cursor = null;
    ring.classList.remove('visible');
    requestFrame();
  }

  window.addEventListener('pointermove', event => {
    if (reduceMotion.matches || !finePointer.matches || event.pointerType === 'touch') return;
    pointer = { x: event.clientX, y: event.clientY };
    requestFrame();
  }, { passive: true });
  document.documentElement.addEventListener('pointerleave', clearPointer);
  window.addEventListener('blur', clearPointer);
  window.addEventListener('scroll', requestFrame, { passive: true });
  window.addEventListener('resize', requestFrame, { passive: true });
  finePointer.addEventListener('change', clearPointer);
  reduceMotion.addEventListener('change', clearPointer);
  requestFrame();
}

setupMotion();
