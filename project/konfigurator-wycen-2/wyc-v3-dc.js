class Component extends DCLogic {
  static mkRobocizna(id) {
    return { id, osoba: null, name: '', qty: '1', czas: '0', cena: '0,00', totalPrice: '0,00', anchor: 'unit', priceSide: 'net', sumaEditing: null, rabatPct: '', unit: 'Sztuka', vat: '23', rabatEditing: null, openField: null };
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

  // Narzut warsztatu na części: cena sprzedaży netto z ceny zakupu netto.
  static priceFromCost(kosztNet, grupa) {
    return Component.roundHalfUp(Component.parseNum(kosztNet) * (100 + Component.groupPct(grupa)) / 100, 2);
  }

  static normalizeTowar(r) {
    const out = Component.withPricing(r);
    const def = Component.defaultGroup();
    if (!out.grupa && def) out.grupa = def.value;
    const pct = Component.groupPct(out.grupa);
    // Brak ceny zakupu → licz ją wstecz z ceny sprzedaży netto i narzutu grupy.
    if (!(Component.parseNum(out.koszt) > 0)) {
      const netUnit = Component.recalcRow(Component.priceRow(out)).unitNet;
      out.koszt = Component.pl(Component.roundHalfUp(netUnit * 100 / (100 + pct), 2).toFixed(2));
      out.purchaseSide = 'net';
    }
    return out;
  }

  static mkTowar(id) {
    const def = Component.defaultGroup();
    return { id, name: '', indeks: '', producent: '', qty: '1', cena: '0,00', totalPrice: '0,00', anchor: 'unit', priceSide: 'net', koszt: '', purchaseSide: 'net', rabatPct: '', priceTouched: false, unit: 'Sztuka', vat: '23', grupa: def ? def.value : '', rabatEditing: null, openField: null };
  }
  // ── Kwoty pozycji — model przeniesiony z produkcji (src/helpers/quote-pricing.ts) ──
  // Kierunek liczenia wyznacza strona, po której wpisano kwotę; zaokrąglenie następuje
  // dokładnie raz, przy przejściu na drugą stronę. Podatek jest resztą. Liczba wpisana
  // przez użytkownika nie zmienia się w żadnym scenariuszu.
  static DEFAULT_TAX_RATE = 23;

  // HALF_UP (połowa w górę, od zera); toPrecision(15) domyka błąd reprezentacji binarnej
  // — bez tego 1.005 * 100 === 100.49999999999999 i zaokrągliłoby się w dół.
  static roundHalfUp(value, scale) {
    const s = scale == null ? 2 : scale;
    if (!isFinite(value)) return 0;
    const factor = Math.pow(10, s);
    const shifted = Number((value * factor).toPrecision(15));
    const magnitude = Math.round(Math.abs(shifted));
    return (shifted < 0 ? -magnitude : magnitude) / factor;
  }

  // Jedyna funkcja przeliczająca wiersz. Kierunek bierze ze stanu wiersza (priceSide),
  // nie z tego, co pokazuje przełącznik — tryb wyświetlania nie ma prawa zmienić wyniku.
  static recalcRow(row) {
    const quantity = Component.parseNum(row.quantity) || 0;
    const taxRate = Component.parseNum(row.taxRate) || 0;
    // wartość autorytatywna po stronie wpisania, jeszcze BEZ zaokrąglenia
    const authoritativeTotal = row.anchor === 'total'
      ? (Component.parseNum(row.totalPrice) || 0)
      : (Component.parseNum(row.unitPrice) || 0) * quantity;
    const factor = 1 + taxRate / 100;
    const netTotal = row.priceSide === 'gross'
      ? Component.roundHalfUp(authoritativeTotal / factor, 2)
      : Component.roundHalfUp(authoritativeTotal, 2);
    const grossTotal = row.priceSide === 'gross'
      ? Component.roundHalfUp(authoritativeTotal, 2)
      : Component.roundHalfUp(authoritativeTotal * factor, 2);
    // podatek jest resztą — niezmiennik netto + VAT = brutto trzyma się z definicji
    const taxAmount = Component.roundHalfUp(grossTotal - netTotal, 2);
    const unitNet = quantity > 0 ? Component.roundHalfUp(netTotal / quantity, 4) : 0;
    const unitGross = quantity > 0 ? Component.roundHalfUp(grossTotal / quantity, 4) : 0;
    return { netTotal: netTotal, taxAmount: taxAmount, grossTotal: grossTotal, unitNet: unitNet, unitGross: unitGross };
  }

  // Sumowanie bez ponownego przeliczania przez stawkę — każda pozycja domyka się osobno.
  static sumRows(rows) {
    return (rows || []).reduce((acc, row) => {
      const t = Component.recalcRow(row);
      return {
        netTotal: Component.roundHalfUp(acc.netTotal + t.netTotal, 2),
        taxAmount: Component.roundHalfUp(acc.taxAmount + t.taxAmount, 2),
        grossTotal: Component.roundHalfUp(acc.grossTotal + t.grossTotal, 2),
      };
    }, { netTotal: 0, taxAmount: 0, grossTotal: 0 });
  }

  // Minimum 2 miejsca, maksimum 4, bez końcowych zer — 466,67 dla 1400/3 zapraszałoby
  // do sprawdzenia mnożenia, które się nie zgadza.
  static formatUnitPrice(value) {
    return Component.roundHalfUp(value, 4).toFixed(4).replace(/(\.\d{2}\d*?)0+$/, '$1');
  }

  static unitPriceOn(row, side, scale) {
    const t = Component.recalcRow(row);
    return Component.roundHalfUp(side === 'gross' ? t.unitGross : t.unitNet, scale == null ? 2 : scale);
  }

  static totalPriceOn(row, side) {
    const t = Component.recalcRow(row);
    return side === 'gross' ? t.grossTotal : t.netTotal;
  }

  // Cena jednostkowa pochodna z wartości pozycji — skala 2, bo tyle przyjmuje API.
  static deriveUnitPrice(row) { return Component.unitPriceOn(row, row.priceSide).toFixed(2); }
  static deriveTotalPrice(row) { return Component.totalPriceOn(row, row.priceSide).toFixed(2); }

  // Co pokazać, gdy przełącznik odsłania stronę `shown`: po stronie wpisania dokładnie
  // liczbę użytkownika, po drugiej — kwotę pochodną (cena jednostkowa w skali 4).
  static shownUnitPrice(row, shown) {
    return row.priceSide === shown ? row.unitPrice : Component.formatUnitPrice(Component.unitPriceOn(row, shown, 4));
  }
  static shownTotalPrice(row, shown) {
    return row.priceSide === shown ? row.totalPrice : Component.totalPriceOn(row, shown).toFixed(2);
  }

  // Ilość ma skalę 3 — 4,5 litra oleju czy 0,125 kg; zaokrągla się dopiero wartość pozycji.
  static normalizeQuantity(raw) { return String(Component.roundHalfUp(Component.parseNum(raw) || 0, 3)); }
  // Jedyne miejsce, które dotyka liczby wpisanej przez użytkownika.
  static normalizeAmount(raw) { return Component.roundHalfUp(Component.parseNum(raw) || 0, 2).toFixed(2); }

  // Kwota spoza modelu pozycji (cena zakupu towaru): ma tylko stronę wpisania.
  static convertAmount(amount, from, to, taxRate) {
    const value = Component.parseNum(amount) || 0;
    if (from === to) return Component.roundHalfUp(value, 2);
    const factor = 1 + (Component.parseNum(taxRate) || 0) / 100;
    return Component.roundHalfUp(to === 'gross' ? value * factor : value / factor, 2);
  }
  static shownSidedAmount(row, shown) {
    if (row.amount === '' || row.amount == null) return '';
    if (row.side === shown) return row.amount;
    return Component.convertAmount(Component.parseNum(row.amount) || 0, row.side, shown, row.taxRate).toFixed(2);
  }


  // ── WERSJA V3 — rabat wyłącznie per pozycja, w procentach ─────────────
  // Nie ma rabatu na całą wycenę: „+ Rabat" odsłania kolumnę przy pozycjach,
  // w której wpisuje się procent. Podsumowanie pokazuje tylko, ile z tego
  // wyszło w złotówkach, ze znakiem minus.
  static pl(v) { return String(v).replace('.', ','); }

  // kwota rabatu pozycji w groszach — procent liczony od wartości pozycji
  static rowCut(r) {
    const pct = Component.parseNum(r.rabatPct);
    if (!(pct > 0)) return 0;
    const base = Component.rowBase(r);
    return Math.min(Math.round(base * Math.min(pct, 100) / 100), base);
  }

  // Wiersz z zewnątrz (zapisana wycena, import, #state=) ma tylko cenę jednostkową —
  // dopisujemy stronę wpisania, kotwicę i wartość pozycji, żeby rdzeń miał komplet.
  static withPricing(r) {
    const out = Object.assign({}, r);
    if (out.priceSide !== 'gross') out.priceSide = 'net';
    if (out.anchor !== 'total') out.anchor = 'unit';
    if (out.purchaseSide !== 'gross') out.purchaseSide = 'net';
    if (out.totalPrice == null || out.totalPrice === '') {
      out.totalPrice = Component.pl(Component.deriveTotalPrice(Component.priceRow(out)));
    }
    return out;
  }

  // Wiersz wyceny w kształcie, który czyta rdzeń: nasze pola mają polskie nazwy,
  // model liczenia zostaje taki sam jak na produkcji.
  static priceRow(r) {
    return {
      quantity: r.qty,
      unitPrice: r.cena != null ? r.cena : '',
      totalPrice: r.totalPrice != null ? r.totalPrice : '',
      taxRate: r.vat,
      priceSide: r.priceSide === 'gross' ? 'gross' : 'net',
      anchor: r.anchor === 'total' ? 'total' : 'unit',
    };
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
  // kwota rabatu pozycji przychodzi z computeQuote (grosze) — wiersz sam
  // niczego nie liczy, żeby podgląd i wycena szły jedną drogą
  static computeRow(r, discGr, discGrossGr) {
    const t = Component.recalcRow(Component.priceRow(r));
    const baseGr = Math.round(t.netTotal * 100);
    const rabatGr = Math.min(discGr || 0, baseGr);
    // bez rabatu oddajemy dokładnie kwoty z rdzenia — również brutto wpisane przez
    // użytkownika (600,00 brutto zostaje 600,00, nie 599,99)
    if (rabatGr <= 0) {
      return {
        netto: t.netTotal, brutto: t.grossTotal, rabatAmt: 0, vatAmt: t.taxAmount,
        nettoGr: baseGr, rabatGr: 0,
      };
    }
    const netto = Component.roundHalfUp((baseGr - rabatGr) / 100, 2);
    // Rabat wpisany w brutto — czy to kwota na całą wycenę, czy ręcznie przy pozycji
    // (r.manualG) — schodzi z brutto pozycji co do grosza, bez ponownego zaokrąglania
    // przez netto. Inaczej wpisane 25,00 zabierało 24,99.
    const grossCut = discGrossGr != null
      ? discGrossGr
      : (r.manualG != null && r.manual === rabatGr ? r.manualG : null);
    const brutto = grossCut != null
      ? Component.roundHalfUp((Math.round(t.grossTotal * 100) - grossCut) / 100, 2)
      : Component.roundHalfUp(netto * (1 + Component.rowVat(r) / 100), 2);
    return {
      netto: netto,
      brutto: brutto,
      rabatAmt: rabatGr / 100,
      rabatGrossAmt: (grossCut != null ? grossCut : Math.round(t.grossTotal * 100) - Math.round(brutto * 100)) / 100,
      vatAmt: Component.roundHalfUp(brutto - netto, 2),
      nettoGr: Math.round(netto * 100),
      rabatGr: rabatGr,
    };
  }
  // rabat jest procentowy, więc przełącznik netto/brutto go nie dotyka
  switchValueMode(mode) {
    this.setState({ valueMode: mode });
  }

  // ── Rabat wyceny — rdzeń liczenia ───────────────────────────────────────
  // Wszystko w GROSZACH (liczby całkowite). Rabat jest intencją zapisaną
  // w state.discount; kwoty przy pozycjach (row.manual) są wyliczane albo
  // wpisane ręcznie, ale nigdy nie są jedynym źródłem prawdy.
  // VAT liczymy per pozycja, bo koszyk bywa mieszany (23/8/5/0) — inaczej niż
  // w makiecie lo-fi, gdzie wszystko ma 23%.
  static gr(v) { return Math.round(Component.parseNum(v) * 100); }

  static rowBase(r) {
    return Math.round(Component.recalcRow(Component.priceRow(r)).netTotal * 100);
  }

  static rowVat(r) { return Component.parseNum(r.vat); }

  static rowGross(r) {
    return Math.round(Component.recalcRow(Component.priceRow(r)).grossTotal * 100);
  }

  // Numeracja id jest osobna dla usług i towarów, więc usługa i towar potrafią
  // mieć to samo id. Wszystko, co liczy rabat per pozycja, kluczuje po _k.
  static rowKey(collection, r) { return (collection === 'towars' ? 't:' : 'u:') + r.id; }

  static tagRows(list, collection) {
    return (list || []).map((r) => Object.assign({}, r, { _k: Component.rowKey(collection, r) }));
  }

  static allRows(state) {
    return Component.tagRows(state.robociznas, 'robociznas').concat(Component.tagRows(state.towars, 'towars'));
  }

  // pełne przeliczenie wyceny — jedyne miejsce, z którego biorą kwoty
  // zarówno podgląd w modalu, jak i render wyceny
  static computeQuote(state) {
    const rows = Component.allRows(state);
    const per = {};
    rows.forEach((r) => { per[r._k] = Component.rowCut(r); });
    const before = rows.reduce((a, r) => a + Component.rowBase(r), 0);
    const beforeGross = rows.reduce((a, r) => a + Component.rowGross(r), 0);
    const disc = rows.reduce((a, r) => a + per[r._k], 0);
    const perRow = rows.map((r) => Component.computeRow(r, per[r._k]));
    const net = perRow.reduce((a, x) => a + x.nettoGr, 0);
    const vat = perRow.reduce((a, x) => a + Math.round(x.vatAmt * 100), 0);
    const discGross = beforeGross - (net + vat);
    return {
      per: per, before: before, beforeGross: beforeGross, disc: disc,
      net: net, vat: vat, gross: net + vat, discGross: discGross,
      info: { amount: disc, amountGross: discGross, clamped: false, base: before, custom: false, splitSum: disc },
    };
  }

  static grFmt(gr) { return Component.fmt(gr / 100); }

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
      var pk = h.match(/[#&]pick=([^&]*)/);
      if (pk) {
        base.docPickerOpen = true;
        var nr = decodeURIComponent(pk[1]);
        if (nr && nr !== '1') {
          var doc = Component.docSource().filter(function (d) { return d.nr === nr; })[0];
          if (doc) {
            // świeżo wgrany dokument wchodzi z zaznaczonymi pozycjami i rozwinięty
            base.docPicked = (doc.items || []).map(function (_, i) { return nr + '#' + i; });
            base.docOpenMap = Component.docSource().reduce(function (m, d) { m[d.nr] = d.nr === nr; return m; }, {});
          }
        }
      }
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
        const out = Component.withPricing(withId(r));
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
    // rabat żyje tylko przy pozycjach (procent w wierszu); ta flaga mówi,
    // czy kolumna rabatu jest odsłonięta
    rowRabat: false,
    rowErrors: {},
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
    'Paweł Nowak',
    'Filip Domański',
    'Jakub Kuźniar',
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

  _buildRow(collection, r, unitList, includeOsoba, includeIndeks, showRabat, discGr, discGrossGr) {
    const rowKey = Component.rowKey(collection, r);
    // strona odsłonięta przełącznikiem; wiersz trzyma własną stronę wpisania
    const shown = this.state.valueMode === 'brutto' ? 'gross' : 'net';
    const pr = Component.priceRow(r);
    // wpisanie kwoty po odsłoniętej stronie czyni ją stroną wpisania wiersza
    const withTotal = (x) => Object.assign({}, x, {
      totalPrice: Component.pl(Component.deriveTotalPrice(Component.priceRow(x))),
    });
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
    const cmp = Component.computeRow(r, discGr || 0, discGrossGr);
    const isBrutto = this.state.valueMode === 'brutto';
    const vRate = 1 + Component.parseNum(r.vat) / 100;
    // „Wartość" = ile ma wyjść ta pozycja; przeliczamy cenę jednostkową wstecz
    const row = {
      id: r.id,

      // Edytowalne pola
      name: r.name || '',
      indeks: r.indeks || '',
      producent: r.producent || '',
      czas: r.czas != null ? r.czas : '0',
      koszt: Component.pl(Component.shownSidedAmount({ amount: r.koszt, side: r.purchaseSide === 'gross' ? 'gross' : 'net', taxRate: r.vat }, 'net')),
      kosztBrutto: Component.pl(Component.shownSidedAmount({ amount: r.koszt, side: r.purchaseSide === 'gross' ? 'gross' : 'net', taxRate: r.vat }, 'gross')) + ' zł',
      qty: r.qty,
      cena: Component.pl(Component.shownUnitPrice(pr, shown)),
      // rabat przy pozycji w procentach — jedyne miejsce, w którym się go nadaje
      rabatLabel: 'Rabat (%)',
      rabatValue: r.rabatEditing != null ? r.rabatEditing : (r.rabatPct || ''),
      rabatError: (this.state.rowErrors || {})[rowKey + ':disc'] || '',
      hasRabatError: !!(this.state.rowErrors || {})[rowKey + ':disc'],
      rabatBorder: (this.state.rowErrors || {})[rowKey + ':disc'] ? 'var(--red)' : 'var(--grey-3)',
      // wpisany tekst zostaje w polu do wyjścia — procent walidujemy od razu
      setRowDiscount: (e) => {
        const raw = e.target.value;
        const errs = Object.assign({}, this.state.rowErrors || {});
        const key = rowKey + ':disc';
        const txt = String(raw == null ? '' : raw).trim();
        if (txt !== '' && !/^\d*[.,]?\d*$/.test(txt)) {
          errs[key] = 'Tylko cyfry i przecinek.';
          this.setState({ rowErrors: errs });
          this._patchRow(collection, r.id, { rabatEditing: raw });
          return;
        }
        if (Component.parseNum(txt) > 100) {
          errs[key] = 'Maksymalnie 100%.';
          this.setState({ rowErrors: errs });
          this._patchRow(collection, r.id, { rabatEditing: raw });
          return;
        }
        delete errs[key];
        this.setState({ rowErrors: errs });
        this._patchRow(collection, r.id, { rabatPct: txt, rabatEditing: raw });
      },
      commitRabat: () => this._patchRow(collection, r.id, (x) => Object.assign({}, x, {
        rabatEditing: null,
        rabatPct: Component.parseNum(x.rabatPct) > 0 ? Component.pl(String(Component.roundHalfUp(Component.parseNum(x.rabatPct), 2))) : '',
      })),
      setName:   set('name'),
      setIndeks: set('indeks'),
      setProducent: set('producent'),
      setCzas: set('czas'),

      // zmiana ilości zawsze wraca do kotwicy UNIT — inaczej „5 sztuk" nie zmieniłoby
      // kwoty, tylko po cichu przeliczyło cenę sztuki
      setQty: (e) => this._patchRow(collection, r.id, (x) => withTotal(Object.assign({}, x, {
        qty: e.target.value, anchor: 'unit',
      }))),
      commitQty: () => this._patchRow(collection, r.id, (x) => withTotal(Object.assign({}, x, {
        qty: Component.pl(Component.normalizeQuantity(x.qty)),
      }))),

      // Przełącznik Netto / Brutto — jedna komórka ceny, zakupu i wartości
      cenaLabel: isBrutto ? 'Cena brutto (zł)' : 'Cena netto (zł)',
      // Przełącznik tylko odsłania: po stronie wpisania widać liczbę użytkownika,
      // po drugiej kwotę pochodną (skala 4, żeby ilość × cena zgadzała się z wartością).
      cenaValue: Component.pl(Component.shownUnitPrice(pr, shown)),
      setCenaValue: (e) => {
        const raw = e.target.value;
        this._patchRow(collection, r.id, (x) => withTotal(Object.assign({}, x, {
          priceSide: shown, cena: raw, anchor: 'unit', priceTouched: true,
        })));
      },
      // normalizujemy tylko liczbę wpisaną — pole z kwotą pochodną nie ma czego domykać
      commitCena: () => this._patchRow(collection, r.id, (x) => (
        x.priceSide !== shown || x.anchor !== 'unit'
          ? x
          : withTotal(Object.assign({}, x, { cena: Component.pl(Component.normalizeAmount(x.cena)) })))),

      kosztLabel: isBrutto ? 'Zakup brutto (zł)' : 'Zakup netto (zł)',
      // cena zakupu ma tylko stronę wpisania — nie mnoży się przez ilość i nie wchodzi do sum
      kosztValue: Component.pl(Component.shownSidedAmount({ amount: r.koszt, side: r.purchaseSide === 'gross' ? 'gross' : 'net', taxRate: r.vat }, shown)),
      setKosztValue: (e) => {
        const raw = e.target.value;
        this._patchRow(collection, r.id, (x) => {
          const next = Object.assign({}, x, { koszt: raw, purchaseSide: shown });
          // cena sprzedaży idzie za zakupem, dopóki mechanik jej nie nadpisał
          if (!x.priceTouched) {
            const netCost = Component.convertAmount(Component.parseNum(raw), shown, 'net', x.vat);
            next.cena = Component.pl(Component.priceFromCost(netCost, x.grupa).toFixed(2));
            next.priceSide = 'net';
            next.anchor = 'unit';
          }
          return withTotal(next);
        });
      },
      commitKoszt: () => this._patchRow(collection, r.id, (x) => (
        x.purchaseSide !== shown || String(x.koszt || '').trim() === ''
          ? x
          : Object.assign({}, x, { koszt: Component.pl(Component.normalizeAmount(x.koszt)) }))),

      sumaLabel: isBrutto ? 'Wartość brutto (zł)' : 'Wartość netto (zł)',
      // Edycja wartości pozycji: kotwica TOTAL, cena jednostkowa staje się pochodną.
      setSumaInput: (e) => {
        const raw = e.target.value;
        this._patchRow(collection, r.id, (x) => {
          // przy rabacie pole pokazuje kwotę po rabacie — w trakcie pisania musi
          // pokazywać wpisywany tekst, inaczej pierwsza cyfra znika w przeliczeniu
          if (Component.parseNum(x.rabatPct) > 0) return Object.assign({}, x, { sumaEditing: raw });
          const next = Object.assign({}, x, {
            priceSide: shown, totalPrice: raw, anchor: 'total', priceTouched: true,
          });
          next.cena = Component.pl(Component.deriveUnitPrice(Component.priceRow(next)));
          return next;
        });
      },
      // Domknięcie: cena jednostkowa zaokrągla się do 2 miejsc (tyle przyjmuje API),
      // a wartość przelicza się z tej ceny — pole pokazuje kwotę, która zostanie zapisana.
      commitSuma: () => this._patchRow(collection, r.id, (x) => {
        if (x.sumaEditing != null) {
          // wpisana kwota jest wartością PO rabacie tej pozycji, a rabat jest
          // procentem tylko jej — wartość pozycji odtwarzamy wprost
          const target = Component.parseNum(x.sumaEditing);
          const pct = Math.min(Component.parseNum(x.rabatPct), 100);
          const base = pct >= 100 ? target : Component.roundHalfUp(target / (1 - pct / 100), 2);
          const norm = Object.assign({}, x, {
            priceSide: shown, anchor: 'total', priceTouched: true, sumaEditing: null,
            totalPrice: Component.pl(base.toFixed(2)),
          });
          norm.cena = Component.pl(Component.deriveUnitPrice(Component.priceRow(norm)));
          norm.anchor = 'unit';
          return withTotal(norm);
        }
        if (x.priceSide !== shown || x.anchor !== 'total') return x;
        const norm = Object.assign({}, x, { totalPrice: Component.pl(Component.normalizeAmount(x.totalPrice)) });
        norm.cena = Component.pl(Component.deriveUnitPrice(Component.priceRow(norm)));
        norm.anchor = 'unit';
        return withTotal(norm);
      }),

      // Wyliczone
      nettoDisplay:  Component.fmt(cmp.netto),
      bruttoDisplay: Component.fmt(cmp.brutto),
      bruttoValue:   Component.fmt(cmp.brutto),
      // bez rabatu pole pokazuje liczbę użytkownika (albo kwotę pochodną drugiej strony),
      // z rabatem — wartość po rabacie
      // Wartość pozycji to kwota PO rabacie — tyle ta pozycja wnosi do sumy.
      // W trakcie pisania pokazujemy wpisywany tekst.
      sumaValue: r.sumaEditing != null
        ? r.sumaEditing
        : ((discGr > 0)
          ? Component.fmt(isBrutto ? cmp.brutto : cmp.netto)
          : Component.pl(Component.shownTotalPrice(pr, shown))),
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
    const money = (v) => Component.fmt(Component.parseNum(v));
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
          const netto = Component.parseNum(it.cena);
          return {
            name: it.name,
            indeks: it.indeks || '—',
            producent: it.producent || '—',
            netto: money(netto) + ' zł',
            brutto: money(netto * (1 + Component.parseNum(it.vat || '23') / 100)) + ' zł',
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
    const activeSet = new Set(this.state.extraFields);
    const showRabat = !!this.state.rowRabat;

    // Grid template dla wierszy — z / bez kolumny Rabat (%)
    // [drag 16 | label 2fr | osoba/indeks 1.3fr | jednostka 1.15fr | ilość 92 | cena 1fr | vat 1fr | (rabat 92)? | suma/wartość netto 1fr | suma/wartość brutto 1fr | trash 30]
    // Robocizna: name | osoba | jednostka | ilość | przeprac.czas | cena | vat | (rabat)? | wNetto | wBrutto | trash
    // Usługa ma dwa pola mniej niż towar (cena zakupu, grupa cenowa), więc jej wiersz
    // kończy się wcześniej — kolumny obu list nie stoją w jednej linii i tak ma zostać.
    // Kolumny stałe kurczą się do 104 px, zanim wiersz zacznie się przewijać —
    // inaczej towar z kolumną rabatu wychodził poza kartę, a usługa jeszcze nie.
    const gridStyle = (fixed) => {
      const min = 220 + fixed * 104 + 30 + (fixed + 1) * 8;
      return 'display:grid;min-width:' + min + 'px;grid-template-columns:minmax(220px,1fr) ' +
        new Array(fixed).fill('minmax(104px,154px)').join(' ') + ' 30px;gap:8px;align-items:center;';
    };
    // Towar: name | indeks | producent | koszt | jednostka | ilość | cena | (rabat)? | wNetto | trash
    // Grupa cenowa jest jedna na całą wycenę i stoi w sekcji klienta, nie w wierszu.
    // usługa: osoba, czas, jednostka, ilość, cena, (rabat)?, wartość
    const robGridStyle = gridStyle(6 + (showRabat ? 1 : 0));
    // towar: indeks, producent, zakup, jednostka, ilość, cena, (rabat)?, wartość
    const towGridStyle = gridStyle(7 + (showRabat ? 1 : 0));

    // jedno przeliczenie na render — z niego biorą i wiersze, i sumy, i podgląd
    const calc = Component.computeQuote(this.state);
    const robociznas = this.state.robociznas.map((r) =>
      this._buildRow('robociznas', r, Component.ROBOCIZNA_UNITS, true, false, showRabat, calc.per[Component.rowKey('robociznas', r)], (calc.info.perGross || {})[Component.rowKey('robociznas', r)])
    );
    const towars = this.state.towars.map((r) =>
      this._buildRow('towars', r, Component.TOWAR_UNITS, false, true, showRabat, calc.per[Component.rowKey('towars', r)], (calc.info.perGross || {})[Component.rowKey('towars', r)])
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
        checkBg: isActive ? 'var(--zilo-primary)' : 'var(--tk-surface)',
        checkBorder: isActive ? 'var(--zilo-primary)' : 'var(--grey-3)',
        toggle: () => this.setState((s) => ({
          extraFields: s.extraFields.includes(k)
            ? s.extraFields.filter((x) => x !== k)
            : [...s.extraFields, k],
        })),
      };
    });

    const discShownGr = this.state.valueMode === 'brutto' ? calc.discGross : calc.disc;
    const disc = {
      vals: {
        on: !!this.state.rowRabat,
        off: !this.state.rowRabat,
        // „+ Rabat" tylko odsłania kolumnę — nie ma rabatu na całą wycenę
        add: () => this.setState({ rowRabat: true }),
        remove: () => this.setState((st) => ({
          rowRabat: false,
          robociznas: (st.robociznas || []).map((r) => Object.assign({}, r, { rabatPct: '' })),
          towars: (st.towars || []).map((r) => Object.assign({}, r, { rabatPct: '' })),
        })),
        beforeLabel: this.state.valueMode === 'brutto' ? 'Suma brutto przed rabatem:' : 'Suma netto przed rabatem:',
        beforeDisplay: Component.grFmt(this.state.valueMode === 'brutto' ? calc.beforeGross : calc.before),
        hasAmount: discShownGr > 0,
        amountDisplay: Component.grFmt(discShownGr),
      },
    };

    try { window.__wycData = robociznas.map(function (r) { return { name: r.name, person: r.osoba, brutto: r.bruttoDisplay }; }); } catch (e) {}
    try { window.__wycState = this.state; } catch (e) {}
    return {
      robociznas,
      towars,
      rootClass: this.state.mode === 'preview' ? 'z-preview' : '',
      robGridStyle,
      towGridStyle,
      showRabat,
      allFields,
      showNetto: this.state.valueMode !== 'brutto',
      showBrutto: this.state.valueMode === 'brutto',
      segNetto: this.state.valueMode !== 'brutto' ? 'true' : 'false',
      segBrutto: this.state.valueMode === 'brutto' ? 'true' : 'false',
      pickNetto: () => this.switchValueMode('netto'),
      pickBrutto: () => this.switchValueMode('brutto'),
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
      towNettoDisplay:   Component.fmt(towNetto),
      towBruttoDisplay:  Component.fmt(towBrutto),
      towVatDisplay:     Component.fmt(towVat),
      totalNettoDisplay:  Component.grFmt(calc.net),
      totalBruttoDisplay: Component.grFmt(calc.gross),
      totalVatDisplay:    Component.grFmt(calc.vat),
      discount: disc.vals,

      addRobocizna: () => this.setState((s) => ({
        robociznas: [...s.robociznas, Component.mkRobocizna(s.nextRobociznaId)],
        nextRobociznaId: s.nextRobociznaId + 1,
      })),

      addTowar: () => this.setState((s) => ({
        towars: [...s.towars, Component.mkTowar(s.nextTowarId)],
        nextTowarId: s.nextTowarId + 1,
      })),

      openDocPicker: () => this.setState({ docPickerOpen: true, docQuery: '', docPicked: [], docOpenMap: null, docDayMap: null }),
      addDocument: () => {
        try { parent.postMessage({ __wyc: 'addDoc', state: window.__wycState || null }, '*'); } catch (e) {}
      },
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
            const kosztNet = Component.roundHalfUp(Component.parseNum(it.cena), 2);
            const cenaNet = grupa ? Component.priceFromCost(kosztNet, grupa) : kosztNet;
            return Object.assign(row, {
              koszt: Component.pl(kosztNet.toFixed(2)),
              purchaseSide: 'net',
              cena: Component.pl(cenaNet.toFixed(2)),
              priceSide: 'net',
              anchor: 'unit',
              totalPrice: Component.pl(Component.roundHalfUp(cenaNet * (Component.parseNum(row.qty) || 1), 2).toFixed(2)),
              name: it.name || '',
              indeks: it.indeks || '',
              producent: it.producent || '',
              grupa: grupa,
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