# Eksperyment Kalinka — stan prac

## Cel i kryteria
- Osobny wariant tego samego robota z dłuższymi nogami.
- Przysiady i naprzemienne wykopy; podgląd GitHub Pages.
- Zachować oryginalną animację i GLB. Nie generować MP4.
- Małe commity na feat/kalinka-dance; aktualizować ten plik przy każdym etapie.

## Etap 1 — implementacja robocza
- Dodano proceduralne wydłużenie nóg, rozwiązanie stawów i 24-sekundową choreografię.
- Dodano przełącznik animacji przez robot.html?dance=kalinka.
- Zachowano pauzę, suwak i obsługę ograniczenia ruchu.
- Pierwsze testy: 41/42; walidator linków nie rozpoznaje query string — poprawka w następnym etapie.
- Brak weryfikacji wizualnej i publikacji. Wariant wymaga sprawdzenia stóp oraz kadrowania.

## Następne kroki
1. Poprawić walidację linków z query string i dodać testy ruchu.
2. Sprawdzić build, testy i wygląd w przeglądarce.
3. Poprawić zauważone problemy; uruchomić audyt.
4. PR, CI, scalenie i potwierdzenie publikacji Pages bez eksportu MP4.

## Etap 2 — kontrole lokalne
- Utworzono roboczy PR #2: https://github.com/kpok/cartoon_ai/pull/2.
- Poprawiono walidator lokalnych odnośników z query string.
- Test ruchu sprawdza osiągalność celów nóg, naprzemienne wykopy, stopę podporową i pętlę.
- npm test: 43/43; npm run build: OK; npm run check:workflows: OK.
- Pipeline CI/Pages działa tylko na main; generowanie modelu i MP4 jest ręczne. Audyt branchy pozostaje aktywny.
- Weryfikacja wizualna i publikacja nadal oczekują; PR jest roboczy.

## Etap 3 — uszatka i kozaki
- Dodano proceduralną czapkę z nausznikami oraz wysokie ciemne cholewki z jasnym obszyciem.
- Dodatki przypięte do głowy i podudzi; oryginalny GLB pozostaje bez zmian.
- Weryfikacja wizualna nadal niewykonana z powodu niedostępnego podglądu przeglądarkowego.

## Etap 4 — wejście ze strony głównej
- Dodano osobny kafelek Robot — Kalinka obok trzech dotychczasowych animacji.
- Dalej: weryfikacja wizualna, ewentualne poprawki i publikacja Pages; bez MP4.

## Etap 5 — tło AI w scenie
- Obraz zapisany w assets/kalinka/red-square-ai.png; pochodzenie opisano w README przy zasobie.
- Podłączono obraz jako tło tylko wariantu Kalinka, zamiast zielonej sceny kodowej.
- Dodano zasób do buildu i jawnej listy publicznych plików.
- Weryfikacja wizualna i publikacja pozostają do wykonania.

## Etap 6 — przygotowanie publikacji
- Na polecenie użytkownika pominięto kontrolę wizualną w przeglądarce.
- Uzupełniono wymagany rejestr zasobów o tło AI i hash; brak dodatkowej licencji na ponowne wykorzystanie.
- Do wykonania: zielony audyt, scalenie PR #2 i potwierdzenie wdrożenia Pages.
