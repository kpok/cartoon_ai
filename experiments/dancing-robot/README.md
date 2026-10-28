# Neon Tinker — szkic krótkonogiej sylwetki

Proceduralna interpretacja referencji robota: metal, duże oczy, uśmiech i kolorowa
błyszcząca powłoka. Ta gałąź dodaje statyczną humanoidalną sylwetkę z krótkimi nogami, bez tańca i MP4.
Nie używa AI podczas wykonania ani żadnych zewnętrznych modeli lub tekstur.

## Wykonanie

Wersję Blendera przypina workflow. Generator został sprawdzony z Blenderem 4.2.0.
Z katalogu głównego repo:

```sh
blender --background --factory-startup --python experiments/dancing-robot/generator.py -- --output robot-output --seed 27 --samples 32
python3 scripts/validate-robot.py robot-output --require-blend
```

Przy środowisku Pythona z tą samą wersją `bpy` możliwe jest również bezpośrednie
`python3 experiments/dancing-robot/generator.py --output robot-output`.
Wyniki: `robot.glb`, `robot.png` (768 × 768), `robot.blend` i `report.json`.
GLB zawiera wyłącznie model, bez studia, kamery i świateł; BLEND zachowuje studio.
Raport zapisuje wersję, seed, bazowy commit repo, SHA-256 skryptu, czas generowania/renderu
i szczytową pamięć procesu. SHA-256 identyfikuje również skrypt uruchomiony przed jego commitem.
Pamięć podawana jest w KiB na Linuksie. Cycles korzysta z CPU i 32 próbek z odszumianiem.

Budżety publikacji: GLB ≤ 10 MiB, ≤ 100 000 trójkątów, brak tekstur i zewnętrznych
URI, PNG ≤ 5 MiB. BLEND pozostaje artefaktem roboczym (≤ 50 MiB), poza witryną.
Budżet tekstur wynosi zero; kolory i metaliczność są parametrami materiałów PBR.
Materiały w przeglądarce i renderze mogą wyglądać inaczej. Mobilny podgląd służy ocenie
właściciela przed przejściem do etapu B. Powłoka jest nieruchomą geometrią.

## Licencje

`generator.py` i `scripts/validate-robot.py`: **GPL-3.0-or-later**; pełny tekst GPL v3
znajduje się w `LICENSE`. To oznaczenie nie zmienia licencji pozostałych plików repo.
Wygenerowane przez ten skrypt oryginalne geometria, materiały i obrazy są udostępniane
przez autora projektu na **CC BY 4.0**, z oznaczeniem „Neon Tinker by kpok”.
Zasady: https://creativecommons.org/licenses/by/4.0/ — wykorzystanie komercyjne i zmiany
są dozwolone z wymaganym uznaniem autorstwa i wskazaniem zmian.
Film i model nie otrzymują GPL automatycznie dlatego, że utworzono je Blenderem.
Nie dołączamy samego obrazka referencyjnego ani nie zapewniamy wyłączności wobec
podobnych projektów. Przed dodaniem cudzych zasobów trzeba odrębnie sprawdzić ich prawa.



## Szkic humanoidalnej sylwetki — osobna gałąź

Wersja robocza dodaje małą miednicę i krótkie, masywne nóżki z kolanami, kostkami
i zaokrąglonymi stopami. Zatwierdzona duża głowa, ramiona, twarz i kolorowa powłoka
pozostają takie same. Długość nóg jest zbliżona do obecnych krótkich rąk — bez proporcji
dorosłego człowieka. Każda część ma własną nazwę do późniejszego przygotowania ruchu.
To nadal statyczny model: nie dodano jeszcze szkieletu ani tańca.

Domyślnie generator tworzy `--body humanoid`; `--body bust` odtwarza dotychczasową
geometrię głowy i ramion. Raport zapisuje wybrany wariant. Kamera uwzględnia nowe stopy.
Wyniki zapisuj do osobnego folderu, np. `--output robot-humanoid-output`.
Właściciel zatwierdził publikację statycznej pełnej sylwetki. Wybrane GLB i PNG trafiają
do `published/robot`, a podgląd jest na `robot.html`. Taniec i MP4 nie są częścią tej aktualizacji.

### Render roboczy (bez publikacji Pages)

![Krótkonogi robot — podgląd sylwetki](../../published/robot/preview.png)

Kontrola geometrii w Blenderze:

```sh
blender --background --factory-startup --disable-autoexec --python-exit-code 1 --python experiments/dancing-robot/check_humanoid.py
```
