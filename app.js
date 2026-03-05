
let unit = 'metric';
let gender = 'male';

const CATS = [
  { max: 18.5,     label: 'Underweight',   color: '#5fa8ff', bg: 'rgba(95,168,255,0.13)'  },
  { max: 25,       label: 'Normal Weight', color: '#2effa0', bg: 'rgba(46,255,160,0.13)'  },
  { max: 30,       label: 'Overweight',    color: '#ffd84f', bg: 'rgba(255,216,79,0.13)'  },
  { max: Infinity, label: 'Obese',         color: '#ff5f5f', bg: 'rgba(255,95,95,0.13)'   },
];

const getCat  = bmi => CATS.find(c => bmi < c.max);
const toPerc  = bmi => Math.min(97, Math.max(2, ((bmi - 10) / 35) * 100));
const STORAGE = 'bmi';

/* 
   LOCAL STORAGE
 */
function getList() {
  try { return JSON.parse(localStorage.getItem(STORAGE)) || []; }
  catch { return []; }
}

function setList(list) {
  localStorage.setItem(STORAGE, JSON.stringify(list));
  countHistory();
}

function countHistory() {
  document.getElementById('h-count').textContent = getList().length;
}

/*
   UNIT & GENDER TOGGLES
 */
function setUnit(u) {
  unit = u;
  document.getElementById('metric-fields').style.display   = u === 'metric'  ? 'block' : 'none';
  document.getElementById('imperial-fields').style.display = u === 'imperial' ? 'block' : 'none';
  document.getElementById('unit-seg').querySelectorAll('.seg-btn').forEach((b, i) =>
    b.classList.toggle('active', (i === 0) === (u === 'metric'))
  );
  document.getElementById('result').style.display = 'none';
  document.getElementById('save-banner').style.display = 'none';
}

function setGender(g) {
  gender = g;
  document.getElementById('btn-m').classList.toggle('active', g === 'male');
  document.getElementById('btn-f').classList.toggle('active', g === 'female');
}

/* 
   ANIMATE NUMBER
 */
function animCount(el, to, dec = 2, dur = 900) {
  const from = parseFloat(el.textContent) || 0;
  const run = ts => {
    if (!run.t) run.t = ts;
    const p = Math.min((ts - run.t) / dur, 1);
    const ease = 1 - Math.pow(1 - p, 4);
    el.textContent = (from + (to - from) * ease).toFixed(dec);
    if (p < 1) requestAnimationFrame(run);
    else el.textContent = to.toFixed(dec);
  };
   el.textContent = to.toFixed(dec)
//   requestAnimationFrame(run);
}

/* 
   CALCULATE
 */
function calculate() {
  const err = document.getElementById('err');
  err.style.display = 'none';

  let hM, hCm, wKg;

  if (unit === 'metric') {
    const h = parseFloat(document.getElementById('m-height').value);
    const w = parseFloat(document.getElementById('m-weight').value);
    if (!h || !w || h < 50 || h > 300 || w < 1 || w > 700) {
      err.style.display = 'block';
      return;
    }
    hCm = h; hM = h / 100; wKg = w;
  } else {
    const ft   = parseFloat(document.getElementById('i-ft').value) || 0;
    const inch = parseFloat(document.getElementById('i-in').value) || 0;
    const lbs  = parseFloat(document.getElementById('i-lbs').value);
    if (!lbs || (ft === 0 && inch === 0)) {
      err.style.display = 'block';
      return;
    }
    hCm = ((ft * 12) + inch) * 2.54;
    hM  = hCm / 100;
    wKg = lbs * 0.453592;
  }

  const age  = parseInt(document.getElementById('age').value) || 30;
  const name = document.getElementById('name').value.trim() || 'Anonymous';
  const bmi  = wKg / (hM * hM);
  const cat  = getCat(bmi);

  /* ── Save to localStorage ── */
  const record = {
    id:     Date.now(),
    name,
    bmi,
    cat:    cat.label,
    age,
    gender,
    date:   new Date().toLocaleDateString()
  };
  const list = getList();
  list.unshift(record);
  setList(list);

  /*  Show result panel  */
  const res = document.getElementById('result');
  res.style.display = 'block';
  res.style.animation = 'none';
  void res.offsetWidth;
  res.style.animation = 'fadeIn 0.35s ease';

  /*  Confirmation banner  */
  document.getElementById('save-banner').style.display = 'flex';
  document.getElementById('sb-text').textContent = '✅ Saved for ' + name;
  document.getElementById('sb-sub').textContent  = 'BMI: ' + bmi.toFixed(1) + '  ' + cat.label + '  Stored in History';

  /*  Animated BMI number  */
  animCount(document.getElementById('bmi-num'), bmi);

  /*  Category label  */
  const catEl = document.getElementById('bmi-cat');
  catEl.textContent = cat.label;
  catEl.style.color = cat.color;

  /*  Badge  */
  const badge = document.getElementById('bmi-badge');
  badge.textContent       = cat.label;
  badge.style.background  = cat.bg;
  badge.style.color       = cat.color;

  /*  Scale dot  */
  setTimeout(() => {
    const dot = document.getElementById('dot');
    dot.style.left = toPerc(bmi) + '%';
    dot.style.setProperty('--dot-color', cat.color);
  }, 80);
}

/* 
   RESET
 */
function resetForm() {
  ['m-height', 'm-weight', 'i-ft', 'i-in', 'i-lbs', 'age', 'name'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  document.getElementById('result').style.display      = 'none';
  document.getElementById('save-banner').style.display = 'none';
  document.getElementById('err').style.display         = 'none';

  setUnit('metric');
  setGender('male');
}

/* 
   HISTORY — DELETE / CLEAR
 */
function deleteRecord(id) {
  setList(getList().filter(r => r.id !== id));
  renderModal();
}

function clearAll() {
  if (!confirm('Delete all BMI history records?')) return;
  localStorage.removeItem(STORAGE);
  countHistory();
  renderModal();
}

/* 
   MODAL
 */
function openModal() {
  renderModal();
  document.getElementById('modal-overlay').classList.add('open');
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('open');
}

function overlayClick(e) {
  if (e.target === document.getElementById('modal-overlay')) closeModal();
}

function renderModal() {
  const list = getList();
  const body = document.getElementById('modal-body');
  const count = list.length;

  document.getElementById('modal-count').textContent = count
    ? ' ' + count + ' record' + (count > 1 ? 's' : '')
    : '';



  body.innerHTML = list.map(r => {
    const c = CATS.find(x => x.label === r.cat) || CATS[CATS.length - 1];
    const initials = r.name.split(' ').map(w => w[0] || '').join('').toUpperCase().slice(0, 2) || '?';
    return (
      '<div class="h-item">' +
        '<div class="h-avatar" style="background:' + c.bg + ';color:' + c.color + '">' + initials + '</div>' +
        '<div class="h-info">' +
          '<div class="h-name">' + r.name + '</div>' +
          '<div class="h-meta">' + r.age + ' yrs · ' + r.gender + ' · ' + r.date + '</div>' +
        '</div>' +
        '<div class="h-right">' +
          '<div class="h-bmi" style="color:' + c.color + '">' + r.bmi.toFixed(1) + '</div>' +
          '<div class="h-cat" style="color:' + c.color + '">' + r.cat + '</div>' +
        '</div>' +
        '<button class="h-del" onclick="deleteRecord(' + r.id + ')" title="Remove">✕</button>' +
      '</div>'
    );
  }).join('');
}

/* 
   INIT
 */
countHistory();
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});
