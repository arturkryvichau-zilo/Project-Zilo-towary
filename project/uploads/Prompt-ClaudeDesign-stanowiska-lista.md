# Prompt dla Claude Design — chip stanowiska + lista wizyt (Zilo)

## Co to jest

Załączony plik HTML (`zilo-stanowiska-lista-podglad.html`) to **wierne odwzorowanie prawdziwego UI Zilo**, wyciągnięte 1:1 z kodu produkcyjnego (`zilo-front-v2`). To **nie jest low-fi ani propozycja** — to jak te elementy dokładnie wyglądają w aplikacji. Traktuj plik jako **źródło prawdy**: wszystkie wymiary (px), wagi fontów, promienie, odstępy i kolory (hexy) są prawdziwe i mają zostać odtworzone **dokładnie**. Pod każdym blokiem w pliku jest sekcja „spec" z wypisanymi wartościami — korzystaj z niej.

To ma być **wysoka wierność** (prawdziwe kolory, nie skala szarości). Odwzoruj wygląd 1:1.

## Co masz odtworzyć (i skopiować dokładnie)

### 1. Chip filtra stanowiska
Poziomy rząd „pigułek". Pierwszy chip „Wszystkie stanowiska" (bez markera), dalej po jednym chipie na stanowisko z pionowym paskiem koloru po lewej + nazwą.

Skopiuj dokładnie:
- Chip: `padding:8px 12px` · `border:1px solid #DCE0E6` · `border-radius:8px` · tło `#FFFFFF` · `font-size:13px` · `font-weight:400` · kolor `#000000` · `gap:8px` · `white-space:nowrap`.
- Stan **aktywny**: `border-color:#222693` + tło `#F3F3FF`.
- Stan **hover**: `border-color:#1D207C`.
- Marker koloru: `width:4px` · `height:16px` · `border-radius:2px`; tło = kolor **border** danego stanowiska (patrz paleta niżej). „Wszystkie stanowiska" — bez markera.

### 2. Lista wizyt
Pionowa lista pogrupowana po dniach. Grupa = białe pudełko z nagłówkiem dnia + liczbą wizyt, pod spodem wizyty.

Skopiuj dokładnie:
- Kontener listy: `flex-column` · `gap:16px`.
- Grupa (dzień): tło `#FFFFFF` · `border:1px solid #DCE0E6` · `border-radius:8px`.
- Nagłówek grupy: `padding:12px 16px` · `border-bottom:1px solid #DCE0E6` · `font-size:14px` · `font-weight:500` · kolor `#000` · `gap:8px`. Tekst = „Dzień D miesiąc" (np. „Poniedziałek 5 sierpnia").
- Licznik wizyt: `font-size:11px` · `font-weight:400` · kolor `#222693` · tło `#F3F3FF` · `width:22px height:22px` · `border-radius:15px` · `padding:4px`, wyśrodkowany.
- Obszar wizyt: `flex-column` · `gap:8px` · `padding:12px`.

Wizyta (kafelek):
- `border-radius:6px` · `font-size:12px` · `line-height:16px`.
- **Tło kafelka** = jasny kolor stanowiska (`color` z palety). **Kolor tekstu** = ciemny `text` z palety tego stanowiska. **Pasek** po lewej (`width:3px` · `border-radius:2px`) = kolor `border` stanowiska.
- Wnętrze: `flex` · `gap:8px` · `padding:6px 6px 6px 4px`. Treść w jednym wierszu (`flex-row align-center gap:12px`): **czas** (`font-weight:400`) · **marka+model** (`font-weight:500`) · **opis usługi** (ellipsis) · po prawej **status**.
- Status: chip `background:rgba(0,0,0,0.04)` · `padding:4px 8px` · `border-radius:2px` · `font-size:12px`; w środku kropka `8×8` `border-radius:50%` w kolorze **border** statusu + etykieta.
- Wizyta **wydana** = cały kafelek `opacity:0.5`.
- Hover kafelka: `box-shadow:0 4px 12px rgba(0,0,0,0.08)`.

## Logika kolorów (ważne — nie wymyślaj własnych)

- **Kolor stanowiska** to trójka: `border` (mocny, pasek/marker) / `color` (jasny, tło kafelka) / `text` (ciemny, tekst). Paleta 11 kolorów, domyślny = blue:
  blue `#2563EB / #EFF4FE / #112B63` · yellow `#D97706 / #FEF9EC / #4A2801` · red `#DC2626 / #FEF2F2 / #5C0A0A` · green `#16A34A / #F0FDF4 / #052E16` · violet `#7C3AED / #F5F3FF / #2E0650` · pink `#DB2777 / #FDF2F8 / #610B33` · orange `#EA580C / #FFF7ED / #5C1A03` · turquoise `#0891B2 / #ECFEFF / #06414F` · lime `#65A30D / #F7FEE7 / #1F3301` · gray `#4B5563 / #F9FAFB / #0D1117` · navy `#1E3A8A / #EEF2FF / #0D1545`.
- **Kolor statusu** (kropka) zależy od stanu, order → tło / kropka:
  1 `#FDF4E2 / #F6AE2D` · 2 `#C8E9FB / #2597E7` · 3 `#D8FDF3 / #31CF73` · 4 `#F0F1F5 / #979DB0` · 5 `#FEE9E5 / #EA4335`. W liście renderowana jest tylko **kropka** w kolorze border statusu + etykieta tekstowa.

## Co jest daną przykładową (możesz zmieniać dowolnie)
- Nazwy stanowisk („Pan Aleksander", „Podnośnik 2", „Lakiernia"), liczba chipów.
- Godziny, marka+model auta, opis usługi, nazwa dnia i data, etykiety statusów, liczba wizyt w grupie.
To tylko wypełniacz — struktura, wymiary i kolory zostają.

## Czego NIE robić
- Nie dodawaj **nagłówka kolumny stanowiska z widoku dnia** — świadomie go tu nie ma, nie odtwarzaj go.
- Nie zmieniaj wymiarów, promieni, paddingów ani wag fontów „na oko" — mają być dokładnie jak wyżej.
- Nie zamieniaj palety kolorów stanowisk/statusów na inne odcienie — używaj podanych hexów.
- Nie dodawaj cieni poza jednym hover na kafelku wizyty.
- Nie rób z tego skali szarości — to ma być kolorowe, wiernie.

## Font
Rodzina fontu = globalny font Zilo (w tych komponentach nie jest nadpisywana). W podglądzie użyto systemowego sans jako zastępnika — jeśli budujesz w kontekście Zilo, użyj tej samej rodziny co reszta aplikacji.
