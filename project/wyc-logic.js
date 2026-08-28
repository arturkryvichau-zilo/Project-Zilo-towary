class Component extends DCLogic {
  static mkRobocizna(id) {
    return { id, osoba: null, name: '', qty: '1', czas: '0', cena: '0,00', rabat: '', unit: 'Sztuka', vat: '23', bruttoEditing: null, openField: null };
  }
  static rawGroups() {
    let list = null;
    try {
      const m = (location.hash || '').match(/[#&]groups=([^&]*)/);
      if (m) list = JSON.parse(decodeURIComponent(m[1]));
    } catch (e) { list = null; }
    if (!Array.isArray(list) || !list.length) {
      list = [
        { name: 'Klient detaliczny', pct: 45 },
        { name: 'Flota', pct: 35 },
        { name: 'Cennik producenta', pct: 0, mode: 'msrp' },
      ];
    }
    return list;
  }

  static priceGroups() {
    let list = null;
    try {
      const m = (location.hash || '').match(/[#&]groups=([^&]*)/);
      if (m) list = JSON.parse(decodeURIComponent(m[1]));
    } catch (e) { list = null; }
    if (!Array.isArray(list) || !list.length) {
      list = [
        { name: 'Klient detaliczny', pct: 45 },
        { name: 'Flota', pct: 35 },
        { name: 'Cennik producenta', pct: 0, mode: 'msrp' },
      ];
    }
    return [{ value: '', label: '— brak —' }].concat(list.map((g) => ({
      value: g.name,
      label: g.mode === 'msrp' ? g.name + ' — sug. cena prod.' : g.name + ' +' + (g.pct || 0) + ' %',
    })));
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

  static defaultGroup() {
    const list = Component.priceGroups().filter((g) => g.value);
    return list[0] || null;
  }

  static groupPct(name) {
    const raw = Component.rawGroups().filter((g) => g.name === name)[0];
    return raw ? (Number(raw.pct) || 0) : 0;
  }

  static priceFromCost(koszt, grupa) {
    const base = Component.parseNum(koszt);
    return Component.fmt(base * (1 + Component.groupPct(grupa) / 100));
  }

  static normalizeTowar(r) {
    const out = Object.assign({}, r);
    const def = Component.defaultGroup();
    if (!out.grupa && def) out.grupa = def.value;
    const pct = Component.groupPct(out.grupa);
    let kosztNet = Component.parseNum(out.koszt);
    // Brak ceny zakupu → licz ją wstecz z ceny sprzedaży i narzutu grupy,
    // żeby „Cena zakupu brutto", grupa cenowa i cena netto były spójne.
    if (!(kosztNet > 0)) {
      kosztNet = Component.parseNum(out.cena) / (1 + pct / 100);
      out.koszt = Component.fmt(kosztNet);
    }
    if (out.kosztBrutto == null || Component.parseNum(out.kosztBrutto) === 0) {
      out.kosztBrutto = Component.fmt(kosztNet * (1 + Component.parseNum(out.vat || '23') / 100));
    }
    return out;
  }

  static mkTowar(id) {
    const def = Component.defaultGroup();
    return { id, name: '', indeks: '', producent: '', qty: '1', cena: '0,00', koszt: '0,00', kosztBrutto: '0,00', rabat: '', unit: 'Sztuka', vat: '23', grupa: def ? def.value : '', bruttoEditing: null, openField: null };
  }
  static parseNum(v) {
    if (v == null || v === '') return 0;
    const n = parseFloat(String(v).replace(/\s/g, '').replace(',', '.'));
    return isNaN(n) ? 0 : n;
  }
  static fmt(n) { return (Math.round(n * 100) / 100).toFixed(2).replace('.', ','); }
  // Cena jednostkowa wyliczana wstecz z wartości pozycji: dwa miejsca nie wystarczają
  // (1000 / 7 = 142,86 -> 7 × 142,86 = 1000,02). Trzymamy cztery, gdy to konieczne.
  static fmtPrice(n) {
    const two = Math.round(n * 100) / 100;
    const four = Math.round(n * 10000) / 10000;
    return two === four ? Component.fmt(n) : String(four).replace('.', ',');
  }
  static computeRow(r, showRabat) {
    const q = Component.parseNum(r.qty);
    const c = Component.parseNum(r.cena);
    const rb = showRabat ? Component.parseNum(r.rabat) : 0;
    const v = Component.parseNum(r.vat);
    const gross = q * c;
    const rabatAmt = gross * (rb / 100);
    const netto = gross - rabatAmt;
    const vatAmt = netto * (v / 100);
    const brutto = netto + vatAmt;
    return { netto, brutto, rabatAmt, vatAmt };
  }
  static __initState(def){
    var base = def;
    try {
      var h = location.hash || '';
      var m = h.match(/state=([^&]+)/);
      // Stan z hasha niesie tylko pozycje wyceny. Podmiana całego obiektu gubiła
      // resztę domyślnych pól (extraFields, valueMode, docPicked…) i pierwszy klik
      // w cokolwiek, co ich dotyka, wywalał się na undefined — stąd scalanie.
      if (m) { var s = JSON.parse(decodeURIComponent(m[1])); if (s && typeof s === 'object') base = Object.assign({}, def, s); }
      base.mode = /(?:^|[#&])preview=1(?:&|$)/.test(h) ? 'preview' : 'normal';
    } catch (e) {}
    try {
      // Stan z #state= (i z zapisu konfiguratora) może nie mieć id wierszy — bez nich
      // _patchRow dopasowuje po undefined i edytuje wszystkie wiersze naraz.
      let seq = 0;
      const withId = (r) => {
        const out = (r && r.id != null) ? r : Object.assign({}, r, { id: 'h' + (seq += 1) });
        if (out.id != null && typeof out.id === 'number') seq = Math.max(seq, out.id);
        return out;
      };
      // Zakładka Wyceny trzyma przypisanie w polu `person`, konfigurator czyta `osoba` —
      // normalizujemy w obie strony, żeby round-trip nie gubił osoby.
      const withOsoba = (r) => {
        const out = withId(r);
        const who = out.osoba || out.person || '';
        return Object.assign({}, out, { osoba: who, person: who });
      };
      if (Array.isArray(base.robociznas)) base.robociznas = base.robociznas.map(withOsoba);
      if (Array.isArray(base.towars)) base.towars = base.towars.map((r) => Component.normalizeTowar(withId(r)));
      if (Array.isArray(base.groups)) {
        base.groups = base.groups.map((g) => Object.assign({}, g, {
          robocizna: g.robocizna ? withOsoba(g.robocizna) : g.robocizna,
          towars: Array.isArray(g.towars) ? g.towars.map((r) => Component.normalizeTowar(withId(r))) : g.towars,
        }));
      }
      base.nextRobociznaId = Math.max(Number(base.nextRobociznaId) || 1, seq + 1);
      base.nextTowarId = Math.max(Number(base.nextTowarId) || 1, seq + 1);
    } catch (e) {}
    return base;
  }
  state = Component.__initState({
    robociznas: [Component.mkRobocizna(1)],
    towars: [Component.mkTowar(1)],
    nextRobociznaId: 2,
    nextTowarId: 2,
    extraFields: [],
    valueMode: 'netto',
    showFieldMenu: false,
    notatka: '',
    komentarz: '',
    docPickerOpen: false,
    docQuery: '',
    docOpenMap: null,
    docPicked: [],
  });

  static FIELD_CATALOG = {
    rabat: { menuLabel: 'Rabat (%)' },
  };

  static ROBOCIZNA_UNITS = ['Sztuka', 'Godzina'];
  static TOWAR_UNITS     = ['Sztuka', 'Gramy', 'Litry'];
  static VAT_OPTIONS     = ['0', '5', '8', '23'];
  static OSOBA_OPTIONS   = [
    'Aleksander Kowalski',
    'Andrzej Kowalski',
    'Paweł Nowak',
    'Filip Domański',
    'Aleksander Wójcik',
  ];
  // Model rozliczenia pracownika (cecha pracownika). Godzinowy → domyślna jednostka „Godzina".

  // Drag&drop state — trzymamy poza React state, żeby nie triggerować re-renderów w trakcie dragowania
  _draggingRow = null;
  _startDrag(collection, id) {
    return (e) => {
      this._draggingRow = { collection, id };
      if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move';
    };
  }
  _allowDrop(collection) {
    return (e) => {
      if (this._draggingRow && this._draggingRow.collection === collection) e.preventDefault();
    };
  }
  _handleDrop(collection, targetId) {
    return (e) => {
      if (!this._draggingRow || this._draggingRow.collection !== collection) return;
      e.preventDefault();
      const srcId = this._draggingRow.id;
      this._draggingRow = null;
      if (srcId === targetId) return;
      this.setState((s) => {
        const list = [...s[collection]];
        const src = list.findIndex((x) => x.id === srcId);
        const dst = list.findIndex((x) => x.id === targetId);
        if (src < 0 || dst < 0) return null;
        const [item] = list.splice(src, 1);
        list.splice(dst, 0, item);
        return { [collection]: list };
      });
    };
  }
  _patchRow(collection, id, patch) {
    this.setState((s) => ({
      [collection]: s[collection].map((x) =>
        x.id === id ? (typeof patch === 'function' ? patch(x) : { ...x, ...patch }) : x
      ),
    }));
  }

  _buildRow(collection, r, unitList, includeOsoba, includeIndeks, showRabat) {
    const openField = r.openField;

    const unitOpen  = openField === 'unit';
    const vatOpen   = openField === 'vat';
    const osobaOpen = openField === 'osoba';

    const chev = (open) => (open ? 'rotate(180deg)' : 'rotate(0deg)');
    const obord = (open) => (open ? 'border-color:var(--zilo-blue-1);box-shadow:inset 0 0 0 1px var(--zilo-blue-1);' : '');
    const bg   = (isSel) => (isSel ? 'var(--zilo-blue-5)' : 'transparent');

    const setField = (field) => this._patchRow(collection, r.id, (x) => ({
      ...x,
      openField: x.openField === field ? null : field,
    }));

    // Setter for a scalar field on this row
    const set = (field) => (e) => this._patchRow(collection, r.id, { [field]: e.target.value });

    // Compute & brutto commit (back-calc cena from brutto)
    const cmp = Component.computeRow(r, showRabat);
    const isBrutto = this.state.valueMode === 'brutto';
    const vRate = 1 + Component.parseNum(r.vat) / 100;
    const commitNetto = () => this._patchRow(collection, r.id, (x) => {
      if (x.nettoEditing == null) return x;
      const netto = Component.parseNum(x.nettoEditing);
      const q = Component.parseNum(x.qty) || 1;
      const rb = showRabat ? Component.parseNum(x.rabat) : 0;
      const gross = rb === 100 ? netto : netto / (1 - rb / 100);
      return { ...x, cena: Component.fmtPrice(gross / q), nettoEditing: null };
    });
    const commitBrutto = () => this._patchRow(collection, r.id, (x) => {
      if (x.bruttoEditing == null) return x;
      const b = Component.parseNum(x.bruttoEditing);
      const q = Component.parseNum(x.qty) || 1;
      const rb = showRabat ? Component.parseNum(x.rabat) : 0;
      const v = Component.parseNum(x.vat);
      const netto = b / (1 + v / 100);
      const gross = rb === 100 ? netto : netto / (1 - rb / 100);
      const cena = gross / q;
      return { ...x, cena: Component.fmtPrice(cena), bruttoEditing: null };
    });

    const row = {
      id: r.id,

      // Edytowalne pola
      name: r.name || '',
      indeks: r.indeks || '',
      producent: r.producent || '',
      czas: r.czas != null ? r.czas : '0',
      koszt: r.koszt != null ? r.koszt : '0,00',
      kosztBrutto: (r.kosztBrutto != null ? r.kosztBrutto : '0,00') + ' zł',
      qty: r.qty,
      cena: r.cena,
      rabat: r.rabat,
      setName:   set('name'),
      setIndeks: set('indeks'),
      setProducent: set('producent'),
      setCzas: set('czas'),
      setKoszt: set('koszt'),
      setQty:    set('qty'),
      setCena:   set('cena'),
      setRabat:  set('rabat'),
      setBruttoInput: set('bruttoEditing'),
      commitBrutto,

      // Przełącznik Netto / Brutto — jedna komórka ceny, zakupu i wartości
      cenaLabel: isBrutto ? 'Cena brutto' : 'Cena netto',
      cenaValue: isBrutto ? Component.fmt(Component.parseNum(r.cena) * vRate) : r.cena,
      setCenaValue: isBrutto
        ? (e) => this._patchRow(collection, r.id, { cena: Component.fmt(Component.parseNum(e.target.value) / vRate) })
        : set('cena'),
      kosztLabel: isBrutto ? 'Cena zakupu brutto' : 'Cena zakupu netto',
      kosztValue: isBrutto ? (r.kosztBrutto != null ? r.kosztBrutto : '0,00') : (r.koszt != null ? r.koszt : '0,00'),
      setKosztValue: (e) => {
        const val = Component.parseNum(e.target.value);
        this._patchRow(collection, r.id, isBrutto
          ? { kosztBrutto: e.target.value, koszt: Component.fmtPrice(val / vRate) }
          : { koszt: e.target.value, kosztBrutto: Component.fmt(val * vRate) });
      },
      sumaLabel: isBrutto ? 'Wartość brutto' : 'Wartość netto',
      setSumaInput: isBrutto ? set('bruttoEditing') : set('nettoEditing'),
      commitSuma: isBrutto ? commitBrutto : commitNetto,

      // Wyliczone
      nettoDisplay:  Component.fmt(cmp.netto),
      bruttoDisplay: Component.fmt(cmp.brutto),
      bruttoValue:   r.bruttoEditing != null ? r.bruttoEditing : Component.fmt(cmp.brutto),
      sumaValue: isBrutto
        ? (r.bruttoEditing != null ? r.bruttoEditing : Component.fmt(cmp.brutto))
        : (r.nettoEditing != null ? r.nettoEditing : Component.fmt(cmp.netto)),
      netto:  cmp.netto,
      brutto: cmp.brutto,
      vatAmt: cmp.vatAmt,
      rabatAmt: cmp.rabatAmt,

      // Klasy dla tri-state (default / filled)
      nameCellClass:   r.name   ? 'is-filled' : '',
      czasCellClass:   (r.czas != null && String(r.czas).trim() !== '' && Component.parseNum(r.czas) > 0) ? 'is-filled' : '',
      indeksCellClass: r.indeks ? 'is-filled' : '',
      producentCellClass: r.producent ? 'is-filled' : '',

      unit: r.unit,
      unitOpen,
      unitChevronRotation: chev(unitOpen),
      unitOpenStyle: obord(unitOpen),
      toggleUnit: () => setField('unit'),
      unitOptions: unitList.map((u) => ({
        value: u,
        isSelected: r.unit === u,
        selectedBg: bg(r.unit === u),
        select: () => this._patchRow(collection, r.id, { unit: u, openField: null, unitManual: true }),
      })),

      vat: r.vat,
      vatOpen,
      vatChevronRotation: chev(vatOpen),
      vatOpenStyle: obord(vatOpen),
      toggleVat: () => setField('vat'),
      vatOptions: Component.VAT_OPTIONS.map((v) => ({
        value: v,
        label: v + '%',
        isSelected: r.vat === v,
        selectedBg: bg(r.vat === v),
        select: () => this._patchRow(collection, r.id, { vat: v, openField: null }),
      })),

      trashColor: 'var(--grey-2)',

      // Drag-and-drop reorder
      onDragStart: this._startDrag(collection, r.id),
      onDragOver:  this._allowDrop(collection),
      onDrop:      this._handleDrop(collection, r.id),

      remove: () => this.setState((s) => ({
        [collection]: s[collection].length > 1
          ? s[collection].filter((x) => x.id !== r.id)
          : s[collection],
      })),
    };

    if (includeOsoba) {
      row.osoba = r.osoba;
      row.osobaHasValue = !!r.osoba;
      row.noOsoba = !r.osoba;
      row.osobaOpen = osobaOpen;
      row.osobaChevronRotation = chev(osobaOpen);
      row.osobaOpenStyle = obord(osobaOpen);
      row.toggleOsoba = () => setField('osoba');
      row.osobaOptions = [
        {
          value: null,
          label: '— wybierz —',
          isSelected: false,
          selectedBg: 'transparent',
          textColor: 'var(--grey-3)',
          select: () => this._patchRow(collection, r.id, { osoba: null, person: '', openField: null }),
        },
        ...Component.OSOBA_OPTIONS.map((name) => ({
          value: name,
          label: name,
          isSelected: r.osoba === name,
          selectedBg: bg(r.osoba === name),
          textColor: 'var(--grey-1)',
          select: () => this._patchRow(collection, r.id, { osoba: name, person: name, openField: null }),
        })),
      ];
    }

    return row;
  }

  _docPickerVals() {
    const s = this.state;
    const q = (s.docQuery || '').toLowerCase();
    const source = Component.docSource();
    const openMap = s.docOpenMap || (() => {
      const m = {};
      source.forEach((d, i) => { m[d.nr] = i < 1; });
      return m;
    })();
    const picked = s.docPicked || [];
    const money = (v) => Component.fmt(Component.parseNum(v));
    const docs = [];
    source.forEach((d) => {
      const items = (d.items || []).map((it, i) => ({ it: it, key: d.nr + '#' + i }))
        .filter(({ it }) => !q
          || (it.name || '').toLowerCase().indexOf(q) !== -1
          || (it.indeks || '').toLowerCase().indexOf(q) !== -1
          || (it.producent || '').toLowerCase().indexOf(q) !== -1
          || (d.nr || '').toLowerCase().indexOf(q) !== -1);
      if (!items.length) return;
      const isOpen = q ? true : !!openMap[d.nr];
      const keys = items.map((x) => x.key);
      const onCount = keys.filter((k) => picked.indexOf(k) !== -1).length;
      const allOn = onCount > 0 && onCount === keys.length;
      docs.push({
        allBorder: onCount > 0 ? 'var(--zilo-primary)' : 'var(--grey-3)',
        allBg: onCount > 0 ? 'var(--zilo-primary)' : '#fff',
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
          const cur = st.docOpenMap || (() => { const m = {}; source.forEach((x, i) => { m[x.nr] = i < 1; }); return m; })();
          return { docOpenMap: Object.assign({}, cur, { [d.nr]: !cur[d.nr] }) };
        }),
        items: items.map(({ it, key }) => {
          const on = picked.indexOf(key) !== -1;
          const netto = Component.parseNum(it.cena);
          return {
            name: it.name,
            indeks: it.indeks || '—',
            producent: it.producent || '—',
            netto: money(netto) + ' zł',
            brutto: money(netto * (1 + Component.parseNum(it.vat || '23') / 100)) + ' zł',
            msrp: it.msrp ? money(it.msrp) + ' zł' : '—',
            checked: on,
            bg: on ? 'var(--zilo-primary-5)' : '#fff',
            boxBorder: on ? 'var(--zilo-primary)' : 'var(--grey-3)',
            boxBg: on ? 'var(--zilo-primary)' : '#fff',
            toggle: () => this.setState((st) => {
              const cur = st.docPicked || [];
              return { docPicked: cur.indexOf(key) !== -1 ? cur.filter((k) => k !== key) : cur.concat([key]) };
            }),
          };
        }),
      });
    });
    const n = picked.length;
    return {
      open: !!s.docPickerOpen,
      query: s.docQuery || '',
      docs: docs,
      empty: docs.length === 0,
      countLabel: n ? ('Zaznaczono: ' + n) : '',
      hasPicked: n > 0,
      ctaCursor: n ? 'pointer' : 'not-allowed',
      ctaOpacity: n ? '1' : '0.5',
      ctaEvents: n ? 'auto' : 'none',
    };
  }

  renderVals() {
    const activeSet = new Set(this.state.extraFields);
    const showRabat = activeSet.has('rabat');

    // Grid template dla wierszy — z / bez kolumny Rabat (%)
    // [drag 16 | label 2fr | osoba/indeks 1.3fr | jednostka 1.15fr | ilość 92 | cena 1fr | vat 1fr | (rabat 92)? | suma/wartość netto 1fr | suma/wartość brutto 1fr | trash 30]
    // Robocizna: name | osoba | jednostka | ilość | przeprac.czas | cena | vat | (rabat)? | wNetto | wBrutto | trash
    // Usługa ma dwa pola mniej niż towar (cena zakupu, grupa cenowa), więc jej wiersz
    // kończy się wcześniej — kolumny obu list nie stoją w jednej linii i tak ma zostać.
    const robGridStyle =
      'display:grid;min-width:1500px;grid-template-columns:minmax(320px,1fr) 154px 154px 154px 154px 154px' +
      (showRabat ? ' 154px' : '') +
      ' 154px 30px;gap:8px;align-items:center;';
    // Towar: name | indeks | producent | koszt | jednostka | ilość | cena | (rabat)? | wNetto | trash
    // Grupa cenowa jest jedna na całą wycenę i stoi w sekcji klienta, nie w wierszu.
    const towGridStyle =
      'display:grid;min-width:1500px;grid-template-columns:minmax(320px,1fr) 154px 154px 154px 154px 154px 154px' +
      (showRabat ? ' 154px' : '') +
      ' 154px 30px;gap:8px;align-items:center;';

    const robociznas = this.state.robociznas.map((r) =>
      this._buildRow('robociznas', r, Component.ROBOCIZNA_UNITS, true, false, showRabat)
    );
    const towars = this.state.towars.map((r) =>
      this._buildRow('towars', r, Component.TOWAR_UNITS, false, true, showRabat)
    );
    // Totals per-list + global
    const sumBy = (list, key) => list.reduce((s, x) => s + x[key], 0);
    const robNetto  = sumBy(robociznas, 'netto');
    const robBrutto = sumBy(robociznas, 'brutto');
    const robVat    = sumBy(robociznas, 'vatAmt');
    const robRabat  = sumBy(robociznas, 'rabatAmt');
    const towNetto  = sumBy(towars, 'netto');
    const towBrutto = sumBy(towars, 'brutto');
    const towVat    = sumBy(towars, 'vatAmt');
    const towRabat  = sumBy(towars, 'rabatAmt');

    // Dodatkowe pola menu
    const catalog = Component.FIELD_CATALOG;
    const allFields = Object.keys(catalog).map((k) => {
      const isActive = activeSet.has(k);
      return {
        key: k,
        label: catalog[k].menuLabel,
        isActive,
        checkBg: isActive ? 'var(--zilo-primary)' : '#fff',
        checkBorder: isActive ? 'var(--zilo-primary)' : 'var(--grey-3)',
        toggle: () => this.setState((s) => ({
          extraFields: s.extraFields.includes(k)
            ? s.extraFields.filter((x) => x !== k)
            : [...s.extraFields, k],
        })),
      };
    });

    try { window.__wycData = robociznas.map(function (r) { return { name: r.name, person: r.osoba, brutto: r.bruttoDisplay }; }); } catch (e) {}
    try { window.__wycState = this.state; } catch (e) {}
    return {
      robociznas,
      towars,
      rootClass: this.state.mode === 'preview' ? 'z-preview' : '',
      robGridStyle,
      towGridStyle,
      showRabat,
      rabatBg: showRabat ? '#E9E9FF' : 'transparent',
      rabatIcon: showRabat ? '-webkit-mask-image:url(../assets/icons/i-close.svg);mask-image:url(../assets/icons/i-close.svg)' : '',
      toggleRabat: () => this.setState((st) => ({
        extraFields: st.extraFields.includes('rabat')
          ? st.extraFields.filter((x) => x !== 'rabat')
          : st.extraFields.concat(['rabat']),
      })),
      allFields,
      showNetto: this.state.valueMode !== 'brutto',
      showBrutto: this.state.valueMode === 'brutto',
      segNetto: this.state.valueMode !== 'brutto' ? 'true' : 'false',
      segBrutto: this.state.valueMode === 'brutto' ? 'true' : 'false',
      pickNetto: () => this.setState({ valueMode: 'netto' }),
      pickBrutto: () => this.setState({ valueMode: 'brutto' }),
      // dopóki któraś lista jest rozwinięta, karta nie może przycinać — inaczej
      // ucina wysuwane menu, tak jak overflow-x podnosi oś pionową do auto
      itemsOverflow: [].concat(this.state.robociznas || [], this.state.towars || [])
        .some((r) => r && r.openField) ? 'visible' : 'auto',
      showFieldMenu: this.state.showFieldMenu,
      toggleFieldMenu: () => this.setState((s) => ({ showFieldMenu: !s.showFieldMenu })),

      // Textareas
      notatka: this.state.notatka,
      komentarz: this.state.komentarz,
      setNotatka:   (e) => this.setState({ notatka: e.target.value }),
      setKomentarz: (e) => this.setState({ komentarz: e.target.value }),

      // Utility helpers
      selectOnFocus:  (e) => e.target.select && e.target.select(),
      commitOnEnter:  (e) => { if (e.key === 'Enter') { e.preventDefault(); e.target.blur(); } },

      // Totals — per lista i globalnie
      robNettoDisplay:   Component.fmt(robNetto),
      robBruttoDisplay:  Component.fmt(robBrutto),
      robVatDisplay:     Component.fmt(robVat),
      robRabatDisplay:   Component.fmt(robRabat),
      towNettoDisplay:   Component.fmt(towNetto),
      towBruttoDisplay:  Component.fmt(towBrutto),
      towVatDisplay:     Component.fmt(towVat),
      towRabatDisplay:   Component.fmt(towRabat),
      totalNettoDisplay:  Component.fmt(robNetto  + towNetto),
      totalBruttoDisplay: Component.fmt(robBrutto + towBrutto),
      totalVatDisplay:    Component.fmt(robVat    + towVat),
      totalRabatDisplay:  Component.fmt(robRabat  + towRabat),

      addRobocizna: () => this.setState((s) => ({
        robociznas: [...s.robociznas, Component.mkRobocizna(s.nextRobociznaId)],
        nextRobociznaId: s.nextRobociznaId + 1,
      })),

      addTowar: () => this.setState((s) => ({
        towars: [...s.towars, Component.mkTowar(s.nextTowarId)],
        nextTowarId: s.nextTowarId + 1,
      })),

      openDocPicker: () => this.setState({ docPickerOpen: true, docQuery: '', docPicked: [], docOpenMap: null }),
      closeDocPicker: () => this.setState({ docPickerOpen: false, docPicked: [] }),
      clearDocPicked: () => this.setState({ docPicked: [] }),
      setDocQuery: (e) => this.setState({ docQuery: e.target.value }),
      docPicker: this._docPickerVals(),
      addFromDocs: () => {
        const picked = this.state.docPicked || [];
        if (!picked.length) return;
        const flat = [];
        Component.docSource().forEach((d) => (d.items || []).forEach((it, i) => flat.push({ key: d.nr + '#' + i, doc: d, it: it })));
        const rows = picked.map((key) => flat.filter((x) => x.key === key)[0]).filter(Boolean);
        this.setState((s) => {
          let nextId = s.nextTowarId;
          const fresh = rows.map(({ doc, it }) => {
            const row = Component.mkTowar(nextId);
            nextId += 1;
            const def = Component.defaultGroup();
            const grupa = def ? def.value : '';
            const vat = it.vat || '23';
            const kosztNet = Component.parseNum(it.cena);
            return Object.assign(row, {
              name: it.name || '',
              indeks: it.indeks || '',
              producent: it.producent || '',
              koszt: it.cena || '0,00',
              kosztBrutto: Component.fmt(kosztNet * (1 + Component.parseNum(vat) / 100)),
              grupa: grupa,
              cena: grupa ? Component.priceFromCost(it.cena, grupa) : (it.cena || '0,00'),
              vat: vat,
              msrp: it.msrp || '',
              doc: doc.nr,
            });
          });
          const base = s.towars.filter((t) => (t.name || '').trim() || (t.indeks || '').trim());
          return {
            towars: base.concat(fresh),
            nextTowarId: nextId,
            docPickerOpen: false,
            docPicked: [],
          };
        });
      },
    };
  }
}
module.exports = Component;
