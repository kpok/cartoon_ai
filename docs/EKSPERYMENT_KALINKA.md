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
