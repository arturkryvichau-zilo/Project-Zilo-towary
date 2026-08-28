const fs = require('fs');
let fail = 0;
const eq = (n, got, want) => { const ok = String(got) === String(want); if (!ok) fail++;
  console.log((ok ? '  ok  ' : ' FAIL ') + n.padEnd(52) + got + (ok ? '' : `   (oczekiwano ${want})`)); };

function load(hash) {
  delete require.cache[require.resolve('./wyc-logic.js')];
  global.location = { hash: hash };
  global.parent = { postMessage() {} };
  global.DCLogic = class { setState(p) { const n = typeof p === 'function' ? p(this.state) : p; if (n) Object.assign(this.state, n); } };
  const C = require('./wyc-logic.js');
  return new C();
}
const QUOTE = { robociznas: [{ name: 'Wymiana oleju', person: 'Paweł Nowak', qty: '1', cena: '300,00', vat: '23', unit: 'Godzina' }], towars: [] };
const withState = '#state=' + encodeURIComponent(JSON.stringify(QUOTE));

console.log('— konfigurator otwarty z aplikacji (ze stanem w hashu) —');
const a = load(withState);
eq('pozycje z wyceny wczytane', a.state.robociznas.length, 1);
eq('nazwa z wyceny', a.state.robociznas[0].name, 'Wymiana oleju');
eq('extraFields nie gubi się', JSON.stringify(a.state.extraFields), '[]');
eq('valueMode nie gubi się', a.state.valueMode, 'netto');
eq('docPicked nie gubi się', JSON.stringify(a.state.docPicked), '[]');

console.log('\n— klik w „+ Rabat" —');
let v = a.renderVals();
eq('przed: kolumny ukryte', v.showRabat, false);
let err = null;
try { v.toggleRabat(); } catch (e) { err = e.message; }
eq('bez wyjątku', err || 'brak', 'brak');
v = a.renderVals();
eq('po: kolumny widoczne', v.showRabat, true);
eq('przycisk wciśnięty', v.rabatBg, '#E9E9FF');
eq('ikona X', /i-close/.test(v.rabatIcon) ? 'X' : 'plus', 'X');
eq('kolumna doszła do siatki', v.towGridStyle.match(/grid-template-columns:([^;]+)/)[1].trim().split(/\s+/).length, 10);
v.toggleRabat();
eq('drugi klik chowa', a.renderVals().showRabat, false);

console.log('\n— konfigurator otwarty bez stanu (podgląd samodzielny) —');
const b = load('');
eq('domyślne pozycje', b.state.robociznas.length, 1);
eq('extraFields', JSON.stringify(b.state.extraFields), '[]');
b.renderVals().toggleRabat();
eq('rabat działa', b.renderVals().showRabat, true);

console.log('\n— stan zapisany z włączonym rabatem wraca po ponownym otwarciu —');
const saved = Object.assign({}, QUOTE, { extraFields: ['rabat'] });
const c = load('#state=' + encodeURIComponent(JSON.stringify(saved)));
eq('rabat od razu włączony', c.renderVals().showRabat, true);

console.log('\n— tryb podglądu dalej działa —');
const d = load(withState + '&preview=1');
eq('mode', d.state.mode, 'preview');

console.log(fail ? `\n${fail} sprawdzen nie przechodzi` : '\nwszystkie sprawdzenia OK');
process.exit(fail ? 1 : 0);
