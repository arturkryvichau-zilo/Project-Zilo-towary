# Prompt dla Claude Design — Magazyn części (Zilo) · klikalna makieta LOW-FIDELITY

## Rola i cel

Jesteś projektantem budującym **klikalny prototyp low-fidelity** modułu **Magazyn części** dla aplikacji SaaS **Zilo** (program dla warsztatów samochodowych). Zbuduj kompletną, klikalną makietę w **HTML** (pojedynczy plik, wszystko inline), tak aby dało się przechodzić między ekranami i flow.

**To ma być LOW-FIDELITY, nie hi-fi.** Konkretnie:
- Skala szarości jako baza; jeden kolor akcentu (granatowy indigo `#2b2b8c`) tylko na przyciski primary, zaznaczenia i akcenty.
- Prostokątne placeholdery zamiast logotypów i ikon (kwadraty/koła z obramowaniem). Ikony rysuj jako proste kształty albo znaki, nie realny icon-set.
- Font systemowy (`-apple-system, "Segoe UI", Roboto, sans-serif`). Bez zdjęć.
- Chodzi o rozkład, hierarchię, flow i stany — nie o finalny wygląd.
- **Klikalność:** wszystkie główne akcje i przejścia mają działać (pokaż/ukryj ekrany, otwórz full-screen, wróć). Może być jednym plikiem z prostym JS przełączającym widoki.

Interfejs jest **desktopowy**, po **polsku**. Jeden ekran = jeden logiczny widok. Ułóż ekrany tak, żeby dało się je też zaimportować do Figmy przez plugin html.to.design (czyste warstwy, flex/grid, realne teksty, bez pseudo-elementów niosących treść).

---

## Kontekst produktu i model danych (WAŻNE — nie wymyślaj innego)

Magazyn części w Zilo **nie prowadzi stanów magazynowych** („ile sztuk na półce"). Jednostką jest **dokument zakupu części od hurtowni** (dokument WZ — wydanie zewnętrzne). Warsztat:
1. dodaje dokument (wgrywa plik WZ lub pobiera go z integracji z hurtownią),
2. Zilo odczytuje z niego pozycje (części) wraz z cenami,
3. warsztat przypisuje pozycje do zleceń.

**Czego NIE ma być (świadomie poza zakresem):** liczniki stanu magazynowego / „ilość na półce", zamawianie części z Zilo, katalog części i dobór po numerze rejestracyjnym, fakturowanie/KSeF. Nie dodawaj tych rzeczy.

Odbiorcą interfejsu jest właściciel warsztatu ~45+, software to narzędzie pracy — copy zwięzłe, konkretne, po polsku, tryb „Ty".

---

## Wzorce Zilo do wiernego zachowania

Odwzorowujesz istniejące wzorce z aplikacji Zilo:

**A) Ramka aplikacji.** Wąski pasek nawigacji po lewej (~84px): logo „zilo" + pozycje: Statystyki, Kalendarz, Klienci, Usługi, **Magazyn** (aktywna), Marketing, Ustawienia. Reszta to obszar treści.

**B) Nagłówek strony.** Tytuł po lewej (duży, bold). Akcje po prawej, w jednej linii z tytułem.

**C) Pełnoekranowy edytor / kreator (`DmFullScreenWrapper`).** Używany do setupów wieloetapowych (jak konfiguracja Asystenta AI, „Dodaj pracownika"). Layout:
- Górny pasek: po lewej **przycisk X** (zamknij) + tekst „Kontakt: +48 61 648 28 08 lub kontakt@zilo.co"; **tytuł wyśrodkowany**; w **prawym górnym rogu** główne CTA (primary).
- Treść przewijana, wyśrodkowana kolumna.
- Krok wyboru = wyśrodkowane **karty-ścieżki** (border, tytuł + opis + placeholder ikony po prawej), kliknięcie karty przenosi dalej (bez CTA w rogu).
- Krok formularza = **karty-sekcje** z polami; CTA „Zapisz…" w prawym górnym rogu.

**D) Landing Ustawień.** Układ **dwukolumnowy** kart-sekcji. Każda karta: nagłówek + lista „route'ów". Route = wiersz: tytuł + opis + strzałka `›` w prawo, prowadzi na osobną stronę.

**E) Strona ustawień (leaf).** Nagłówek z **przyciskiem wstecz** (strzałka) + tytuł. W środku sekcje: infobox, karty z wierszami label/wartość, sekcje tabelaryczne z nagłówkiem `Tytuł` + przycisk po prawej. Statusy pokazuj jako **kropka + tekst** (nie sam kolor).

---

## Ekrany do zbudowania (z interakcjami)

### 1. Magazyn części — lista dokumentów (widok główny, punkt wejścia)
- Nagłówek: tytuł **„Magazyn części"** po lewej. Po prawej, w jednej linii: **ikona zębatki „Ustawienia magazynu"** (kwadratowy przycisk) + przycisk primary **„+ Dodaj dokument"**.
- Podtytuł: „Dokumenty zakupu części od dostawców. Wejdź w szczegóły, aby przypisać części do zleceń."
- **Bez filtrów.** Zostaje jedno pole wyszukiwania: „Szukaj — numer dokumentu, dostawca, część".
- Tabela dokumentów, kolumny: **Nr dokumentu** (mono, np. `ZM/2026/0213`), **Nr dokumentu zewnętrznego** (np. `FV 88213/08/2026`, albo `—`), **Data wystawienia**, **Dostawca**, **Pozycje** (liczba, wyśrodkowana), **Razem netto** (do prawej), **Razem brutto** (do prawej, pogrubione), oraz link **„Szczegóły ›"**. **Bez kolumny statusu.**
- Interakcje: „+ Dodaj dokument" → otwiera full-screen (ekran 2). Zębatka → Ustawienia magazynu (ekran 6). „Szczegóły ›" / kliknięcie wiersza → szczegóły dokumentu (ekran 5).
- Dodaj 4–5 przykładowych wierszy.

### 2. Dodaj dokument — KROK 1: wybór dostawcy (full-screen)
- `DmFullScreenWrapper`: X + kontakt po lewej, tytuł wyśrodkowany pusty, **bez CTA w rogu**.
- Wyśrodkowany nagłówek: „Od którego dostawcy jest ten dokument?" + opis „Wybierz hurtownię, od której masz dokument wydania zewnętrznego (WZ)."
- Siatka **kart-ścieżek** (2 kolumny): Inter Cars, Auto Partner, Motointegrator, Moto-Profil, GORDON, oraz karta „Inna hurtownia" (obramowanie przerywane). Każda karta: nazwa + krótki opis + placeholder logo.
- Interakcja: kliknięcie karty → KROK 2 (ekran 3).

### 3. Dodaj dokument — KROK 2: wgranie pliku + odczyt (full-screen)
- `DmFullScreenWrapper`: X + kontakt po lewej, tytuł „Dodaj dokument", **CTA primary „Zapisz dokument" w prawym górnym rogu**.
- Wyśrodkowana kolumna kart-sekcji:
  - **Dostawca:** wybrany dostawca (placeholder logo + nazwa) + link „Zmień".
  - **Dokument:** strefa upload (przerywane obramowanie): „Wgraj dokument WZ (wydanie zewnętrzne)", „Przeciągnij plik lub wybierz z dysku · PDF, JPG, PNG", przycisk „Wybierz plik".
  - **Odczytane dane** (stan po wgraniu): zielony pasek „Odczytaliśmy dokument — sprawdź dane i pozycje przed zapisem"; wiersz z wgranym plikiem (nazwa + rozmiar + X); pola „Nr dokumentu zewnętrznego" i „Data wystawienia"; tabelka **Odczytane pozycje** (Część + indeks katalogowy, Ilość, Brutto) z wierszem „+ Dodaj pozycję ręcznie".
  - **Kontrola poprawności:** pod pozycjami pokaż lekką informację o zgodności sum, np. „Suma pozycji zgadza się z sumą dokumentu ✓" (albo wariant ostrzeżenia, gdy się nie zgadza) — bo błąd w cenie zakupu propaguje dalej.
- Interakcje: „Zapisz dokument" → wraca na listę (ekran 1) z nowym wierszem. X / „Zmień" → odpowiednio zamknij / wróć do kroku 1.

### 4. Integracja z hurtownią — full-screen (2 kroki)
Uruchamiana z Ustawień magazynu (ekran 6), przyciskiem **„+ Połącz hurtownię"**.
- **KROK 1 (wybór):** `DmFullScreenWrapper` bez CTA w rogu; nagłówek „Z którą hurtownią chcesz się połączyć?"; siatka kart-ścieżek z hurtowniami. **Pokaż tylko te jeszcze niepołączone**; już połączone są wyszarzone z etykietą „Połączona". Kliknięcie karty → krok 2.
- **KROK 2 (połączenie):** `DmFullScreenWrapper`, tytuł „Połącz z {Hurtownia}", **CTA „Połącz" w prawym górnym rogu**. Treść: tytuł „Jak działa połączenie z {Hurtownia}?" + krótki opis; **numerowane kroki 1-2-3** (koło z numerem + opis z akcentem + treść pod spodem): 1) zaloguj się do panelu B2B hurtowni, 2) wygeneruj dane dostępowe (klucz API), 3) wklej dane poniżej → pod krokiem 3 dwa pola: „Numer klienta / login" i „Klucz API"; box „WAŻNE/ i" skąd wziąć dane; checkbox potwierdzenia na dole.
- Interakcja: „Połącz" → wraca do Ustawień magazynu (ekran 6) z zielonym toastem „Połączono z {Hurtownia}" i nową hurtownią na liście ze statusem „Połączona".

### 5. Szczegóły dokumentu
- Nagłówek z przyciskiem wstecz + „Dokument `ZM/2026/0213`". Po prawej: „⭳ Protokół zamówienia" i „✎ Edytuj". Podtytuł: „Załączony dokument wydania zewnętrznego (WZ) od dostawcy. Zaznacz pozycje, aby przypisać je do zlecenia."
- **Pasek meta:** Nr zewnętrzny (mono), Data wystawienia, Pozycje, Razem netto, Razem brutto.
- **Nagłówek dostawca ↔ odbiorca** (dwie karty obok siebie):
  - **Dostawca:** hurtownia (nazwa, oddział/nr klienta, NIP).
  - **Odbiorca (nabywca):** **dane Twojej firmy** — nazwa, adres, NIP. **Bez aut.**
- **Tabela pozycji dokumentu**, kolumny w tej kolejności: **checkbox** (po lewej), **Kod towaru** (nazwa części + indeks katalogowy pod spodem), **Jednostka**, **Ilość**, **Cena netto**, **VAT** (np. 23%), **Wartość netto**, **Wartość brutto**, **Przypisano do** (domyślnie „Nieprzypisane", oznaczone kropką; przypisane pokazują tablicę auta/zlecenie). Na dole wiersz „Razem" (netto/brutto).
- **Dolny pasek akcji** (widoczny po zaznaczeniu checkboxów): ciemny pasek „X zaznaczone pozycje" + „Wyczyść" + „Cofnij przypisanie" + primary **„Przypisz do zlecenia →"**.
- Interakcje: checkbox zaznacza wiersz i pokazuje dolny pasek. „Przypisz do zlecenia" → (na potrzeby makiety) pokaż prosty stan/potwierdzenie przypisania. Wstecz → lista.

### 6. Ustawienia magazynu (jeden ekran, dwie sekcje)
Wejście: z landingu Ustawień (karta „Magazyn" → jeden route „Ustawienia magazynu") oraz z zębatki w nagłówku Magazynu.
- Nagłówek z przyciskiem wstecz + „Ustawienia magazynu".
- **Sekcja „Narzuty"**: nagłówek + opis („Procent doliczany do ceny zakupu — po nim liczysz cenę sprzedaży części.") + przycisk **„+ Dodaj narzut"** po prawej. Lista narzutów: nazwa + opis, liczba pozycji, wartość „+X %", „Edytuj". (Kliknięcie „Dodaj narzut" / „Edytuj" → ekran 7.)
- **Sekcja „Integracje z hurtowniami"**: nagłówek + opis + globalny przycisk **„+ Połącz hurtownię"** po prawej (→ ekran 4). Lista **tylko połączonych** hurtowni: placeholder logo + nazwa + „Połączono {data}" + status „Połączona" (kropka + tekst) + „Zarządzaj". Dodaj też **empty state**, gdy brak połączonych („Brak połączonych hurtowni" + „+ Połącz hurtownię").

### 7. Dodaj / edytuj narzut — full-screen editor
- `DmFullScreenWrapper` (wzorzec „Dodaj pracownika"): X + kontakt po lewej, tytuł „Dodaj narzut" (lub „Edytuj narzut"), **CTA „Zapisz narzut" w prawym górnym rogu**.
- Wyśrodkowana kolumna, **jedna karta „Narzut"**:
  - Pole „Nazwa narzutu" (np. „Oryginały OEM").
  - Pole liczbowe „Wysokość narzutu" z sufiksem „%".
  - Helper: „Procent doliczany do ceny zakupu części. Po nim Zilo wylicza cenę sprzedaży, gdy przypisujesz część do zlecenia."
  - Przełącznik „Ustaw jako domyślny" + opis.
  - **Bez pola opisu.**
- Interakcja: „Zapisz narzut" → wraca do Ustawień magazynu (ekran 6).

### 8. (kontekst) Landing Ustawień — karta „Magazyn"
Pokaż landing Ustawień (dwukolumnowe karty) z istniejącymi sekcjami (Ustawienia konta, Asystent AI, Stanowiska, Powiadomienia) i **dołożoną kartą „Magazyn"** z jednym route'em „Ustawienia magazynu" (opis: „Narzuty oraz integracje z hurtowniami"). Kliknięcie → ekran 6.

---

## Mapa klikalności (flow)

- Lista (1) → „+ Dodaj dokument" → Dodaj dokument krok 1 (2) → wybór dostawcy → krok 2 (3) → „Zapisz dokument" → Lista (1).
- Lista (1) → „Szczegóły ›" → Szczegóły dokumentu (5) → zaznacz pozycje → „Przypisz do zlecenia".
- Lista (1) → zębatka → Ustawienia magazynu (6).
- Ustawienia (8) → karta „Magazyn" → Ustawienia magazynu (6).
- Ustawienia magazynu (6) → „+ Dodaj narzut" / „Edytuj" → Narzut editor (7) → „Zapisz narzut" → (6).
- Ustawienia magazynu (6) → „+ Połącz hurtownię" → Integracja krok 1 (4) → wybór → krok 2 → „Połącz" → (6) ze statusem „Połączona".
- Wszystkie X / wstecz zamykają / cofają do widoku źródłowego.

---

## Styl i ograniczenia (podsumowanie)
- Low-fi, skala szarości + indigo `#2b2b8c` tylko na primary/akcenty/zaznaczenia. Status = kropka + tekst.
- Desktop, polski, font systemowy, placeholdery zamiast logo/ikon.
- Zachowaj wzorce Zilo: lewy nav rail, full-screen wrapper (X+kontakt lewo / tytuł środek / CTA prawy górny róg), landing ustawień 2 kolumny kart, strony leaf z przyciskiem wstecz, wiersze label/wartość, sekcje tabelaryczne.
- Nie dodawaj: stanów magazynowych/ilości na półce, zamawiania części, katalogu/doboru po rejestracji, fakturowania/KSeF, kolorów brandowych, realnych ikon.
- Klikalne przejścia między wszystkimi ekranami wg mapy powyżej.

Zbuduj to jako spójny, klikalny prototyp i traktuj powyższe jako źródło prawdy — jeśli czegoś brakuje, wybierz najprostsze rozwiązanie zgodne z wzorcami Zilo i modelem „dokumenty, nie stany".
