# Prompt dla Claude Design — popup „Przypisz do wizyty" (Zilo, magazyn części)

## Kontekst

W szczegółach dokumentu magazynowego użytkownik zaznacza pozycje (towary) i klika „Przypisz do zlecenia". Otwiera się **popup, w którym wybiera JEDNĄ wizytę**, do której te towary trafią. Twoja wersja tego popupu jest blisko, ale trzeba ją **doprowadzić do spójności z naszym istniejącym widokiem listy wizyt w kalendarzu**. Nie twórz nowego stylu listy — **wewnątrz popupu ma być dokładnie nasz widok listy z kalendarza**, tylko z dodanym radio buttonem po lewej każdej wizyty.

## Źródło prawdy (skopiuj 1:1)

Masz plik `zilo-stanowiska-lista-podglad.html` — to wierne odwzorowanie z kodu produkcyjnego Zilo. **Wszystkie style listy wizyt i tagów stanowisk bierz stamtąd co do piksela** (wymiary, paddingi, promienie, wagi fontów, hexy). Nie zmieniaj ich „na oko".

## Struktura popupu (od góry do dołu)

1. **Nagłówek**: tytuł „Przypisz do wizyty" po lewej + przycisk zamknięcia (X) w prawym górnym rogu.
2. **Wyszukiwarka**: pole na całą szerokość, placeholder „Szukaj — rejestracja, auto, klient".
3. **Tagi stanowisk** (bezpośrednio pod wyszukiwarką): poziomy rząd chipów stanowisk — dokładnie jak `chip filtra stanowiska` z pliku referencyjnego (pierwszy „Wszystkie stanowiska" bez markera, dalej chipy z markerem koloru). **Tego brakuje w Twojej obecnej wersji — trzeba dodać.**
4. **Lista wizyt** (obszar przewijalny): nasz widok listy z kalendarza, pogrupowany po dniach, z **radio buttonem po lewej stronie każdej wizyty**.
5. **Stopka**: „Anuluj" (secondary) + „Przypisz" (primary), po prawej.

## Lista wizyt — dokładnie jak nasz widok listy

Zbuduj listę **1:1 jak w pliku referencyjnym** (sekcja „Lista wizyt"):
- Grupy per dzień: białe pudełko `border:1px #DCE0E6`, `radius:8px`; nagłówek grupy `padding:12px 16px`, `font:14px/500`, z licznikiem wizyt (`#222693` na `#F3F3FF`, `22×22`, `radius:15px`).
- Wizyty w grupie: `flex-column gap:8px padding:12px`.
- Kafelek wizyty: `radius:6px`, `font:12px/16px`. **Tło kafelka = jasny kolor STANOWISKA** (`color` z palety), **pasek 3px po lewej = kolor `border` stanowiska**, **tekst = `text` stanowiska**. W jednym wierszu: czas (`weight 400`) · marka+model (`weight 500`) · opis usługi (ellipsis) · po prawej status jako chip `bg rgba(0,0,0,.04)` z kropką w kolorze statusu + etykieta.

**Ważna korekta względem Twojej wersji:** u Ciebie kolor tła wiersza idzie za statusem — u nas **tło idzie za kolorem STANOWISKA**, a status pokazujemy tylko jako **kropkę + etykietę** po prawej. Zachowaj ten podział (stanowisko = tło/pasek, status = kropka).

### Radio button (dodatek do naszej listy)
- Po **lewej stronie** każdej wizyty, przed czasem, jest kontrolka **radio** (single-select — wybierasz jedną wizytę).
- Zaznaczona wizyta: radio zaznaczone + delikatne podświetlenie/obwódka całego kafelka (obwódka `#222693`).
- Radio umieść w linii pionowo wyśrodkowane względem wiersza; nie rozbijaj układu kafelka.

## Zachowanie sekcji (tożsame z naszym widokiem listy)

1. **Po otwarciu** popup jest przewinięty tak, że **dzisiejszy dzień jest od razu widoczny pod tagami**. Nagłówek dzisiejszej grupy ma prefiks „Dziś • " (np. „Dziś • Czwartek 13 Sierpień").
2. **Scroll w górę i w dół**: obszar listy jest przewijalny — w górę widać dni przeszłe (wczoraj, przedwczoraj…), w dół dni przyszłe. Tak jak w naszym widoku listy w kalendarzu.
3. **Tagi stanowisk filtrują** listę po stanowisku; „Wszystkie stanowiska" = bez filtra. **Wyszukiwarka** filtruje po rejestracji / aucie / kliencie.

## Co konkretnie poprawić w Twojej obecnej wersji
1. **Dodaj rząd tagów stanowisk** pod wyszukiwarką (teraz go nie ma).
2. **Tło wierszy = kolor stanowiska**, nie status; status zostaw jako kropka + etykieta po prawej.
3. **Wymiary, promienie, odstępy, fonty i kolory** dociągnij do pliku referencyjnego (nagłówki grup, kafelki wizyt, licznik).
4. **Prefiks „Dziś • "** przy dzisiejszej grupie i domyślne przewinięcie do niej.
5. Zachowaj radio po lewej (to dobre) i stopkę Anuluj/Przypisz.

## Czego nie robić
- Nie wymyślaj nowego stylu listy — reużyj nasz z pliku referencyjnego.
- Nie zmieniaj palety kolorów stanowisk/statusów na inne odcienie.
- Nie usuwaj grupowania po dniach ani przewijania do dni przeszłych/przyszłych.
- Nie rób z tego wielokrotnego wyboru wizyt — radio = jedna wizyta.

## Font
Rodzina fontu = globalny font Zilo (jak w reszcie aplikacji), nie systemowy zastępnik z podglądu.
