# Pakiet przygotowawczy całego filmu

EtapA zaakceptowanego planu. Dane są propozycją realizacyjną do budowy animatiku, nie ukończonym filmem.

-22sekwencje,88oryginalnych przedziałów scenariusza,149proponowanych pojedynczych ujęć,870sekund.
-42kwestie dialogowe z zachowaniem tekstu i pochodzenia; proponowane czasy wymagają czytania aktorskiego. Dwa zdania narratora są w rejestrze. Powtarzany podpisAI ma osobne zaplanowane nośniki/czasy w ujęciach.
-520wpisów zależności:141pozycji modeli/rekwizytów,65ról lub grup postaci,133ruchy,124intencje dźwiękowe,29rodzin lokalizacji i28efektów. To nie520gotowych modeli ani520unikalnych generatorów. Rejestr ma pomóc grupować warianty we wspólne generatory; finalną liczbę plików ustali animatik.
-7śledzonych ciągłości obiektów/postaci: taksówka/wrak, filiżanka, sprzedawczyni i telefon, zeszytNairobi, przeniesiony terminal polarny, dyżurna oraz astronautka.

## Pliki

- `source-beats.json`: dokładne przedziały i pełny tekst źródłowy z identyfikatoremSHA256 scenariusza.
- `production.json`: propozycja kamer, indywidualne ujęcia, zależności, rejestr ponownych użyć, dialogi oraz ciągłość. Współdzielony model telefonu/terminala nie oznacza tego samego fizycznego egzemplarza: ciągłości mają własne instance_id i zakres lokalizacji.
- `STORYBOARD.md`: czytelny storyboard tekstowy wygenerowany z danych, nie storyboard obrazkowy.
- `../references/REFERENCJE.md`: kolejność paczki wizualnej i dokładny promptA1.

Dopisywanie ujęcia nie powinno renumerować już używanych identyfikatorów. Planowana obecność podpisu jest sprawdzana dla fizycznego miejsca w obrębie sekwencji; panorama/ujęcie drona nie dostaje wymyślonego ekranu, jeśli podpis ustanowiono na urządzeniu w tej samej scenie. Plansze autorskie i cięcie do czerni nie są lokalizacjami.

## Weryfikacja

`node scripts/aipocalypse-production.mjs` sprawdza dane oraz zgodność wygenerowanego dokumentu. Po świadomej edycji danych: `node scripts/aipocalypse-production.mjs --write`.

`node --test tests/aipocalypse-production.test.mjs` sprawdza także mutacje: luki/nakładki, nieznane zasoby, brak podpisu/nośnika, obowiązkowe cięcia startów, finał, dialogi, ciszę, elipsę ratowania i ciągłość. Testy są częścią Androidbuilda i `npm test`.

Walidator sprawdza strukturę i wybrane niezmienniki. Nie dowodzi dramaturgii, słyszalności kwestii, czytelności ekranów, poprawności wszystkich gestów ani wydajności telefonu. Modele mają statusplanned, dźwięki wymagają nagrania/licencji; nie dodano płatnej/generatywnej mowy. Brak gotowego źródła dźwięku jest jawną zależnością, a nie zgubioną pracą.

## Stan i następny etap

Niezależny przegląd poprawek danych:PASS w sprawdzonym zakresie. CI dla dbbd0f07124ca30a4457b25adc6232ef22d04c19 przeszedł z nowymi testami. Odtwarzacz APK nadal pokazuje próbkę samochodu: ta zmiana przygotowuje cały film, lecz jeszcze go nie odtwarza.

A1: wygenerowano w rozmowie pierwszy podgląd stylistyki (ratownik na ulicy / astronautka przy radiu). To referencja do oceny, bardziej szczegółowa niż dotychczasowe modele; nie dowód jakości renderera. Nie została automatycznie użyta jako tło ani włączona do APK. Po ustaleniu kierunku: karty powracających postaci i próbka20–30s, następnie pełny roboczy animatik. Finał i wymagające efekty sprawdzane wcześnie, nie dopiero po dopracowaniu początku.
