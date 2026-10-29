# Interaktywny taniec robota — publikacja bez MP4

Na prośbę właściciela publikujemy najpierw animowany GLB w `robot.html`, bez generowania
ani dołączania filmu. Obie wcześniejsze bajki pozostają na stronie głównej.
Zachowano dużą głowę, mały korpus, krótkie ręce i nóżki. Klip `NeonDance` trwa8 sekund,
24fps, własny układ120BPM bez dźwięku i bez synchronizacji do konkretnej piosenki.
Można jednocześnie oglądać taniec i obracać model, przybliżać, zatrzymać i zacząć od początku.
Preferencja ograniczenia ruchu wyłącza autoplay; ukryta karta zawiesza zegar; utrata WebGL
pokazuje dotychczasowy PNG. Wszystkie zasoby ładowane są lokalnie z Pages.

## Pochodzenie i zakres

Gałąź `robot/humanoid-dance-draft` zawiera merge zatwierdzonego `main` (nóżki), commit193b22b.
Animowany GLB odzyskano w całości z wcześniej wyeksportowanego obiektu GitHub;
SHA-256: `a35a7e42fedd1afc78e07a6e2c4d23f5dfee7942a2cc5afdbffcb5ee6945ff44`.
Manifest zapisuje hash pliku i jawnie oddziela pierwotne metryki geometrii/podglądu od
odzyskanego, niezatwierdzonego wcześniej szkicu animacji. Nie przypisujemy tego eksportu
samemu commitowi bazowemu. Pełne odtworzenie generatora ruchu oraz eksport MP4 pozostają
kolejną pracą; obecny generator Blendera w repo nadal wytwarza model statyczny.
Animowany GLB można pobrać i wykorzystać dalej, niezależnie od podglądu.
Kod zegara i viewer nie wymagają API AI, tokenów ani zmiany ustawień administracyjnych.
Budżety geometrii, brak zewnętrznych URI i materiałów teksturowych pozostają sprawdzane.

## Walidacja

- Walidator StageA nadal odrzuca animacje; StageB wymaga jednego zamkniętego klipu8s
  z ograniczoną liczbą klatek i dozwolonymi przegubami, hashami GLB/PNG.
- Test rzeczywistego GLB: artykulacja, zamknięcie pętli, ograniczony ruch i niezależny obrót.
- Testy przeglądarkowe: pauza/restart, obrót przy zatrzymanej animacji, reduced motion,
  utrata WebGL, PNG po błędzie pobrania i nawigacja do obu bajek.
- Niezależny review `live_dance_review`: brak błędów blokujących; potwierdzone GLTFLoader,
  AnimationMixer i polityka workflow. Końcowy wynik pełnego E2E i deploymentu sprawdzany
  osobno przez autora zmiany.

Wycofanie: przywrócić poprzedni commit main991ffc5 (viewer i GLB) przez zwykły revert,
bez przepisywania historii. Workflowy, uprawnienia i renderowanie nie zmieniają się.

Weryfikacja przed publikacją (2026-10-29):36 testów Node,3 Python,38 E2E desktop/mobile,
walidator rzeczywistego pakietu, build z kontrolą publicznych plików, polityka7 zadań owner-only i niezależny review PASS. Po jedynej późniejszej
zmianie (parametr wersji URL GLB) uruchomiono ponownie testy robota oraz Node.
