# AIpokalypse — aktualna propozycja implementacji

**Stan: 10 listopada 2026. Aktualny kierunek: Android APK jako jedyny początkowy produkt pipeline; EXE później. Decyzja użytkownika zawęża DEC-AIP-002. To plan, nie wdrożony renderer.**

[Obowiązujący plan działania APK i retencji artefaktów](PLAN_DZIALANIA.md).

[Pełny wynik rady i warunki decyzji](RADA_TECHNOLOGICZNA.md) · [Scenariusz PL](SCENARIUSZ_PL.md)

## Obowiązujące ograniczenia

- Vibe coding i sterowanie projektem przez ChatGPT na telefonie.
- Brak kupowania runnerów GPU, wynajmu GPU i dodatkowych płatnych maszyn renderujących.
- Brak generowania wideo i ujęć przez modele AI. Dozwolone obrazy z ChatGPT jako tekstury, referencje i tła oraz kod budujący geometrię i animację.
- Narzędzia produkcyjne uruchamia CI/CD. Na komputerze użytkownika nie instalujemy edytorów, Visual Studio, Dockera, Blendera, Unity ani Unreal.
- Pierwszy produkt: Android APK. Windows EXE, eksport MP4 i wersja webowa są odłożone na później; początkowy pipeline ich nie generuje.
- Telefon odbiorcy renderuje animację swoim układem graficznym. To nie jest zakup runnera GPU. Wymagania i wydajność potwierdzamy na urządzeniu.
- Wszystkie przesyłane artefakty workflow w repo mają jawne `retention-days: 1`, również Pages i przyszły APK.

## Rekomendowany kandydat: Godot + Blender/Python

**Blender w trybie bez interfejsu tworzy modele; Godot odtwarza film jako oskryptowaną animację 3D.** Obrazy z ChatGPT są zasobami graficznymi, nie wygenerowanymi klipami. Wersja standardowa Godota z GDScript ogranicza liczbę zależności CI; nie jest potrzebny własny build silnika ani lokalne IDE użytkownika.

| Etap | Gdzie się wykonuje | Rezultat |
|---|---|---|
| Opis zmiany i wygenerowanie kodu | ChatGPT na telefonie | Zmiany w repozytorium |
| Geometria, szkielety, eksport modeli | Blender/Python na standardowym CI CPU | GLB, manifesty i weryfikacja geometrii |
| Sceny, kamery, oś czasu i dźwięk | Skrypty/dane Godota przygotowane w repo | Projekt z 22 sekwencjami |
| Import, kontrola skryptów i eksport | Godot bez UI oraz Android SDK/JDK w CI | Podpisany testowy APK, jedyny początkowy cel eksportu |
| Odtwarzanie | Zainstalowany APK na Androidzie | Obraz renderowany w czasie odtwarzania i dźwięk |
| Ocena postępów na telefonie | Pobranie artefaktu Actions przed upływem 1 dnia i instalacja APK | Ocena bezpośrednio na urządzeniu, bez eksportu EXE/web |
| Wideo na YouTube | Osobna funkcja zapisu uruchamianej aplikacji | Zapis klatek/filmu i konwersja do MP4 do implementacji |

Eksport aplikacji nie wymaga renderowania całych 20 880 klatek w CI. Nie jest jednak testem jakości obrazu: poprawny build bez UI może nadal zawierać błędy materiałów, kamery lub wydajności. Gotowy Windows EXE nie uruchamia się natywnie na Androidzie i nie jest potrzebny w pierwszym etapie.

Godot eksportuje aplikację z silnikiem runtime; użytkownik instaluje tylko APK, bez edytora i SDK. Artefakt Actions pobiera jako archiwum, rozpakowuje i instaluje APK. Klucz podpisu testowych aktualizacji musi być stabilny, a numer wersji rosnąć. Windows pozostaje osobnym późniejszym celem.

## Pozostałe możliwości

| Technika | Ocena w tych ograniczeniach |
|---|---|
| Blender → GLB → Three.js | Najmniejszy koszt wykorzystania istniejącego repo i najłatwiejsza droga do podglądu telefonicznego. Alternatywa dla Godota, gdy priorytetem jest przeglądarka. |
| Blender/Cycles → pełny MP4 na CPU CI | Możliwe technicznie, lecz czas całego filmu nie został zmierzony. Nie wybieramy jako domyślnej produkcji 14:30. |
| Babylon.js | Możliwy, ale migracja nie usuwa ograniczeń przeglądarki i eksportu CPU; brak wykazanej przewagi nad istniejącym Three.js. |
| Unreal/Unity → aplikacja | Brak GPU w CI nie wyklucza samego budowania programu. Nie rekomendujemy ich tutaj ze względu na większy ciężar konfiguracji, zależności, zasobów i utrzymania. |

Nie budować równolegle dwóch kompletnych rendererów. Najpierw sprawdzić Godota na Androidzie. Jeśli próba APK nie wykaże korzyści, wrócić do decyzji technologicznej; nie dodawać samoczynnie równoległego eksportu webowego. Godot Web korzysta z Compatibility; nie obiecujemy identyczności obrazu z desktopowym Forward+.

## Styl i organizacja filmu

Poważne, stylizowane 3D o realistycznych proporcjach. Nie obiecywać fotorealistycznych twarzy. Potrzebne są poprawne sylwetki, współdzielone szkielety, kontrola stóp i dłoni, spojrzeń oraz braku przenikania geometrii. Sam silnik nie poprawi automatycznie modeli znanych z wcześniejszych filmów.

Pierwszy plan pozostaje przestrzenny: człowiek, podłoga, drzwi, samochód i elementy kontaktu. Obrazy mogą tworzyć panoramy i wielowarstwowe dalekie tło przy ograniczonych ruchach kamery. Ruch wokół płaskiej ilustracji nie da prawidłowej paralaksy. Sceny i modele powstają z kodu, nie z usługi generowania wideo.

Kamera, ruch, efekty i kolizje są zapisane na osi czasu, a nie zależne od swobodnej fizyki podczas każdego odtworzenia. Ładujemy sekwencje etapami, nie całą planetę jednocześnie. Renderer i limity świateł, cieni, tekstur oraz tłumów ustalamy z pomiaru docelowego sprzętu.

## Próba rozstrzygająca

1. **5–10 sekund — dowód techniczny:** CI generuje model, importuje go w przypiętej wersji Godota i eksportuje wyłącznie Android APK. Ujęcie: auto, jedna postać, kamera i fizyczny ekran z Hacked by AIpokalypse. Instalacja na telefonie i pomiar startu, płynności, pamięci, rozmiaru i czasu builda.
2. **Ścieżka oceny telefonem:** bezpośrednia instalacja i odtworzenie APK. Kontrole bez UI oraz emulator sprawdzają tylko określone aspekty; zrzuty nie zastępują oceny jakości ruchu na urządzeniu.
3. **20–30 sekund — próba artystyczna:** ulica, człowiek przy telefonie i wnętrze orbitalne. Ocena sylwetek, światła, dźwięku, kamer, czytelności logo i różnicy względem poprzednich animacji.
4. Dopiero po próbie wybór silnika i animatik 14:30, następnie dopracowywanie sekwencji.

Brak udanego podglądu telefonicznego jest problemem procesu pracy, a nie powodem do samoczynnego uruchamiania płatnego GPU. Brak zgodności sprzętu wymaga lżejszego renderera lub zmiany wariantu. Nie wykonano jeszcze eksportu Godota ani próby APK na docelowym telefonie.

## EXE a film na YouTube

EXE odtwarzający animację nie jest gotowym MP4. Godot ma Movie Maker Mode dostępny również w wyeksportowanych projektach. Proponujemy zaprojektować w aplikacji uruchomienie zapisu, a potem konwersję wyniku do MP4, jeśli nadal potrzebna będzie publikacja na YouTube. To osobna funkcja, z wymaganiami dotyczącymi klatek, miejsca na dysku i synchronizacji dźwięku; nie została jeszcze zaimplementowana. Użytkownik nie musi instalować edytora do takiej funkcji.

Tryb headless służący do importu/eksportu aplikacji nie jest zapewnionym sposobem uzyskania finalnego obrazu bez renderera. Pełny film ma 870 × 24 = 20 880 klatek. Nie obiecujemy jego szybkiego renderowania na CPU w Actions. Standardowe CI również ma limity czasu, przestrzeni i rozliczeń zależne od planu; zakaz zakupu GPU nie oznacza nieograniczonego budżetu CI.

## Stan repo i następne zmiany

Na rewizji `2256f5e0796a5adb91d4e5436180c1a50ebdae5b` istnieją Three.js, generator Blendera oraz eksportery Playwright/FFmpeg. Eksporter przeglądarkowy korzysta z programowego SwiftShader. Brak projektu Godot i jego workflow; niniejszy dokument nie oznacza ich wdrożenia. Istniejące workflow mają ograniczenia wykonania do main, więc osobny eksperyment trzeba zaplanować bez zdejmowania dotychczasowych zabezpieczeń.

Kolejna implementacja ma dodać izolowany eksperyment Android, przypięte wersje Godota, szablonów eksportu i narzędzi Android, generator zasobów, dane osi czasu oraz kontrolowany workflow CPU z artefaktem APK na 1 dzień. Produkcja nie wymaga wynajmu maszyny ani usług generowania wideo.

## Dokumentacja pierwotna

- Godot CLI i headless export: https://docs.godotengine.org/en/stable/tutorials/editor/command_line_tutorial.html
- Eksport Android: https://docs.godotengine.org/en/stable/tutorials/export/exporting_for_android.html
- Renderery: https://docs.godotengine.org/en/stable/tutorials/rendering/renderers.html
- Movie Maker Mode: https://docs.godotengine.org/en/stable/tutorials/animation/creating_movies.html
- Godot Web: https://docs.godotengine.org/en/stable/tutorials/export/exporting_for_web.html
- Blender rendering CPU/GPU: https://www.blender.org/features/rendering/

**Wykonano:** analizę istniejącego repo, niezależną radę i sprawdzenie dokumentacji. **Nie wykonano:** instalacji Godota, benchmarku, eksportu APK ani nowego workflow. Decyzja pozostaje warunkową rekomendacją do próby.
