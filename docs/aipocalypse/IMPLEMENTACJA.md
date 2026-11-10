# AIpokalypse — propozycje implementacji

**Status: propozycja do draft PR, nie wdrożony pipeline. Stan analizy: 10 listopada 2026.**

Punktem odniesienia jest [polski scenariusz](SCENARIUSZ_PL.md): 870 sekund, 22 sekwencje, globalne lokalizacje, tragiczna eskalacja i nuklearny finał. Celem jest film YouTube, a nie obowiązek renderowania całej produkcji na żywo w przeglądarce telefonu.

## 1. Wymagania

| ID | Kryterium |
|---|---|
| AC-001 | Zachować pełny scenariusz PL, 22 sekwencje i plan 14:30. |
| AC-002 | Brak protagonisty, montażu odbudowy i uspokajającego zakończenia. |
| AC-003 | Hacked by AIpokalypse na urządzeniu lub z głośnika w każdej scenie lokalizacyjnej. |
| AC-004 | Możliwość sterowania pracą z telefonu: opis poprawki → zmiana repo → zdalny render → MP4 i klatki do oceny. |
| AC-005 | Sceny, modele i ruchy dają się powtarzalnie poprawiać przez skrypty i konfigurację. |
| AC-006 | Zmierzyć działanie krótkiego renderu przed wyborem infrastruktury całego filmu. |
| AC-007 | Eksport końcowy z zsynchronizowanym dźwiękiem, czytelnymi napisami i prawidłową długością. |
| AC-008 | Oddzielić podgląd, kosztowne renderowanie i publikację. Nie używać draft PR jako automatycznego wyzwalacza płatnego renderu. |

Proponowany format końcowy: 1920×1080, 24 kl./s, MP4 H.264/AAC oraz osobne napisy PL. Są to ustawienia do potwierdzenia próbką, nie parametry już istniejącego eksportera AIpokalypse.

## 2. Co rzeczywiście istnieje w repozytorium

Analiza bazuje na `main` z commita `a5cfecd1d3e255bb138db73a63fe2c6d0756a8f2`. Nie zakładamy obecności zmian z innych, niezależnych branchy.

| Element | Dowód w repo | Znaczenie |
|---|---|---|
| Three.js i narzędzia przeglądarkowe | `package.json`, `src/`, `scripts/export-film.mjs` | Istnieje podstawa do podglądu i renderowania klatek, ale eksporter obsługuje obecnie `meadow` i `garden`, nie AIpokalypse. |
| Blender w Actions | `.github/workflows/robot-model.yml`, `experiments/dancing-robot/generator.py` | Istnieje generowanie modelu i pojedynczej klatki; nie jest to gotowy pipeline pełnego filmu w Blenderze. |
| MP4 i kontrola pliku | `scripts/export-film.mjs`, `scripts/export-validation.mjs` | Przydatne wzorce obsługi FFmpeg, klatek i ffprobe; konieczna adaptacja do ujęć długiego filmu. |
| Ręczne workflow eksportu | `.github/workflows/export-mp4.yml`, `.github/workflows/robot-mp4.yml` | Eksporty są ograniczone warunkami zaufanego wykonania; nie działają automatycznie na dowolnym branchu. |
| CI i Pages | `.github/workflows/ci.yml` | Zdarzenia `push` na `main` i `workflow_dispatch`; zmiany Markdown i `docs/**` są ignorowane dla push. Nie ma obecnie wyzwalacza `pull_request` w tym workflow. |
| Unreal Engine | Brak projektu Unreal w przejrzanym drzewie `main` | Wymaga osobnego przygotowania projektu, silnika, zasobów i środowiska renderowania. |

Istniejące CI nie dowodzi jakości artystycznej, a brak uruchomionego workflow na draft PR nie oznacza przejścia testów. W tym etapie nie zmieniamy reguł wykonywania istniejących filmów.

## 3. Porównanie wariantów

| Wariant | Obraz i kontrola | Zdalne wykonanie | Główne ograniczenie |
|---|---|---|---|
| A. Three.js + modele GLB + Playwright/FFmpeg | Duża kontrola kodem, łatwy podgląd; jakość zależy od modeli, światła i efektów | Najbliższy obecnemu repo; możliwe uproszczone renderowanie programowe | Ludzie, efekty i długi eksport wymagają znacznie więcej pracy niż krótki taniec. |
| B. Blender + Python + render ujęć + FFmpeg | Modelowanie, rig, kamera, światło i kompozycja w jednym środowisku | Cycles może renderować na CPU; szybsze warianty GPU i EEVEE wymagają odpowiedniego środowiska | Render na CPU może być zbyt wolny; istniejący generator robota nie rozwiązuje wszystkich scen. |
| C. Unreal + skrypty edytora + Sequencer + Movie Render Pipeline | Dobre zaplecze do rozbudowanych scen filmowych, kamer i zasobów | Przygotowany runner z GPU; sterowanie przez Actions bez instalacji na telefonie | Większy koszt startowy konfiguracji i zależność od zgodnego GPU, sterowników, wersji silnika oraz dostępu do zasobów. |

### Rekomendacja robocza

Najpierw sprawdzić wariant C krótką próbą, ponieważ odpowiada pytaniu użytkownika o filmowy Unreal obsługiwany z telefonu. Nie wybierać go ostatecznie przed dowodem działania. Jeśli środowisko GPU, czas przygotowania lub koszt okażą się nieakceptowalne, ocenić B. Wariant A pozostaje przydatny do animatiku i szybkiego podglądu.

Nie budować od razu trzech pełnych implementacji. Wspólny opis ujęć pozwala zachować storyboard i montaż podczas zmiany renderera.

## 4. Obsługa z telefonu i rola CI

1. Użytkownik opisuje zmianę w ChatGPT na telefonie.
2. Zmiana trafia do skryptu lub danych ujęcia na branchu.
3. Lekkie kontrole sprawdzają dane i zasoby bez GPU.
4. Osobno, ręcznie uruchomiony render przetwarza wskazane ujęcie i zakres klatek na zatwierdzonej rewizji.
5. Workflow udostępnia MP4, kilka klatek, kontaktówkę i metryki. Telefon służy do oceny.
6. Kolejna poprawka przelicza dotknięte ujęcie, a nie całe 14:30.

Unreal/Blender instalujemy na maszynie wykonawczej, nie na telefonie. GitHub Pages może pokazywać odtwarzacz gotowego filmu lub lekki podgląd; nie uruchamia serwerowego edytora Unreal ani renderowania GPU. Duże filmy mogą wymagać osobnego magazynu, zależnie od rozmiaru.

## 5. Próba techniczna Unreal — proponowany pierwszy etap

**Zakres 5–10 sekund:** mały fragment mokrej ulicy, samochód z kamerą i fizyczna tablica pokazująca dokładnie Hacked by AIpokalypse. Najpierw prosty ruch, bez symulacji zderzenia, tłumu i finalnych zasobów. Celem jest sprawdzenie powtarzalnego renderowania, nie udawanie skończonej sceny filmu.

**Warunki wejścia:**

- Wybrana, przypięta wersja Unreal i dostępny obraz maszyny lub prywatny obraz kontenera zgodny z warunkami dystrybucji silnika.
- Dostęp do wymaganych materiałów Epic i akceptacja odpowiednich warunków przez właściciela konta. Publiczny projekt zawiera własne skrypty/konfigurację, a nie redystrybucję silnika.
- Działający GPU, sterownik, interfejs graficzny obsługiwany przez wybraną wersję i wystarczająca pamięć/dysk.
- Wybrany runner, limit kosztów, timeout i miejsce przechowania rezultatów. Tych zasobów nie zweryfikowano na koncie użytkownika i nie utworzono w tym PR.

**Proponowany przebieg:**

1. Sprawdzić dostępność silnika i GPU.
2. Pobrać dokładny commit oraz zweryfikowane zasoby.
3. Skryptem edytora przygotować/importować zasoby i utworzyć prostą sekwencję kamery.
4. Zapisać scenę i sekwencję. Uruchomić osobny etap renderowania przez Movie Render Pipeline. Python edytora nie jest zakładany jako zwykły runtime spakowanej aplikacji.
5. Wyrenderować ponumerowane klatki, złożyć MP4, odczytać parametry ffprobe.
6. Zapisać metryki: wersja silnika, GPU, commit, czas uruchomienia, przygotowania shaderów i renderowania, liczba klatek, rozmiar plików, koszt rzeczywisty jeśli dostępny.
7. Ponowić ten sam zakres i sprawdzić stabilność czasu, kamer i wyniku. Identyczne bajty nie są wymagane bez dodatkowego ustalenia deterministyczności renderera.

**Warunek sukcesu:** MP4 do odtworzenia na telefonie, komplet klatek i poprawny czas, czytelna tablica, wykonanie bez ręcznej interakcji w edytorze po starcie zadania, brak brakujących materiałów. Komenda CLI i szczegóły API zostaną dobrane do wybranej wersji silnika po próbie; nie dołączamy nieprzetestowanych poleceń jako gotowego rozwiązania.

### Wybór maszyny

- GitHub-hosted większy runner z GPU: wymaga sprawdzenia uprawnień, planu organizacji i aktualnie dostępnej konfiguracji. Nie zakładamy dostępności na koncie osobistym.
- Własny runner na wynajętej maszynie GPU: może wykonywać zadania Actions; wymaga przygotowania maszyny i zasad jej uruchamiania/wyłączania. Rozliczenie i dostęp to osobna decyzja.
- Zwykły `ubuntu-latest`: dobry do lekkich kontroli i montażu; nie traktujemy go jako zapewnionego filmowego środowiska Unreal z GPU.

Repo ma obecnie warunki `refs/heads/main` w ręcznych eksportach. Próba na branchu potrzebuje dedykowanej, uzgodnionej ścieżki wykonania: np. zaufanego ręcznego workflow sterującego zatwierdzonym SHA projektu. Nie usuwamy zabezpieczeń istniejących workflow i nie zakładamy, że samo dodanie `workflow_dispatch` do pliku brancha daje od razu wygodny przycisk uruchomienia na stronie Actions. Sposób dispatch należy sprawdzić przy implementacji.

## 6. Wspólna struktura ujęć — propozycja

Poniższe ścieżki są planem, nie plikami już zaimplementowanymi:

- `films/aipocalypse/manifest.json`: język, fps, rozdzielczość, kolejność 22 sekwencji.
- `films/aipocalypse/shots/`: konfiguracje ujęć, czas, kamera, referencje zasobów i moment podpisu AI.
- `films/aipocalypse/audio/`: zatwierdzone dialogi, narrator, podpis AI i metadane praw do dźwięku.
- `films/aipocalypse/assets/manifest.json`: źródło, licencja, wersja i suma kontrolna każdego zasobu.
- `experiments/aipocalypse-unreal/`: izolowana próba i skrypty przygotowania projektu Unreal.
- `experiments/aipocalypse-blender/`: alternatywny renderer, tylko jeśli wybierzemy ten wariant.
- Wyniki ujęć i manifest renderu w artefaktach/magazynie, nie tysiące klatek w zwykłym Git.

Każde ujęcie otrzymuje stały identyfikator, przedział klatek i źródłowy commit. Kamera, zasoby oraz podpis są opisywane danymi; renderer interpretuje je po swojemu. To nie gwarantuje automatycznego przenoszenia materiałów, symulacji i rigów między silnikami — takie elementy nadal wymagają adaptacji.

## 7. Realizacja obrazu i dźwięku

| Grupa scen | Propozycja |
|---|---|
| Skrzyżowanie, auto, fabryka | Modele 3D i kontrolowana animacja; nie polegać na przypadkowej symulacji w kolejnych renderach. |
| Ludzie i zbliżenia | Modele z poprawnym riggingiem, bazowe animacje z ustalonymi prawami, ręczne/skryptowe dopracowanie kontaktu dłoni, stóp i spojrzeń. |
| Miasta, port, Antarktyda | Geometria pierwszego planu, oszczędne tła 2,5D dla odległych elementów, jeśli kamera nie ujawni ich płaskości. |
| Habitat i orbita | Kilka powracających modułów wnętrza, szczegółowe światło, mało ale świadomych ruchów kamery. |
| Rakiety i detonacje | Efekty i kompozycja w odrębnych ujęciach; zachować elipsę czasu lotu i fizykę dźwięku ze scenariusza. |
| Monitory i tablice | Osobne, ostre tekstury/interfejsy lub kompozycja śledząca powierzchnię; podpis czytelny także po kompresji MP4. |
| Dialogi i narrator | Zatwierdzone pliki audio, zsynchronizowane z osią czasu; nie polegać na głosie urządzenia widza przy eksporcie końcowym. |
| Głos AI | Jedna zatwierdzona próbka z wariantami akustyki urządzeń. |

Generowane obrazy mogą służyć jako referencje lub tła. Nie są obowiązkowym zamiennikiem kontrolowanej animacji ujęć. Dwa narracyjne zdania oraz finałowa cisza pozostają zgodne ze scenariuszem.

## 8. Skala renderowania i kontrola kosztu

870 sekund × 24 kl./s = **20 880 klatek**. To rachunek liczby klatek, nie benchmark czasu renderu. Należy zmierzyć koszt reprezentatywnych ujęć osobno: wnętrze z ludźmi, ulica i efekty. Czas startu silnika i przygotowania shaderów również wlicza się do kosztu.

Propozycja: szkicowe podglądy w niższej jakości, pełna jakość dopiero dla zatwierdzonych ujęć; renderowanie zakresami z zachowaniem wyników i możliwością wznowienia; ograniczona liczba jednoczesnych zadań; timeout oraz sprzątanie/wyłączenie wynajętej maszyny także po błędzie. Długość ujęć i limity pojedynczego zadania dobierzemy z pomiarów, nie ze zgadywanego czasu całego filmu.

Nie uruchamiać płatnych zadań z niezaufanych PR. Samo ustawienie flagi draft nie zastępuje kontroli wyzwalaczy i dostępu runnera. Zakresy renderu, jakość i rewizja powinny być walidowanymi parametrami, a nie dowolnym poleceniem shell z wejścia workflow.

## 9. Etapy i bramki odbioru

| Etap | Rezultat | Warunek przejścia |
|---|---|---|
| 0 — ten draft | Scenariusz PL i propozycje rozwiązania | Zachowana źródłowa treść i dostępny draft PR. |
| 1 — próba infrastruktury | 5–10 s zdalnego renderu | Powtarzalny MP4, parametry i pomiar kosztu/czasu; decyzja o silniku. |
| 2 — próbka artystyczna | Około 30–45 s reprezentatywnych ujęć | Ocena użytkownika: ludzie, kamera, atmosfera i czytelność napisu. |
| 3 — animatik | Pełne 14:30, proste modele i roboczy dźwięk | Działa dramaturgia, narastanie tragedii, czas startów i ostatnie 25 s. |
| 4 — realizacja sekwencji | Zatwierdzane fragmenty filmu | Brak przeskoków wyglądu postaci, poprawna geometria i synchronizacja. |
| 5 — montaż końcowy | MP4, napisy PL, metadane i prawa zasobów | Pełne obejrzenie na telefonie i dużym ekranie; brak błędów dźwięku, czasu i klatek. |
| 6 — publikacja | Uzgodnione miejsce docelowe | Oddzielna autoryzowana decyzja o publikacji. |

## 10. Decyzje otwarte

1. **Silnik końcowy:** wybrać po próbie; Unreal jest kandydatem, nie obietnicą gotowej infrastruktury.
2. **Runner GPU i budżet:** niezweryfikowane konto/plan i brak zaakceptowanego limitu wydatków. Nie blokuje dodania dokumentacji i draft PR.
3. **Zasoby:** styl lekko stylizowany czy bliski realizmowi; wybór po próbce. Przy modelach zewnętrznych potrzebne prawa do użycia i odpowiedni zapis pochodzenia.
4. **Głosy i muzyka:** robocze źródła offline vs zatwierdzone nagrania końcowe; bez samoczynnego kupowania usług.
5. **Docelowy hosting dużego MP4:** zdecydować po poznaniu rozmiaru; Pages może być odtwarzaczem, a nie magazynem pełnej produkcji.

## 11. Dokumentacja techniczna do implementacji

Oficjalne źródła sprawdzone podczas rozmowy poprzedzającej ten draft; szczegóły wersji i dostępności ponownie sprawdzić przy wdrożeniu:

- Unreal — Python w edytorze: https://dev.epicgames.com/documentation/unreal-engine/scripting-the-unreal-editor-using-python
- Unreal — renderowanie przez CLI: https://dev.epicgames.com/community/learning/tutorials/nZ2e/command-line-rendering-with-unreal-engine-movie-render-queue
- Unreal — Movie Render Pipeline: https://dev.epicgames.com/documentation/unreal-engine/movie-render-pipeline-in-unreal-engine
- Unreal — kontenery: https://dev.epicgames.com/documentation/unreal-engine/overview-of-containers-in-unreal-engine
- GitHub — większe runnery i GPU: https://docs.github.com/en/actions/how-tos/manage-runners/larger-runners/manage-larger-runners
- Blender — silnik Cycles, CPU/GPU: https://www.blender.org/features/rendering/
- Three.js — scena i pętla renderowania: https://threejs.org/manual/pages/creating-a-scene.html

**Granica tego etapu:** dokumentacja projektu i przygotowanie propozycji. Nie wykonano renderu Unreal, nie zmierzono GPU, nie zbudowano generatora filmu i nie wdrożono nowego CI. Testy poprzednich filmów nie dowodzą działania przyszłego renderera.
