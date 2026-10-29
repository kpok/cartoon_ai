# Synchronizacja pulsu — poprawka

Poprzedni audyt: [before-fix.md](before-fix.md). Plik samples-0.5s.csv zawiera80
historycznych porównań starego modelu, przed poprawką — nie jest wynikiem nowej wersji.

Poprawiono puls z0.52s na0.437934878s oraz jego fazę według niezależnie zmierzonej
siatki dźwięku (audio-grid.json, początek audio przesunięty o43.104ms względem wideo).
Ugięcie kolan trafia teraz w akcent, zamiast występować pół okresu po nim.
Czasy gestów są określone osobno — nie przyspieszono całego40-sekundowego klipu.
Skrócono powitanie, dodano opuszczanie rąk, pogłębiono przysiad i pochylenie oraz
wzmocniono późniejszy obrót tułowia. Końcówki rąk przy twarzy schodzą wcześniej.

`npm run robot:sync` bada klucze DanceRoot.position z rzeczywistego GLB, nie samą
stałą w kodzie. Sprawdza okres i fazę pulsu w czterech przedziałach1–7.5,11.5–17,
17.5–21.5 i32.5–38.5s. Pominięto okna celowego przysiadu/pochylenia, których obwiednia
zmienia lokalne minima. Wynik i listy akcentów: rhythm-result.json.
Tolerancje fazy wynikają z połowy klatki24fps (20.84ms) oraz do12ms reszt pomiaru
siatki audio. Kontrole negatywne odrzucają dobre tempo ze złą fazą o pół uderzenia
oraz zły okres. Oba testy są teraz częścią CI, bez zmiany bramek właściciela.

Nie jest to automatyczny certyfikat identyczności wszystkich gestów ani rozpoznanie
słowa „hey”. Ruch pozostaje adaptacją na krótkie kończyny robota; ocena dokładnych
kontaktów dłoni i mikrogestów wymaga porównania wizualnego. Podgląd nadal jest niemy,
nie dołącza nagrania referencyjnego, jego klatek ani dźwięku do publicznego repo.

Weryfikacja poprawki:37/37 testów Node,3/3 Python,40/40 E2E desktop/mobile,
robot:check (identyczne odtworzenie GLB), walidator modelu i polityka workflow — PASS.
Maksymalny błąd względem stałej siatki rytmu w czterech oknach:20.76ms, przy24fps.
To pomiar względem dopasowanej siatki, nie obietnica błędu≤21ms dla każdego dźwięku.
Niezależny rhythm_sync_review: kod PASS, sprawdzono również wszystkie960 klatek,
kontakt stóp i mobilny kadr; po review rozszerzono pomiar z jednego okna na cztery.
