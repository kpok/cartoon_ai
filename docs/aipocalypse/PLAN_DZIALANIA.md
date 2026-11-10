# AIpokalypse — plan działania: najpierw Android APK

**Decyzja użytkownika, 10 listopada 2026: pipeline AIpokalypse ma na tym etapie generować wyłącznie APK dla Androida. EXE odkładamy na później.**

To plan wdrożenia, nie informacja o istniejącym już workflow APK. W tym commicie zmieniamy dokumentację i politykę retencji obecnych workflow; nie implementujemy jeszcze aplikacji Godot.

## Stałe wymagania

- Kodowanie i ocena postępów z telefonu przez ChatGPT i GitHub.
- Godot standard/GDScript jako kandydat, modele tworzone kodem Blender/Python w CI bez interfejsu edytora.
- Standardowe runnery CPU; bez kupowania i wynajmowania GPU oraz bez usług generowania wideo/ujęć przez AI. Obrazy ChatGPT mogą być teksturami i referencjami.
- Pierwszy produkt: instalowalny APK, odtwarzający animację na układzie graficznym telefonu. Użytkownik nie instaluje edytorów ani SDK.
- Bez Windows EXE/ZIP, bez eksportu MP4 i bez drugiego renderera webowego w początkowym pipeline. Te cele są późniejszymi etapami, nie warunkami pierwszego APK.
- Zachować [scenariusz PL](SCENARIUSZ_PL.md), logo, 22 sekwencje i plan 14:30. Pierwsza próbka jest fragmentem, nie ukończonym filmem.
- Wszystkie przesyłane artefakty Actions w repozytorium: jawne `retention-days: 1`, również artefakt Pages. Zasada obejmuje obecne i przyszłe uploady, nie tylko APK.

## Etap 1 — minimalny projekt i próbka 5–10 sekund

1. Przypiąć zgodne wersje Godota, szablonów eksportu, Blendera, JDK i Android SDK; narzędzia instalowane tylko na runnerze. Zweryfikować sumy pobieranych plików i reguły obecnego audytu repo.
2. Dodać izolowany projekt Godot i prosty generator GLB: auto, jedna postać, przestrzenny ekran, kamera. Bez dodatkowych binarnych modeli z niewyjaśnionym pochodzeniem.
3. Wdrożyć odtwarzanie z jednego zegara sceny: start, pauza, restart, zakończenie. Pierwszy renderer dobrać do zgodności z telefonem; pomiary na urządzeniu rozstrzygają o jakości.
4. Ustawić Android jako jedyny preset eksportu pierwszego pipeline. ABI dla docelowego telefonu, początkowo ARM64; inne ABI wyłącznie jeśli wymaga tego emulator/test.
5. Ustalić stabilny identyfikator aplikacji, rosnący numer wersji i stały klucz podpisywania testowych APK, tak aby aktualizacja nie wymagała każdorazowego odinstalowania. Klucz i hasła poza Git, udostępniane tylko zaufanemu zadaniu; najpierw zaprojektować zgodny z polityką repo sposób konfiguracji.

**Odbiór:** próbka uruchamia się na prawdziwym Androidzie, ma czytelny podpis Hacked by AIpokalypse, poprawny kadr, ruch i dźwięk. Sukces budowania nie jest potwierdzeniem jakości ani płynności.

## Etap 2 — pipeline CPU z artefaktem APK

1. Zaplanować autoryzowane ręczne uruchomienie na zatwierdzonej rewizji brancha. Obecne workflow mają ograniczenia do main; nie usuwać ich globalnie, lecz dodać jawnie sprawdzoną politykę nowego zadania.
2. Checkout dokładnego SHA, przygotowanie przypiętych narzędzi, generacja modeli i manifestów, import zasobów w Godocie, kontrole opisane poniżej.
3. Eksport jednego podpisanego testowego APK. AAB/Google Play i instalatory desktopowe nie należą do tego etapu.
4. Publikować APK dopiero po kontrolach blokujących. Jeden artefakt, np. `aipokalypse-android-<run_id>`, zawiera APK oraz ewentualnie jego sumę kontrolną; `retention-days: 1`.
5. W podsumowaniu zadania podać rewizję, wersję narzędzi, czas builda, rozmiar, SHA-256 APK i wyniki testów. Nie publikować haseł ani materiału klucza.
6. Użytkownik pobiera artefakt z Actions, rozpakowuje archiwum artefaktu i instaluje APK na Androidzie. Pobranie trzeba wykonać przed jego wygaśnięciem; po dobie można zbudować ponownie tę samą rewizję.

**Odbiór:** pipeline nie buduje EXE i nie próbuje renderować całych 14:30 do wideo na CPU. Powstaje działający APK do oceny z telefonu, bez płatnych usług.

## Etap 3 — kontrole weryfikacyjne

| Warstwa | Kontrole | Co pozostaje poza dowodem |
|---|---|---|
| Dane scenariusza | 22 sekwencje, ciągłość osi czasu, 870 sekund pełnej wersji, obecność zaplanowanego podpisu w każdej scenie lokalizacyjnej | Deklaracja podpisu nie dowodzi jego czytelności na ekranie |
| Modele GLB | Poprawność pliku, wymiary, geometria, kości/animacje, brakujące tekstury, budżet zasobów i sumy | Sam walidator nie ocenia naturalności ruchu |
| Godot bez UI | Import, parsowanie, błędy wykonania logiki scen, start/pauza/restart i dojście do końca | Brak oceny obrazu i płynności GPU |
| APK | Poprawność pakietu/podpisu, identyfikator, wersja, ABI i wymagania Androida | Poprawny APK może nadal mieć błędy wizualne |
| Emulator, późniejsza kontrola | Instalacja, uruchomienie i brak awarii; obraz tylko jeśli działa programowy renderer | Nie odzwierciedla wydajności i sterowników prawdziwego telefonu |
| Prawdziwy telefon | Kadr, napis/logo, płynność, dźwięk, dotyk, pauza/wznowienie i zużycie pamięci | Wymaga rzeczywistego uruchomienia, nie samego zielonego CI |

Najpierw testy możliwe bez GPU, potem próba na urządzeniu. Emulator nie jest warunkiem pierwszego eksperymentu, jeśli opóźnia dostarczenie APK. Nie deklarować zakończenia próby urządzeniowej bez jej wykonania.

## Etap 4 — próbka artystyczna i animatik

- 20–30 sekund: skrzyżowanie, osoba z telefonem i wnętrze orbitalne. Ocena użytkownika na APK: proporcje ludzi, światło, kamera, brak przenikania i czytelność tekstu.
- Po zatwierdzeniu stylu pełny animatik 14:30 z prostymi zasobami i roboczym dźwiękiem; również dostarczany jako APK.
- Dopracowywanie sekwencji małymi commitami, z powrotami do powtarzalnych postaci i obiektów. Bez łagodzenia tragicznego finału.

## Później

EXE/Windows, inne platformy, MP4 i hosting webowy zostają w backlogu. Wspólne modele i dane osi czasu mają ułatwić ich dodanie, ale nie obiecują identyczności obrazu na wszystkich rendererach.

## Polityka artefaktów całego repo

Każdy krok `actions/upload-artifact` i `actions/upload-pages-artifact` ma jawne `retention-days: 1`. `scripts/check-workflows.mjs` wymusza tę wartość w każdym kontrolowanym workflow; regresje są objęte testem. Nowy workflow APK musi zostać włączony do istniejącej kontroli polityki, a nie ją omijać.

Retencja dotyczy plików przesyłanych do Actions, w tym przyszłego APK. Nie usuwa po dobie wdrożonej strony Pages ani kodu w Git. Nie zmienia wstecz dat wygaśnięcia starych artefaktów i nie jest zmianą retencji logów/cache. Nie wykonujemy automatycznego kasowania historii ani istniejących wyników.
