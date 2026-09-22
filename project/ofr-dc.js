class Component extends DCLogic {
  static USLUGA_UNITS = ['Sztuka', 'Godzina'];
  static TOWAR_UNITS = ['Sztuka', 'Gramy', 'Litry'];
  static VATS = ['23', '8', '5', '0'];
  static CC = ['PL', 'DE', 'CZ', 'SK', 'UA'];

  static payload() {
    try {
      const m = (location.hash || '').match(/[#&]offer=([^&]*)/);
      if (m) return JSON.parse(decodeURIComponent(m[1]));
    } catch (e) {}
    return {};
  }

  static num(t) {
    const n = parseFloat(String(t == null ? '' : t).replace(/\s/g, '').replace(/[^0-9,.-]/g, '').replace(',', '.'));
    return isNaN(n) ? 0 : n;
  }

  static fmt(n) {
    return (Math.round(n * 100) / 100).toFixed(2).replace('.', ',');
  }

  static money(n) {
    return Component.fmt(n).replace(/\B(?=(\d{3})+(?!\d)(?=,))/g, ' ') + ' zł';
  }

  // ── Rabat — rdzeń przeniesiony z konfiguratora wycen (RABATY-SPEC §3) ──
  // Kwoty w GROSZACH, cena jednostkowa w jednostkach 1/10000 zł (cztery miejsca),
  // bo cena liczona wstecz z wartości nie mieści się w groszu (104,07 / 12 = 8,6725).
  static U = 10000;

static u(v) { return Math.round(Component.num(v) * Component.U); }

static uOf(r, field) {
    const key = field === 'koszt' ? 'kosztU' : 'cenaU';
    return r[key] != null ? r[key] : Component.u(r[field]);
  }

static fmtU(units) {
    // równe grosze pokazujemy z dwoma miejscami, ułamek grosza z czterema
    return units % 100 === 0
      ? Component.fmt(units / Component.U)
      : String(units / Component.U).replace('.', ',');
  }

static baseFromU(qty, units) { return Math.round(Component.num(qty) * units / 100); }

static rowKey(collection, r) { return (collection === 'towary' ? 't:' : 'u:') + r.id; }

static tagRows(list, collection) {
    return (list || []).map((r) => Object.assign({}, r, { _k: Component.rowKey(collection, r) }));
  }

static allRows(state) {
    return Component.tagRows(state.uslugi, 'uslugi').concat(Component.tagRows(state.towary, 'towary'));
  }

static rowsInScope(state, scope) {
    if (scope === 'uslugi') return Component.tagRows(state.uslugi, 'uslugi');
    if (scope === 'towary') return Component.tagRows(state.towary, 'towary');
    return Component.allRows(state);
  }

static scopeBase(state, scope) {
    return Component.rowsInScope(state, scope).reduce((a, r) => a + Component.rowBase(r), 0);
  }

static scopeGross(state, scope) {
    return Component.rowsInScope(state, scope).reduce((a, r) => a + Component.rowGross(r), 0);
  }

static grossToNetInScope(state, scope, gross) {
    const base = Component.scopeBase(state, scope);
    const bg = Component.scopeGross(state, scope);
    return bg > 0 ? Math.round(gross * base / bg) : 0;
  }

static discountAmount(state, d) {
    const base = Component.scopeBase(state, d ? d.scope : 'all');
    if (!d) return { amount: 0, clamped: false, base: base };
    if (d.mode === 'pct') {
      // procent jest identyczny w netto i brutto — liczymy od netto
      return { amount: Math.round(base * Component.num(d.value) / 100), clamped: false, base: base };
    }
    let want = Component.gr(d.value);
    if (d.unit === 'gross') {
      const bg = Component.scopeGross(state, d.scope);
      const clamped = want > bg;
      want = Component.grossToNetInScope(state, d.scope, Math.min(want, bg));
      return { amount: Math.min(want, base), clamped: clamped, base: base };
    }
    return { amount: Math.min(want, base), clamped: want > base, base: base };
  }

static distribute(R, rows) {
    const out = {};
    const base = rows.reduce((s, r) => s + Component.rowBase(r), 0);
    rows.forEach((r) => { out[r._k] = 0; });
    if (base <= 0 || R <= 0) return out;

    let rest = R;
    const parts = [];
    rows.forEach((r) => {
      const exact = R * Component.rowBase(r) / base;
      const fl = Math.floor(exact);
      out[r._k] = fl;
      rest -= fl;
      parts.push({ id: r._k, frac: exact - fl, base: Component.rowBase(r) });
    });
    parts.sort((a, b) => (b.frac - a.frac) || (b.base - a.base));
    for (let i = 0; i < rest; i += 1) out[parts[i % parts.length].id] += 1;
    return out;
  }

static computeQuote(state, override) {
    const d = override !== undefined ? override : state.discount;
    const rows = Component.allRows(state);
    const per = {};
    rows.forEach((r) => {
      per[r._k] = r.manual == null ? 0 : Math.min(r.manual, Component.rowBase(r));
    });

    const info = { amount: 0, clamped: false, base: 0, custom: !!(d && d.custom), splitSum: 0 };
    if (d) {
      if (!d.custom) {
        const calc = Component.discountAmount(state, d);
        info.amount = calc.amount; info.clamped = calc.clamped; info.base = calc.base;
        const inScope = Component.rowsInScope(state, d.scope);
        const split = Component.distribute(calc.amount, inScope);
        inScope.forEach((r) => { per[r._k] += split[r._k]; });
        info.splitSum = inScope.reduce((a, r) => a + split[r._k], 0);
      } else {
        info.base = Component.scopeBase(state, d.scope);
        info.amount = Component.rowsInScope(state, d.scope).reduce((a, r) => a + per[r._k], 0);
        info.splitSum = info.amount;
      }
    }

    const before = rows.reduce((a, r) => a + Component.rowBase(r), 0);
    const beforeGross = rows.reduce((a, r) => a + Component.rowGross(r), 0);
    const disc = rows.reduce((a, r) => a + per[r._k], 0);
    const net = before - disc;
    const vat = rows.reduce((a, r) => {
      const rowNet = Component.rowBase(r) - per[r._k];
      return a + Math.round(rowNet * Component.rowVat(r) / 100);
    }, 0);
    return { per: per, before: before, beforeGross: beforeGross, disc: disc, net: net, vat: vat, gross: net + vat, info: info };
  }

static grFmt(gr) { return Component.fmt(gr / 100); }

static migrateRabat(st) {
    if (!st || st.discount) return st;
    const all = (st.uslugi || []).concat(st.towary || []);
    const any = all.some((r) => r && r.rabat != null && Component.num(r.rabat) > 0);
    if (!any) {
      all.forEach((r) => { if (r) delete r.rabat; });
      return st;
    }
    let sum = 0;
    const conv = (list) => (list || []).map((r) => {
      const pct = Component.num(r.rabat);
      const manual = pct > 0 ? Math.round(Component.rowBase(r) * pct / 100) : 0;
      sum += manual;
      const out = Object.assign({}, r, { manual: manual });
      delete out.rabat;
      return out;
    });
    st.uslugi = conv(st.uslugi);
    st.towary = conv(st.towary);
    st.discount = { scope: 'all', mode: 'amt', unit: 'net', value: sum / 100, custom: true, origin: null };
    return st;
  }

static gr(v) { return Math.round(Component.num(v) * 100); }

static rowBase(r) {
    return Component.baseFromU(r.qty, Component.uOf(r));
  }

static rowVat(r) { return Component.num(r.vat); }

static rowGross(r) {
    return Component.rowBase(r) + Math.round(Component.rowBase(r) * Component.rowVat(r) / 100);
  }

static reunit(state, draft, unit) {
    if (!draft || draft.mode !== 'amt' || draft.unit === unit) return draft ? draft.value : '';
    const net = Component.draftNet(state, draft);
    if (net == null) return draft.value;
    const bg = Component.scopeGross(state, draft.scope);
    const bn = Component.scopeBase(state, draft.scope);
    const out = unit === 'gross' ? (bn > 0 ? Math.round(net * bg / bn) : 0) : net;
    return Component.grFmt(out);
  }
static draftNet(state, draft) {
    const v = Component.num(draft.value);
    if (!draft.value || String(draft.value).trim() === '' || v <= 0) return null;
    if (draft.mode === 'pct') {
      if (v > 100) return null;
      return Math.round(Component.scopeBase(state, draft.scope) * v / 100);
    }
    const w = Component.gr(draft.value);
    return draft.unit === 'gross' ? Component.grossToNetInScope(state, draft.scope, w) : w;
  }


  // zdarzenia idą do PostHoga rodzica — konfigurator siedzi w iframie bez własnego
  discountTrack(name, props) {
    try {
      const ph = (window.parent && window.parent.posthog) || window.posthog;
      if (ph && ph.capture) ph.capture(name, Object.assign({ platform: 'prototype' }, props));
    } catch (e) {}
  }

  // walidacja pola kwoty w modalu — komunikat i blokada zapisu z jednej decyzji
  discountValidate(draft) {
    const st = this.state;
    const base = Component.scopeBase(st, draft.scope);
    const baseGross = Component.scopeGross(st, draft.scope);
    const raw = String(draft.value == null ? '' : draft.value).trim();
    if (raw === '') return { ok: false, silent: true, base: base };
    if (!/^\d*[.,]?\d*$/.test(raw)) return { ok: false, msg: 'Wpisz liczbę — dozwolone są cyfry i przecinek.', base: base };
    const v = Component.num(raw);
    if (v <= 0) return { ok: false, msg: 'Rabat musi być większy od zera.', base: base };
    if (draft.mode === 'pct') {
      if (v > 100) return { ok: false, msg: 'Rabat nie może być większy niż 100%.', base: base };
      return { ok: true, amount: Math.round(base * v / 100), base: base };
    }
    const want = Component.gr(raw);
    const limit = draft.unit === 'gross' ? baseGross : base;
    if (want > limit) {
      return { ok: false, base: base,
        msg: 'Rabat nie może być większy niż wartość zakresu (' + Component.grFmt(limit) + ' zł).' };
    }
    return { ok: true, amount: Component.draftNet(st, draft), base: base };
  }

  discountVals(calc) {
    const st = this.state;
    const d = st.discount;
    const draft = st.discountDraft;
    const isBrutto = st.valueMode === 'brutto';
    const scopeLabel = { all: 'Wszystko', uslugi: 'Usługi', towary: 'Towary' };
    const show = (netGr) => Component.grFmt(isBrutto
      ? netGr + Math.round(netGr * 0)   // kwoty brutto liczymy wprost niżej
      : netGr);

    // ── podsumowanie ──
    const beforeShown = isBrutto ? calc.beforeGross : calc.before;
    const discShown = isBrutto ? (calc.beforeGross - calc.gross) : calc.disc;

    // Etykieta rabatu kwotowego nie powtarza liczby: wpisane 100,00 zł brutto
    // przy mieszanym VAT schodzi jako 100,01 i dwie kwoty obok siebie wyglądały
    // jak błąd. Kwota jest jedna — ta policzona, obok chipa (§4.2).
    const label = (() => {
      if (!d) return '';
      if (d.custom || d.mode === 'amt') return 'Rabat kwotowy · ' + scopeLabel[d.scope];
      return 'Rabat ' + Component.fmt(Component.num(d.value)).replace(',00', '') + '%'
        + ' · ' + scopeLabel[d.scope];
    })();

    const originLabel = d && d.origin
      ? (d.origin.mode === 'pct'
        ? Component.fmt(Component.num(d.origin.value)).replace(',00', '') + '%'
        : Component.grFmt(Component.gr(d.origin.value)) + ' zł')
      : '';

    // ── modal ──
    const res = draft ? this.discountValidate(draft) : { ok: false };
    const preview = draft
      ? Component.computeQuote(
        Object.assign({}, st, { uslugi: (st.uslugi || []).map((r) => Object.assign({}, r, { manual: null })),
          towary: (st.towary || []).map((r) => Object.assign({}, r, { manual: null })) }),
        res.ok ? { scope: draft.scope, mode: draft.mode, value: draft.value, unit: draft.unit, custom: false } : null
      )
      : null;
    const unitNet = !draft || draft.unit === 'net';

    return {
      on: !!d,
      off: !d,
      label: label,
      beforeLabel: isBrutto ? 'Suma brutto przed rabatem:' : 'Suma netto przed rabatem:',
      beforeDisplay: Component.grFmt(beforeShown),
      amountDisplay: Component.grFmt(discShown),
      clamped: !!(d && calc.info.clamped),
      clampedText: 'Rabat przycięty do wartości zakresu (' + Component.grFmt(calc.info.base) + ' zł). Pozycje zmieniły się po nadaniu rabatu.',
      isCustom: !!(d && d.custom && d.origin),
      backLabel: 'Wróć do ' + originLabel,
      restore: () => this.discountRestore(),
      add: () => this.openDiscount(false),
      edit: () => this.openDiscount(true),
      remove: () => this.discountRemove(),

      open: !!draft,
      keys: (e) => {
        if (!this.state.discountDraft) return;
        if (e.key === 'Enter') {
          e.preventDefault();
          if (this.discountValidate(this.state.discountDraft).ok) this.discountSave();
          return;
        }
        if (e.key === 'Escape') {
          e.preventDefault();
          e.stopPropagation();          // inaczej ESC zamyka cały konfigurator
          this.setState({ discountDraft: null });
        }
      },
      isEdit: !!(draft && draft.editing),
      title: draft && draft.editing ? 'Edytuj rabat' : 'Rabat',
      segNetto: unitNet ? 'true' : 'false',
      segBrutto: unitNet ? 'false' : 'true',
      pickNettoMode: () => this.switchValueMode('netto'),
      pickBruttoMode: () => this.switchValueMode('brutto'),
      scopes: ['all', 'uslugi', 'towary'].map((k) => {
        const base = unitNet ? Component.scopeBase(st, k) : Component.scopeGross(st, k);
        return {
          key: k,
          label: scopeLabel[k],
          baseDisplay: Component.grFmt(base) + ' zł',
          selected: !!draft && draft.scope === k,
          disabled: Component.scopeBase(st, k) <= 0,
          bg: draft && draft.scope === k ? 'var(--zilo-blue-5)' : 'var(--tk-surface)',
          border: draft && draft.scope === k ? 'var(--zilo-blue-1)' : 'var(--grey-4)',
          opacity: Component.scopeBase(st, k) <= 0 ? '0.45' : '1',
          cursor: Component.scopeBase(st, k) <= 0 ? 'not-allowed' : 'pointer',
          pick: () => {
            if (Component.scopeBase(this.state, k) <= 0) return;
            this.setState((x) => ({ discountDraft: Object.assign({}, x.discountDraft, { scope: k }) }));
          },
        };
      }),
      isPercent: !!draft && draft.mode === 'pct',
      segPercent: draft && draft.mode === 'pct' ? 'true' : 'false',
      segAmount: draft && draft.mode === 'amt' ? 'true' : 'false',
      pickPercent: () => this.discountMode('pct'),
      pickAmount: () => this.discountMode('amt'),
      value: draft ? draft.value : '',
      setValue: (e) => {
        const v = e.target.value;
        this.setState((x) => ({ discountDraft: Object.assign({}, x.discountDraft, { value: v }) }));
      },
      fieldLabel: draft && draft.mode === 'pct'
        ? 'Rabat (%)'
        : ('Rabat ' + (unitNet ? 'netto' : 'brutto') + ' (zł)'),
      quick: (draft && draft.mode === 'pct' ? ['5', '10', '15', '20', '25', '30'] : ['50', '100', '200', '500'])
        .map((v) => ({
          label: draft && draft.mode === 'pct' ? v + '%' : v + ' zł',
          selected: !!draft && String(draft.value) === v,
          bg: draft && String(draft.value) === v ? 'var(--zilo-primary)' : 'var(--tk-surface)',
          color: draft && String(draft.value) === v ? 'var(--tk-on-fill)' : 'var(--grey-2)',
          border: draft && String(draft.value) === v ? 'var(--zilo-primary)' : 'var(--grey-4)',
          pick: () => this.setState((x) => ({ discountDraft: Object.assign({}, x.discountDraft, { value: v }) })),
        })),
      hasError: !!(draft && !res.ok && !res.silent),
      errorText: res.msg || '',
      previewAmount: preview
        ? Component.grFmt(unitNet ? preview.disc : (preview.beforeGross - preview.gross))
        : '0,00',
      previewTotalLabel: unitNet ? 'Suma netto po rabacie' : 'Suma brutto po rabacie',
      previewTotal: preview ? Component.grFmt(unitNet ? preview.net : preview.gross) : '0,00',
      canSave: !!res.ok,
      saveOpacity: res.ok ? '1' : '0.5',
      saveCursor: res.ok ? 'pointer' : 'not-allowed',
      saveEvents: res.ok ? 'auto' : 'none',
      saveLabel: draft && draft.editing ? 'Zapisz' : 'Dodaj rabat',
      cancel: () => this.setState({ discountDraft: null }),
      save: () => this.discountSave(),
      removeFromModal: () => { this.setState({ discountDraft: null }); this.discountRemove('modal'); },

      // toast po usunięciu
      toastOpen: !!st.discountToast,
      toastText: 'Rabat usunięty.',
      undo: () => this.discountUndo(),
    };
  }

  discountMode(mode) {
    this.setState((st) => {
      const dr = st.discountDraft;
      if (!dr || dr.mode === mode) return {};
      const net = Component.draftNet(st, dr);
      let value = '';
      if (net != null) {
        if (mode === 'pct') {
          const base = Component.scopeBase(st, dr.scope);
          value = base > 0 ? String((net / base * 100).toFixed(2)).replace(/\.?0+$/, '').replace('.', ',') : '';
        } else {
          const bg = Component.scopeGross(st, dr.scope);
          const bn = Component.scopeBase(st, dr.scope);
          value = Component.grFmt(dr.unit === 'gross' && bn > 0 ? Math.round(net * bg / bn) : net);
        }
      }
      return { discountDraft: Object.assign({}, dr, { mode: mode, value: value }) };
    });
  }

  openDiscount(isEdit) {
    const st = this.state;
    this.focusDiscountAmount();
    const unit = st.valueMode === 'brutto' ? 'gross' : 'net';
    const base = (scope) => Component.scopeBase(st, scope);
    if (!isEdit || !st.discount) {
      let scope = st.discountScopeLast || 'all';
      if (base(scope) <= 0) scope = ['all', 'uslugi', 'towary'].filter((k) => base(k) > 0)[0] || 'all';
      this.setState({ discountDraft: { scope: scope, mode: 'pct', value: '', unit: unit, editing: false } });
      return;
    }
    const d = st.discount;
    if (d.custom) {
      // rabat rozpisany kwotami — wracamy do niego w zł, z realną kwotą
      const amount = Component.computeQuote(st).info.amount;
      const bg = Component.scopeGross(st, d.scope);
      const bn = Component.scopeBase(st, d.scope);
      const shown = unit === 'gross' && bn > 0 ? Math.round(amount * bg / bn) : amount;
      this.setState({ discountDraft: { scope: d.scope, mode: 'amt', unit: unit, value: Component.grFmt(shown), editing: true } });
      return;
    }
    const draft = { scope: d.scope, mode: d.mode, unit: unit, value: String(d.value).replace('.', ','), editing: true };
    if (d.mode === 'amt' && d.unit !== unit) draft.value = Component.reunit(st, { mode: 'amt', unit: d.unit, value: d.value, scope: d.scope }, unit);
    this.setState({ discountDraft: draft });
  }

  discountSave() {
    const st = this.state;
    const dr = st.discountDraft;
    if (!dr) return;
    const res = this.discountValidate(dr);
    if (!res.ok) return;
    const next = { scope: dr.scope, mode: dr.mode, value: Component.num(dr.value), unit: dr.unit, custom: false, origin: null };
    const prev = st.discount;
    const changed = prev ? ['scope', 'mode', 'value', 'unit'].filter((k) => String(prev[k]) !== String(next[k])) : null;
    this.discountTrack(dr.editing ? 'quote_discount_edited' : 'quote_discount_added', Object.assign({
      scope: next.scope, type: next.mode === 'pct' ? 'percent' : 'amount', value: next.value,
    }, dr.editing ? { changed: changed } : { base_net: res.base / 100, discount_net: res.amount / 100 }));
    // zapis kasuje ręczne kwoty — rabat znów liczy się z intencji
    this.setState((x) => ({
      discount: next,
      discountDraft: null,
      discountScopeLast: next.scope,
      uslugi: (x.uslugi || []).map((r) => Object.assign({}, r, { manual: null, manualG: null })),
      towary: (x.towary || []).map((r) => Object.assign({}, r, { manual: null, manualG: null })),
    }));
  }

  discountRemove(source) {
    const st = this.state;
    if (!st.discount) return;
    this.discountTrack('quote_discount_removed', { scope: st.discount.scope, source: source || 'row_x' });
    const snapshot = {
      discount: st.discount,
      manual: Component.allRows(st).map((r) => ({ k: r._k, m: r.manual == null ? null : r.manual, g: r.manualG == null ? null : r.manualG })),
    };
    // usunięcie kasuje też ręczne kwoty — inaczej kolumna znika, a rabat dalej się liczy
    this.setState((x) => ({
      discount: null,
      discountDraft: null,
      discountUndo: snapshot,
      discountToast: true,
      uslugi: (x.uslugi || []).map((r) => Object.assign({}, r, { manual: null, manualG: null })),
      towary: (x.towary || []).map((r) => Object.assign({}, r, { manual: null, manualG: null })),
    }));
    if (this.__discToast) clearTimeout(this.__discToast);
    this.__discToast = setTimeout(() => this.setState({ discountToast: false, discountUndo: null }), 7000);
  }

  discountUndo() {
    const snap = this.state.discountUndo;
    if (!snap) return;
    const back = (list, coll) => (list || []).map((r) => {
      const hit = snap.manual.filter((x) => x.k === Component.rowKey(coll, r))[0];
      return Object.assign({}, r, { manual: hit ? hit.m : null, manualG: hit ? hit.g : null });
    });
    if (this.__discToast) clearTimeout(this.__discToast);
    this.setState((x) => ({
      discount: snap.discount,
      discountUndo: null,
      discountToast: false,
      uslugi: back(x.uslugi, 'uslugi'),
      towary: back(x.towary, 'towary'),
    }));
  }

  discountRestore() {
    const d = this.state.discount;
    if (!d || !d.origin) return;
    this.setState((x) => ({
      discount: Object.assign({}, d.origin, { custom: false, origin: null }),
      uslugi: (x.uslugi || []).map((r) => Object.assign({}, r, { manual: null, manualG: null })),
      towary: (x.towary || []).map((r) => Object.assign({}, r, { manual: null, manualG: null })),
    }));
  }

  // pierwsza ręczna zmiana przy pozycji „zamraża" rabat: z % robi się zestaw kwot
  discountGoCustom(collection, rowId) {
    const st = this.state;
    const d = st.discount;
    if (!d) return;
    const calc = Component.computeQuote(st);
    const key = Component.rowKey(collection, { id: rowId });
    const outOfScope = Component.rowsInScope(st, d.scope).filter((r) => r._k === key).length === 0;
    const scope = outOfScope ? 'all' : d.scope;
    const freeze = (list, coll) => (list || []).map((r) => {
      if (r.manual != null) return r;
      const inNew = scope === 'all'
        || (scope === 'uslugi' && coll === 'uslugi')
        || (scope === 'towary' && coll === 'towary');
      return Object.assign({}, r, { manual: inNew ? (calc.per[Component.rowKey(coll, r)] || 0) : null, manualG: null });
    });
    if (d.custom && !outOfScope) return;
    this.setState((x) => ({
      discount: Object.assign({}, d, {
        custom: true,
        scope: scope,
        origin: d.origin || { mode: d.mode, value: d.value, unit: d.unit, scope: d.scope },
      }),
      uslugi: freeze(x.uslugi, 'uslugi'),
      towary: freeze(x.towary, 'towary'),
    }));
  }

  // wpis w polu rabatu przy pozycji: waliduje, przełącza rabat w tryb kwotowy,
  // a edycja pozycji spoza zakresu rozszerza rabat na całą wycenę
  setRowDiscount(collection, id, raw) {
    const st = this.state;
    const row = (st[collection] || []).filter((r) => r.id === id)[0];
    if (!row || !st.discount) return;
    const errs = Object.assign({}, st.rowErrors || {});
    const key = Component.rowKey(collection, { id: id }) + ':disc';
    const isBrutto = st.valueMode === 'brutto';
    const txt = String(raw == null ? '' : raw).trim();

    this.discountGoCustom(collection, id);

    if (txt === '') {
      delete errs[key];
      this.setState({ rowErrors: errs });
      this.patch(collection, id, { manual: 0, manualG: null, rabatEditing: '' });
      return;
    }
    if (!/^\d*[.,]?\d*$/.test(txt)) {
      errs[key] = 'Tylko cyfry i przecinek.';
      this.setState({ rowErrors: errs });
      return;
    }
    let net = Component.gr(txt);
    if (isBrutto) net = Math.round(net * 100 / (100 + Component.rowVat(row)));
    const base = Component.rowBase(row);
    if (net > base) {
      errs[key] = 'Maksymalnie ' + Component.grFmt(isBrutto ? Component.rowGross(row) : base) + ' zł.';
      this.setState({ rowErrors: errs });
      this.patch(collection, id, { rabatEditing: txt });
      return;
    }
    delete errs[key];
    this.setState({ rowErrors: errs });
    // 5,00 zł brutto to 4,07 netto, a z powrotem 5,01 — pamiętamy, co wpisano,
    // żeby pole nie „poprawiało" mechanikowi kwoty po przeliczeniu
    this.patch(collection, id, { manual: net, manualG: isBrutto ? Component.gr(txt) : null, rabatEditing: txt });
  }

  focusDiscountAmount() {
    let tries = 0;
    const go = () => {
      const el = typeof document !== 'undefined' && document.querySelector('[data-disc-amount]');
      if (el) { el.focus(); try { el.select(); } catch (_) {} return; }
      if (tries++ < 10) setTimeout(go, 30);
    };
    setTimeout(go, 0);
  }

  // rabat kwotowy jest w netto, więc przełącznik netto/brutto go nie dotyka
  switchValueMode(mode) {
    this.setState({ valueMode: mode });
    // modal idzie za wyceną w obie strony
    if (this.state.discountDraft) {
      this.setState((st) => ({
        discountDraft: Object.assign({}, st.discountDraft, {
          unit: mode === 'brutto' ? 'gross' : 'net',
          value: Component.reunit(st, st.discountDraft, mode === 'brutto' ? 'gross' : 'net'),
        }),
      }));
    }
  }


  static mkRow(id, seed, withProducent) {
    const r = seed || {};
    const row = {
      id: id,
      name: r.name || '',
      unit: r.unit || 'Sztuka',
      qty: r.qty || '1',
      cena: r.cena || '0,00',
      cenaU: r.cenaU != null ? r.cenaU : Component.u(r.cena || '0,00'),
      vat: r.vat || '23',
      manual: r.manual != null ? r.manual : null,   // kwota rabatu pozycji w groszach
      manualG: null,                                 // kwota wpisana w brutto (pamięć)
      rabatEditing: null,
      cenaEditing: null,
      bruttoEdit: null,
      nettoEdit: null,
    };
    if (withProducent) row.producent = r.producent || '';
    return row;
  }

  static seedRows(list, withProducent, startId) {
    const src = Array.isArray(list) && list.length ? list : [null];
    return src.map((r, i) => Component.mkRow(startId + i, r, withProducent));
  }

  state = (() => {
    const p = Component.payload();
    const c = p.client || {};
    const uslugi = Component.seedRows(p.uslugi, false, 1);
    const towary = Component.seedRows(p.towary, true, 1);
    return Component.applyPick({
      cc: 'PL',
      valueMode: 'netto',
      discount: null,
      discountDraft: null,
      discountUndo: null,
      discountToast: false,
      discountScopeLast: 'all',
      rowErrors: {},
      phone: c.phone || '',
      cname: c.name || '',
      cmail: c.email || '',
      sms: true,
      mail: true,
      uslugi: uslugi,
      towary: towary,
      docPickerOpen: false,
      docQuery: '',
      docPicked: [],
      docOpenMap: null,
      docDayMap: null,
      nextU: uslugi.length + 1,
      nextT: towary.length + 1,
      notatka: p.notatka || '',
      komentarz: p.komentarz || '',
    });
  })();

  calc(r, discGr) {
    const base = Component.rowBase(r);
    const cut = Math.min(discGr || 0, base);
    const net = base - cut;
    const vat = Math.round(net * Component.rowVat(r) / 100);
    return { net: net / 100, gross: (net + vat) / 100, vat: vat / 100, rabat: cut / 100, netGr: net, cutGr: cut };
  }

  // jedno przeliczenie na render — z niego biorą i wiersze, i sumy, i podgląd w modalu
  quoteCalc() {
    return Component.computeQuote(this.state);
  }

  patch(coll, id, p) {
    this.setState((s) => ({
      [coll]: s[coll].map((r) => (r.id === id
        ? (typeof p === 'function' ? p(r) : Object.assign({}, r, p))
        : r)),
    }));
  }

  buildRows(coll, withProducent, per) {
    const isBrutto = this.state.valueMode === 'brutto';
    return this.state[coll].map((r) => {
      const discGr = (per || {})[Component.rowKey(coll, r)] || 0;
      const c = this.calc(r, discGr);
      const key = Component.rowKey(coll, r) + ':disc';
      const set = (field) => (e) => this.patch(coll, r.id, { [field]: e.target.value, bruttoEdit: null, nettoEdit: null });
      const vRate = 1 + Component.num(r.vat) / 100;
      const cenaU = Component.uOf(r);
      // „Wartość" = ile ma wyjść ta pozycja; cena jednostkowa liczy się wstecz
      const backCalc = (wNetGr) => this.patch(coll, r.id, (x) => {
        const q = Component.num(x.qty) || 1;
        const d = this.state.discount;
        const inScope = d && Component.rowsInScope(this.state, d.scope).filter((y) => y._k === Component.rowKey(coll, x)).length > 0;
        let newBase;
        if (inScope && !d.custom && d.mode === 'pct') {
          const pct = Component.num(d.value);
          if (pct >= 100) return x;
          newBase = Math.round(wNetGr / (1 - pct / 100));
        } else {
          newBase = wNetGr + discGr;
        }
        const units = Math.round(newBase * 100 / q);
        return Object.assign({}, x, { cenaU: units, cena: Component.fmtU(units), cenaEditing: null, bruttoEdit: null, nettoEdit: null });
      });
      const row = {
        name: r.name, unit: r.unit, qty: r.qty, cena: Component.fmtU(cenaU), vat: r.vat,
        netto: Component.fmt(c.net),
        brutto: Component.fmt(c.gross),
        cenaLabel: isBrutto ? 'Cena brutto' : 'Cena netto',
        // w trakcie pisania pokazujemy wpisany tekst — przeliczanie w locie zjadało cyfry
        cenaValue: r.cenaEditing != null
          ? r.cenaEditing
          : (isBrutto ? Component.fmtU(Math.round(cenaU * vRate)) : Component.fmtU(cenaU)),
        setCenaValue: (e) => {
          const raw = e.target.value;
          const typed = Component.u(raw);
          const units = isBrutto ? Math.round(typed / vRate) : typed;
          this.patch(coll, r.id, { cenaU: units, cena: Component.fmtU(units), cenaEditing: raw, bruttoEdit: null, nettoEdit: null });
        },
        commitCena: () => this.patch(coll, r.id, { cenaEditing: null }),
        // rabat przy pozycji zawsze w złotówkach — mechanik negocjuje kwotami
        rabatLabel: isBrutto ? 'Rabat brutto (zł)' : 'Rabat netto (zł)',
        rabatValue: r.rabatEditing != null
          ? r.rabatEditing
          : (discGr > 0
            ? Component.grFmt(isBrutto
              ? (r.manualG != null && r.manual === discGr ? r.manualG : Math.round(discGr * vRate))
              : discGr)
            : ''),
        rabatError: (this.state.rowErrors || {})[key] || '',
        hasRabatError: !!(this.state.rowErrors || {})[key],
        setRowDiscount: (e) => this.setRowDiscount(coll, r.id, e.target.value),
        commitRabat: () => this.patch(coll, r.id, { rabatEditing: null }),
        sumaLabel: isBrutto ? 'Wartość brutto' : 'Wartość netto',
        sumaValue: isBrutto
          ? (r.bruttoEdit != null ? r.bruttoEdit : Component.fmt(c.gross))
          : (r.nettoEdit != null ? r.nettoEdit : Component.fmt(c.net)),
        setSumaValue: isBrutto
          ? (e) => this.patch(coll, r.id, { bruttoEdit: e.target.value })
          : (e) => this.patch(coll, r.id, { nettoEdit: e.target.value, bruttoEdit: null }),
        commitSuma: () => {
          if (isBrutto) {
            if (r.bruttoEdit == null) return;
            backCalc(Math.round(Component.gr(r.bruttoEdit) * 100 / (100 + Component.rowVat(r))));
          } else {
            if (r.nettoEdit == null) return;
            backCalc(Component.gr(r.nettoEdit));
          }
        },
        setName: (e) => this.patch(coll, r.id, { name: e.target.value }),
        setUnit: set('unit'),
        setQty: set('qty'),
        setVat: set('vat'),
        setBrutto: (e) => this.patch(coll, r.id, { bruttoEdit: e.target.value }),
        remove: () => this.setState((s) => {
          const next = s[coll].filter((x) => x.id !== r.id);
          return { [coll]: next.length ? next : [Component.mkRow(1, null, withProducent)] };
        }),
      };
      if (withProducent) {
        row.producent = r.producent || '';
        row.setProducent = (e) => this.patch(coll, r.id, { producent: e.target.value });
      }
      return row;
    });
  }

  sumOf(coll, per) {
    const t = this.state[coll].reduce((a, r) => {
      const c = this.calc(r, (per || {})[Component.rowKey(coll, r)] || 0);
      return { net: a.net + c.net, gross: a.gross + c.gross, rabat: a.rabat + c.rabat };
    }, { net: 0, gross: 0, rabat: 0 });
    const brutto = this.state.valueMode === 'brutto';
    return {
      net: Component.money(t.net), vat: Component.money(t.gross - t.net), gross: Component.money(t.gross),
      label: brutto ? 'Suma brutto' : 'Suma netto',
      value: brutto ? Component.money(t.gross) : Component.money(t.net),
      _n: t.net, _g: t.gross, _r: t.rabat,
    };
  }

  // po wgraniu dokumentu wracamy tu z otwartym popupem i zaznaczonym dokumentem
  static applyPick(base) {
    try {
      const pk = (location.hash || '').match(/[#&]pick=([^&]*)/);
      if (!pk) return base;
      base.docPickerOpen = true;
      const nr = decodeURIComponent(pk[1]);
      if (nr && nr !== '1') {
        const doc = Component.docSource().filter((d) => d.nr === nr)[0];
        if (doc) {
          base.docPicked = (doc.items || []).map((_, i) => nr + '#' + i);
          base.docOpenMap = Component.docSource().reduce((m, d) => { m[d.nr] = d.nr === nr; return m; }, {});
        }
      }
    } catch (e) {}
    return base;
  }

  static docSource() {
    let list = null;
    try {
      const m = (location.hash || '').match(/[#&]docs=([^&]*)/);
      if (m) list = JSON.parse(decodeURIComponent(m[1]));
    } catch (e) { list = null; }
    if (!Array.isArray(list) || !list.length) {
      list = [
        { nr: 'ZM/2026/0213', supplier: 'Auto Partner', date: '12.08.2026', items: [
          { name: 'Klocki hamulcowe przód', indeks: 'GDB1330', producent: 'TRW', cena: '184,00', vat: '23', msrp: '289,00' },
          { name: 'Tarcze hamulcowe przód', indeks: '24.0122-0187.1', producent: 'ATE', cena: '146,00', vat: '23', msrp: '219,00' },
          { name: 'Filtr oleju', indeks: 'HU 7020 z', producent: 'MANN', cena: '38,00', vat: '23', msrp: '' },
          { name: 'Olej silnikowy 5W30 5L', indeks: 'EDGE 5W30 LL', producent: 'Castrol', cena: '248,00', vat: '23', msrp: '379,00' },
        ] },
        { nr: 'ZM/2026/0212', supplier: 'Auto Partner', date: '08.08.2026', items: [
          { name: 'Filtr powietrza', indeks: 'C 30 130', producent: 'MANN', cena: '52,00', vat: '23', msrp: '' },
          { name: 'Świece zapłonowe (zestaw 4)', indeks: 'ZKR7A-10', producent: 'NGK', cena: '84,00', vat: '23', msrp: '129,00' },
        ] },
        { nr: 'ZM/2026/0211', supplier: 'Inter Cars', date: '01.08.2026', items: [
          { name: 'Pasek rozrządu — zestaw', indeks: 'KP15607XS', producent: 'Gates', cena: '412,00', vat: '23', msrp: '' },
          { name: 'Pompa wody', indeks: 'VKPC 81416', producent: 'SKF', cena: '189,00', vat: '23', msrp: '249,00' },
        ] },
      ];
    }
    return list;
  }

  // „13.08.2026" → liczba, żeby dało się sortować i porównywać dni
  static dayKey(d) {
    const m = String(d || '').match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
    return m ? Number(m[3] + m[2] + m[1]) : 0;
  }

  static DOW_PL = ['Niedziela', 'Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota'];
  static MON_PL = ['sty', 'lut', 'mar', 'kwi', 'maj', 'cze', 'lip', 'sie', 'wrz', 'paź', 'lis', 'gru'];

  // dzisiaj i wczoraj po nazwie, dalej „Środa 12 sie"
  static dayLabel(date, today) {
    const k = Component.dayKey(date);
    const t = Component.dayKey(today);
    if (!k) return date;
    const iso = (n) => new Date(Math.floor(n / 10000), Math.floor(n / 100) % 100 - 1, n % 100);
    if (t) {
      const diff = Math.round((iso(t) - iso(k)) / (24 * 3600 * 1000));
      if (diff === 0) return 'Dzisiaj';
      if (diff === 1) return 'Wczoraj';
    }
    const d = iso(k);
    return Component.DOW_PL[d.getDay()] + ' ' + d.getDate() + ' ' + Component.MON_PL[d.getMonth()];
  }

  _docPickerVals() {
    const s = this.state;
    const q = (s.docQuery || '').toLowerCase();
    const source = Component.docSource();
    const openMap = s.docOpenMap || null;
    const picked = s.docPicked || [];
    const money = (v) => Component.fmt(Component.num(v));
    // najświeższy dokument wyznacza „dzisiaj"; pokazujemy cztery ostatnie dni
    const days = [];
    source.forEach((d) => { if (days.indexOf(d.date) === -1) days.push(d.date); });
    days.sort((a, b) => Component.dayKey(b) - Component.dayKey(a));
    const today = days[0];
    const keepDays = days.slice(0, 4);
    const dayOpen = s.docDayMap || {};
    const docs = [];
    source.forEach((d) => {
      if (keepDays.indexOf(d.date) === -1) return;
      const items = (d.items || []).map((it, i) => ({ it: it, key: d.nr + '#' + i }))
        .filter(({ it }) => !q
          || (it.name || '').toLowerCase().indexOf(q) !== -1
          || (it.indeks || '').toLowerCase().indexOf(q) !== -1
          || (it.producent || '').toLowerCase().indexOf(q) !== -1
          || (d.nr || '').toLowerCase().indexOf(q) !== -1);
      if (!items.length) return;
      // domyślnie rozwinięte są dokumenty z dzisiaj; szukanie rozwija wszystko
      const isOpen = q ? true : (openMap && openMap[d.nr] !== undefined ? !!openMap[d.nr] : d.date === today);
      const keys = items.map((x) => x.key);
      const onCount = keys.filter((k) => picked.indexOf(k) !== -1).length;
      const allOn = onCount > 0 && onCount === keys.length;
      docs.push({
        allBorder: onCount > 0 ? 'var(--zilo-primary)' : 'var(--grey-3)',
        allBg: onCount > 0 ? 'var(--zilo-primary)' : 'var(--tk-surface)',
        someChecked: onCount > 0,
        allIconPath: allOn ? 'M4 10.5l4 4L16 6' : 'M5 10H15',
        toggleAll: (e) => {
          if (e && e.stopPropagation) e.stopPropagation();
          this.setState((st) => {
            const cur = st.docPicked || [];
            const rest = cur.filter((k) => keys.indexOf(k) === -1);
            return { docPicked: allOn ? rest : rest.concat(keys) };
          });
        },
        nr: d.nr,
        supplier: d.supplier,
        date: d.date,
        count: String(items.length),
        open: isOpen,
        chevron: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
        toggle: () => this.setState((st) => {
          const cur = st.docOpenMap || {};
          const now = cur[d.nr] !== undefined ? cur[d.nr] : d.date === today;
          return { docOpenMap: Object.assign({}, cur, { [d.nr]: !now }) };
        }),
        day: d.date,
        items: items.map(({ it, key }) => {
          const on = picked.indexOf(key) !== -1;
          const netto = Component.num(it.cena);
          return {
            name: it.name,
            indeks: it.indeks || '—',
            producent: it.producent || '—',
            netto: money(netto) + ' zł',
            brutto: money(netto * (1 + Component.num(it.vat || '23') / 100)) + ' zł',
            msrp: it.msrp ? money(it.msrp) + ' zł' : '—',
            checked: on,
            bg: on ? 'var(--zilo-primary-5)' : 'var(--tk-surface)',
            boxBorder: on ? 'var(--zilo-primary)' : 'var(--grey-3)',
            boxBg: on ? 'var(--zilo-primary)' : 'var(--tk-surface)',
            toggle: () => this.setState((st) => {
              const cur = st.docPicked || [];
              return { docPicked: cur.indexOf(key) !== -1 ? cur.filter((k) => k !== key) : cur.concat([key]) };
            }),
          };
        }),
      });
    });
    // dokumenty w grupach dziennych, od najnowszego dnia
    const groups = [];
    keepDays.forEach((date, di) => {
      const inDay = docs.filter((d) => d.day === date);
      if (!inDay.length) return;
      // otwarty jest tylko dzisiejszy dzień; szukanie rozwija wszystko
      const def = di < 1;
      const isOpen = q ? true : (dayOpen[date] !== undefined ? dayOpen[date] : def);
      groups.push({
        key: date,
        label: Component.dayLabel(date, today),
        date: date,
        showDate: Component.dayLabel(date, today) !== date,
        count: String(inDay.length),
        color: date === today ? 'var(--zilo-primary)' : 'var(--grey-1)',
        open: isOpen,
        headBorder: isOpen ? '1px solid var(--grey-5)' : '1px solid transparent',
        chevron: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
        toggle: () => this.setState((st) => {
          const cur = st.docDayMap || {};
          const now = cur[date] !== undefined ? cur[date] : def;
          return { docDayMap: Object.assign({}, cur, { [date]: !now }) };
        }),
        docs: inDay,
      });
    });
    const n = picked.length;
    return {
      open: !!s.docPickerOpen,
      query: s.docQuery || '',
      groups: groups,
      empty: groups.length === 0,
      countLabel: n ? ('Zaznaczono: ' + n) : '',
      hasPicked: n > 0,
      ctaCursor: n ? 'pointer' : 'not-allowed',
      ctaOpacity: n ? '1' : '0.5',
      ctaEvents: n ? 'auto' : 'none',
    };
  }

  renderVals() {
    const s = this.state;
    const q = this.quoteCalc();
    const sumU = this.sumOf('uslugi', q.per);
    const sumT = this.sumOf('towary', q.per);
    const net = sumU._n + sumT._n;
    const gross = sumU._g + sumT._g;
    const rabatAmt = sumU._r + sumT._r;
    const chan = (key, name, desc, last) => ({
      name: name,
      desc: desc,
      checked: s[key] ? 'true' : 'false',
      track: s[key] ? 'var(--zilo-blue-1, #222693)' : 'var(--grey-3, #979DB0)',
      knob: s[key] ? '22px' : '2px',
      line: last ? 'transparent' : 'var(--grey-5, #E9ECF1)',
      toggle: () => this.setState((st) => ({ [key]: !st[key] })),
    });
    try {
      window.__ofrState = {
        client: { name: s.cname, phone: s.phone, email: s.cmail, cc: s.cc },
        channels: { sms: s.sms, mail: s.mail },
        uslugi: s.uslugi, towary: s.towary,
        notatka: s.notatka, komentarz: s.komentarz,
        totals: { uslugi: sumU.gross, towary: sumT.gross, net: Component.money(net), vat: Component.money(gross - net), gross: Component.money(gross) },
      };
    } catch (e) {}
    return {
      showRabat: !!s.discount,
      // pola kwotowe w modalu rabatu: zaznacz przy wejściu, Enter zatwierdza
      selectOnFocus: (e) => e.target.select && e.target.select(),
      commitOnEnter: (e) => { if (e.key === 'Enter') { e.preventDefault(); e.target.blur(); } },
      discount: this.discountVals(q),
      posMinWidth: s.discount ? '1520px' : '1350px',
      uslugiGrid: 'minmax(320px,1fr) 154px 154px 154px 154px' + (s.discount ? ' 154px' : '') + ' 154px 36px',
      towaryGrid: 'minmax(320px,1fr) 154px 154px 154px 154px 154px' + (s.discount ? ' 154px' : '') + ' 154px 36px',
      segNetto: s.valueMode !== 'brutto' ? 'true' : 'false',
      segBrutto: s.valueMode === 'brutto' ? 'true' : 'false',
      pickNetto: () => this.switchValueMode('netto'),
      pickBrutto: () => this.switchValueMode('brutto'),
      uslugaUnits: Component.USLUGA_UNITS,
      towarUnits: Component.TOWAR_UNITS,
      vats: Component.VATS,
      cc: s.cc, phone: s.phone, cname: s.cname, cmail: s.cmail,
      setPhone: (e) => this.setState({ phone: e.target.value }),
      setCname: (e) => this.setState({ cname: e.target.value }),
      setCmail: (e) => this.setState({ cmail: e.target.value }),
      channels: [
        chan('sms', 'SMS', 'Klient otrzyma powiadomienie o wycenie na numer telefonu przypisany do zlecenia', false),
        chan('mail', 'E-mail', 'Klient otrzyma wiadomość z odnośnikiem do wyceny na skrzynkę e-mail przypisaną do zlecenia', true),
      ],
      uslugi: this.buildRows('uslugi', false, q.per),
      towary: this.buildRows('towary', true, q.per),
      addUsluga: () => this.setState((st) => ({ uslugi: st.uslugi.concat([Component.mkRow(st.nextU, null, false)]), nextU: st.nextU + 1 })),
      addTowar: () => this.setState((st) => ({ towary: st.towary.concat([Component.mkRow(st.nextT, null, true)]), nextT: st.nextT + 1 })),
      openDocPicker: () => this.setState({ docPickerOpen: true, docQuery: '', docPicked: [], docOpenMap: null, docDayMap: null }),
      closeDocPicker: () => this.setState({ docPickerOpen: false, docPicked: [] }),
      clearDocPicked: () => this.setState({ docPicked: [] }),
      setDocQuery: (e) => this.setState({ docQuery: e.target.value }),
      docPicker: this._docPickerVals(),
      // wgrywanie dokumentu żyje w Towarach — wracamy tu po zapisaniu
      addDocument: () => {
        try { parent.postMessage({ __ofr: 'addDoc', state: window.__ofrState || null }, '*'); } catch (e) {}
      },
      addFromDocs: () => {
        const picked = this.state.docPicked || [];
        if (!picked.length) return;
        const flat = [];
        Component.docSource().forEach((d) => (d.items || []).forEach((it, i) => flat.push({ key: d.nr + '#' + i, it: it })));
        const rows = picked.map((key) => flat.filter((x) => x.key === key)[0]).filter(Boolean);
        this.setState((st) => {
          let id = st.nextT;
          const fresh = rows.map(({ it }) => {
            const row = Component.mkRow(id, {
              name: it.name || '',
              producent: it.producent || '',
              unit: 'Sztuka',
              qty: '1',
              cena: it.cena || '0,00',
              vat: it.vat || '23',
            }, true);
            id += 1;
            return row;
          });
          return { towary: st.towary.concat(fresh), nextT: id, docPickerOpen: false, docPicked: [] };
        });
      },
      sumU: sumU,
      sumT: sumT,
      total: { net: Component.money(net), vat: Component.money(gross - net), gross: Component.money(gross),
               rabat: Component.money(rabatAmt) },
      notatka: s.notatka,
      komentarz: s.komentarz,
      setNotatka: (e) => this.setState({ notatka: e.target.value }),
      setKomentarz: (e) => this.setState({ komentarz: e.target.value }),
      close: () => { try { parent.postMessage({ __ofr: 'close' }, '*'); } catch (e) {} },
      send: () => { try { parent.postMessage({ __ofr: 'send', state: window.__ofrState || null, totals: (window.__ofrState || {}).totals || null }, '*'); } catch (e) {} },
    };
  }
}