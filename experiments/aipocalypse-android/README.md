# AIpokalypse — Android, etap 0

To techniczna próbka, nie gotowy film: logo użytkownika, model samochodu 3D, przestrzenny napis i osiem sekund ruchu. Model powstaje skryptem Blendera w CI, a ruch i interfejs w GDScript; bez usług generowania wideo.

- Start uruchamia lub wznawia animację i krótki sygnał testowy. Po zakończeniu Start odtwarza od początku.
- Pauza zatrzymuje zegar i sygnał. Restart ustawia początek i pozostawia pauzę.
- Przejście w tło zatrzymuje odtwarzanie; powrót wymaga Start.
- Telefon: orientacja pozioma, ARM64, renderer Compatibility.

Logo jest kopiowane z `docs/aipocalypse/assets/logo.jpg` podczas przygotowania. Silnik Godot jest dostępny na licencji MIT; pełna treść w `GODOT_LICENSE.txt` jest dołączona do projektu. Logo: kpok, wszystkie prawa zastrzeżone.

## Odbiór na telefonie

Po pobraniu podpisanego APK z Actions sprawdź logo i czytelność napisu, wszystkie trzy przyciski, dźwięk, automatyczny koniec po 8 s, pauzę po przełączeniu aplikacji i instalację kolejnego builda bez odinstalowania. Testy headless nie potwierdzają wyglądu, wydajności ani działania na urządzeniu.

## Konfiguracja podpisu w repozytorium

W Settings → Secrets and variables → Actions dodaj trzy repository secrets:

- `AIPOCALYPSE_KEYSTORE_BASE64`: zawartość stałego keystore zakodowana Base64.
- `AIPOCALYPSE_KEYSTORE_PASSWORD`: hasło magazynu i prywatnego klucza (muszą być takie same).
- `AIPOCALYPSE_KEY_ALIAS`: alias klucza.

Klucz należy utworzyć raz, zachować jego bezpieczną kopię i używać we wszystkich aktualizacjach. Nie umieszczać go w Git, artefaktach ani cache. Pipeline nie tworzy zastępczego klucza. Bez sekretów przeprowadza eksport unsigned, a potem zatrzymuje publikację. Stały identyfikator: `org.cartoonai.aipocalypse`; versionCode rośnie według numeru uruchomienia workflow. Ponowienie tego samego run ma ten sam numer.

Workflow uruchamia push właściciela na `feat/aipocalypse-film` lub ręczne uruchomienie właściciela na tym branchu/main. Artefakt `aipocalypse-android` zawiera APK i SHA256 przez jeden dzień. W razie wygaśnięcia uruchom build ponownie.

## Próbka 0.2 — model samochodu

Klocek zastępuje czerwone auto generowane przez `generate_car.py` w Blenderze. Nadwozie pozostaje pionowo, cztery koła obracają się według przebytej drogi. Start/Pauza/Restart i osiem sekund odtwarzania działają jak poprzednio. To nadal próba modelu; droga i ujęcie skrzyżowania są następnym etapem.

Pipeline pobiera Blender 4.2.0 ze sprawdzeniem SHA256, tworzy samowystarczalny GLB przed importem Godota i nie przechowuje modelu w Git. Generator: GPL-3.0-or-later (pełna licencja w `../dancing-robot/LICENSE`); model proceduralny projektu: CC-BY-4.0, autor kpok. Model nie zawiera zewnętrznych tekstur ani modeli. Budżety sprawdzane podczas generacji/importu: 2 MB i 20 tys. trójkątów.

Nowy APK instaluje się jako aktualizacja poprzedniej próbki: ten sam application ID i klucz, większy versionCode. Potwierdzenie aktualizacji oraz wyglądu auta wymaga telefonu.
