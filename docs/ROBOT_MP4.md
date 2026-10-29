# MP4 tańczącego robota

Workflow **Export dancing robot MP4**, plik `.github/workflows/robot-mp4.yml`.
Pierwszy eksport uruchamia push zmieniający ten konkretny plik na main. Po aktualizacji
samej animacji można uruchomić **Actions → Export dancing robot MP4 → Run workflow**,
wybierając main. Zwykłe commity kodu lub dokumentacji nie renderują automatycznie filmu.
Wymagany jest właściciel kpok; bramki konta/repo/ref i token read-only pozostają aktywne.

Wynik: artefakt **dancing-robot-mp4**, dostępny przez7 dni od udanego uruchomienia.
Zawiera `robot-dance.mp4` i metadane `robot-dance.json` z rewizją oraz hashem modelu.
Format:720×1280,40 sekund,24fps,960 klatek, H.264/yuv420p, bez ścieżki dźwiękowej.
Nie zawiera interfejsu strony. Kamera jest stała, frontowa, z zapasem na ruch.

Eksport używa tego samego opublikowanego GLB i materiałów Three.js co Pages.
Playwright ustawia dokładne czasy klatek0/24…959/24; nie nagrywa czasu rzeczywistego.
FFmpeg koduje obraz, a ffprobe sprawdza wymiary, kodek, liczbę klatek, czas i brak audio.
Blender, API AI i sekrety nie są potrzebne. MP4 nie trafia do repo ani automatycznie
na Pages. Dźwięk trzeba dołączyć osobno, jeśli właściciel zdecyduje o publikacji z muzyką.

Lokalnie: `npm ci`, `npx playwright install chromium`, instalacja ffmpeg,
`npm run build`, `npm run robot:mp4`. Próba krótka:
`npm run robot:mp4 -- --width 360 --duration 0.5 --out /tmp/robot-smoke.mp4`.
Obsługiwane szerokości360/720/1080; czas musi mieścić się w40s i siatce24fps.
Tryb strony `robot.html?export=1` zatrzymuje autoplay i udostępnia renderRobotFrame(time),
z walidacją czasu; zwykły viewer zachowuje przyciski i obracanie modelu.

Weryfikacja przed uruchomieniem pełnego renderu: próbny MP4 360×640,0.5s,12 klatek
przeszedł ffprobe. Testy Node38/38. Niezależny robot_mp4_review: PASS kodu i zabezpieczeń;
wszystkie960 klatek mieszczą się w kamerze eksportowej (maksimum NDC0.8866).
Dodano sprawdzenie skończonego czasu ffprobe. Tryb eksportu wymusza pixel ratio1,
więc rozdzielczość pliku nie zależy od ekranu/urządzenia przeglądarki.
