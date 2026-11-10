# AIpokalypse — aktualna propozycja implementacji

**Stan: 10 listopada 2026. Decyzja DEC-AIP-002 zastępuje wcześniejszą propozycję próby Unreal na wynajętym GPU. To rekomendacja do sprawdzenia, nie wdrożony renderer.**

[Pełny wynik rady i warunki decyzji](RADA_TECHNOLOGICZNA.md) · [Scenariusz PL](SCENARIUSZ_PL.md)

## Obowiązujące ograniczenia

- Vibe coding i sterowanie projektem przez ChatGPT na telefonie.
- Brak kupowania runnerów GPU, wynajmu GPU i dodatkowych płatnych maszyn renderujących.
- Brak generowania wideo i ujęć przez modele AI. Dozwolone obrazy z ChatGPT jako tekstury, referencje i tła oraz kod budujący geometrię i animację.
- Narzędzia produkcyjne uruchamia CI/CD. Na komputerze użytkownika nie instalujemy edytorów, Visual Studio, Dockera, Blendera, Unity ani Unreal.
- Dopuszczalny produkt: gotowa aplikacja uruchamiająca animację, np. Windows EXE/ZIP. GitHub Pages i technologia webowa nie są obowiązkowe.
- Dostępny komputer widza może renderować animację swoim układem graficznym. To nie jest zakup runnera GPU. Wymagania sprzętowe pozostają do ustalenia.

## Rekomendowany kandydat: Godot + Blender/Python

**Blender w trybie bez interfejsu tworzy modele; Godot odtwarza film jako oskryptowaną animację 3D.** Obrazy z ChatGPT są zasobami graficznymi, nie wygenerowanymi klipami. Wersja standardowa Godota z GDScript ogranicza liczbę zależności CI; nie jest potrzebny własny build silnika ani lokalne IDE użytkownika.

| Etap | Gdzie się wykonuje | Rezultat |
|---|---|---|
| Opis zmiany i wygenerowanie kodu | ChatGPT na telefonie | Zmiany w repozytorium |
| Geometria, szkielety, eksport modeli | Blender/Python na standardowym CI CPU | GLB, manifesty i weryfikacja geometrii |
| Sceny, kamery, oś czasu i dźwięk | Skrypty/dane Godota przygotowane w repo | Projekt z 22 sekwencjami |
| Import, kontrola skryptów i eksport | Godot uruchamiany bez UI w CI | Windows ZIP zawierający EXE i potrzebne dane/PCK |
| Odtwarzanie | Gotowa aplikacja na komputerze odbiorcy | Obraz renderowany w czasie odtwarzania i dźwięk |
| Ocena postępów na telefonie | Próbny eksport webowy tego samego projektu lub krótkie materiały podglądowe | Ścieżka do zweryfikowania, nie funkcja już istniejąca |
| Wideo na YouTube | Osobna funkcja zapisu uruchamianej aplikacji | Zapis klatek/filmu i konwersja do MP4 do implementacji |

Eksport aplikacji nie wymaga renderowania całych 20 880 klatek w CI. Nie jest jednak testem jakości obrazu: poprawny build bez UI może nadal zawierać błędy materiałów, kamery lub wydajności. Gotowy Windows EXE nie uruchamia się na Androidzie.

Godot eksportuje program wraz z silnikiem runtime; użytkownik nie instaluje edytora. Najprostsza dystrybucja to rozpakowanie ZIP i uruchomienie EXE z dołączonymi danymi. Pojedynczy samowystarczalny EXE nie jest na tym etapie wymaganiem. Każdą architekturę/system operacyjny trzeba potraktować jako osobny cel eksportu.

## Pozostałe możliwości

| Technika | Ocena w tych ograniczeniach |
|---|---|
| Blender → GLB → Three.js | Najmniejszy koszt wykorzystania istniejącego repo i najłatwiejsza droga do podglądu telefonicznego. Alternatywa dla Godota, gdy priorytetem jest przeglądarka. |
| Blender/Cycles → pełny MP4 na CPU CI | Możliwe technicznie, lecz czas całego filmu nie został zmierzony. Nie wybieramy jako domyślnej produkcji 14:30. |
| Babylon.js | Możliwy, ale migracja nie usuwa ograniczeń przeglądarki i eksportu CPU; brak wykazanej przewagi nad istniejącym Three.js. |
| Unreal/Unity → aplikacja | Brak GPU w CI nie wyklucza samego budowania programu. Nie rekomendujemy ich tutaj ze względu na większy ciężar konfiguracji, zależności, zasobów i utrzymania. |

Nie budować równolegle dwóch kompletnych rendererów. Najpierw sprawdzić Godota. Jeśli ocena z telefonu okaże się niewygodna albo próba nie wykaże korzyści, wybrać Three.js jako jedną bazę produkcji. Godot Web korzysta z Compatibility; nie obiecujemy identyczności obrazu z desktopowym Forward+.

## Styl i organizacja filmu

Poważne, stylizowane 3D o realistycznych proporcjach. Nie obiecywać fotorealistycznych twarzy. Potrzebne są poprawne sylwetki, współdzielone szkielety, kontrola stóp i dłoni, spojrzeń oraz braku przenikania geometrii. Sam silnik nie poprawi automatycznie modeli znanych z wcześniejszych filmów.

Pierwszy plan pozostaje przestrzenny: człowiek, podłoga, drzwi, samochód i elementy kontaktu. Obrazy mogą tworzyć panoramy i wielowarstwowe dalekie tło przy ograniczonych ruchach kamery. Ruch wokół płaskiej ilustracji nie da prawidłowej paralaksy. Sceny i modele powstają z kodu, nie z usługi generowania wideo.

Kamera, ruch, efekty i kolizje są zapisane na osi czasu, a nie zależne od swobodnej fizyki podczas każdego odtworzenia. Ładujemy sekwencje etapami, nie całą planetę jednocześnie. Renderer i limity świateł, cieni, tekstur oraz tłumów ustalamy z pomiaru docelowego sprzętu.

## Próba rozstrzygająca

1. **5–10 sekund — dowód techniczny:** CI generuje model, importuje go w przypiętej wersji Godota i eksportuje Windows ZIP. Ujęcie: auto, jedna postać, kamera i fizyczny ekran z Hacked by AIpokalypse. Uruchomienie na docelowym komputerze bez edytorów. Pomiar startu, płynności, pamięci, rozmiaru i czasu builda.
2. **Ścieżka oceny telefonem:** próba webowa tego samego projektu w Compatibility albo krótki materiał podglądowy po zmierzeniu renderowania CPU. Zrzuty mogą służyć do oceny pojedynczych kadrów, ale nie dowodzą jakości ruchu.
3. **20–30 sekund — próba artystyczna:** ulica, człowiek przy telefonie i wnętrze orbitalne. Ocena sylwetek, światła, dźwięku, kamer, czytelności logo i różnicy względem poprzednich animacji.
4. Dopiero po próbie wybór silnika i animatik 14:30, następnie dopracowywanie sekwencji.

Brak udanego podglądu telefonicznego jest problemem procesu pracy, a nie powodem do samoczynnego uruchamiania płatnego GPU. Brak zgodności sprzętu wymaga lżejszego renderera lub zmiany wariantu. Na razie nie znamy parametrów docelowego komputera i nie wykonano eksportu Godota.

## EXE a film na YouTube

EXE odtwarzający animację nie jest gotowym MP4. Godot ma Movie Maker Mode dostępny również w wyeksportowanych projektach. Proponujemy zaprojektować w aplikacji uruchomienie zapisu, a potem konwersję wyniku do MP4, jeśli nadal potrzebna będzie publikacja na YouTube. To osobna funkcja, z wymaganiami dotyczącymi klatek, miejsca na dysku i synchronizacji dźwięku; nie została jeszcze zaimplementowana. Użytkownik nie musi instalować edytora do takiej funkcji.

Tryb headless służący do importu/eksportu aplikacji nie jest zapewnionym sposobem uzyskania finalnego obrazu bez renderera. Pełny film ma 870 × 24 = 20 880 klatek. Nie obiecujemy jego szybkiego renderowania na CPU w Actions. Standardowe CI również ma limity czasu, przestrzeni i rozliczeń zależne od planu; zakaz zakupu GPU nie oznacza nieograniczonego budżetu CI.

## Stan repo i następne zmiany

Na rewizji `2256f5e0796a5adb91d4e5436180c1a50ebdae5b` istnieją Three.js, generator Blendera oraz eksportery Playwright/FFmpeg. Eksporter przeglądarkowy korzysta z programowego SwiftShader. Brak projektu Godot i jego workflow; niniejszy dokument nie oznacza ich wdrożenia. Istniejące workflow mają ograniczenia wykonania do main, więc osobny eksperyment trzeba zaplanować bez zdejmowania dotychczasowych zabezpieczeń.

Po akceptacji kierunku implementacja powinna dodać izolowany eksperyment, przypięte wersje Godota i szablonów eksportu, generator zasobów, dane osi czasu oraz kontrolowany workflow CPU. Produkcja nie wymaga wynajmu maszyny ani usług generowania wideo.

## Dokumentacja pierwotna

- Godot CLI i headless export: https://docs.godotengine.org/en/stable/tutorials/editor/command_line_tutorial.html
- Eksport Windows: https://docs.godotengine.org/en/stable/tutorials/export/exporting_for_windows.html
- Renderery: https://docs.godotengine.org/en/stable/tutorials/rendering/renderers.html
- Movie Maker Mode: https://docs.godotengine.org/en/stable/tutorials/animation/creating_movies.html
- Godot Web: https://docs.godotengine.org/en/stable/tutorials/export/exporting_for_web.html
- Blender rendering CPU/GPU: https://www.blender.org/features/rendering/

**Wykonano:** analizę istniejącego repo, niezależną radę i sprawdzenie dokumentacji. **Nie wykonano:** instalacji Godota, benchmarku, eksportu EXE ani nowego workflow. Decyzja pozostaje warunkową rekomendacją do próby.
