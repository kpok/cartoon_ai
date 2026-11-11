# AIpokalypse — pełny animatik Android 0.6

Robocza wersja obejmuje cały film: **14:30, 22 sekwencje, 149 ujęć**. To narzędzie do oceny montażu i kolejności wydarzeń. Nie jest gotowym filmem ani finalną stylistyką.

Walidowany plan `production.json` jest kompilowany do `assets/animatic.json` podczas przygotowania projektu i CI. Modele auta i dwóch postaci powstają z kodu Blendera; Godot tworzy dekoracje i proste modele zastępcze urządzeń, infrastruktury i rekwizytów. Nie wszystkie wymienione w planie modele lub animacje mają docelową, indywidualną realizację. Gesty i ruchy są uproszczone; materiały, mimika, chwyt, przenikanie i ciągłość dekoracji wymagają dalszej pracy.

**Dźwięk pozostaje niegotowy:** dialogi i podpisy głosowe są napisami roboczymi, bez nagranych głosów, efektów i muzyki. Dotyczy to również końcowego „Hacked by AIpokalypse”: jego brak w ścieżce audio jest znanym brakiem, nie celową zmianą scenariusza. Czarne plansze i ich czasy są zachowane.

## Sterowanie i odbiór

- Start uruchamia lub wznawia; po końcu zaczyna od początku. Pauza zatrzymuje, Restart ustawia 0 s i pauzę.
- Suwak przewija całą oś czasu. Podczas przeciągania film jest zatrzymany; po puszczeniu wraca do poprzedniego stanu.
- Lista pozwala przejść do dowolnej z 22 sekwencji; przyciski przesuwają o 10 sekund.
- Obraz ukrywa sterowanie i uwagi, zachowując dialogi. Dotknięcie obrazu przywraca sterowanie.
- Finał od 14:05 automatycznie ukrywa sterowanie i napisy. Można je jawnie przywrócić dotknięciem.
- Przejście w tło zatrzymuje film; powrót wymaga Start. Aplikacja działa offline, w poziomie, na ARM64, w rendererze Compatibility.

Zainstalować jako aktualizację bez odinstalowania. Sprawdzić wszystkie sekwencje, czytelność napisów i ekranów, przewijanie w obie strony, pauzę, restart oraz powrót z tła. Wydajność i stabilność całego 14:30 wymagają sprawdzenia na telefonie.

## Narzędzia i zasoby

CPU CI używa przypiętych Blender 4.2.0 i Godot 4.6.3 z kontrolą SHA256. Generowane GLB i runtime JSON są ignorowane w Git. Generator postaci: GPL-3.0-or-later (pełna licencja w `../dancing-robot/LICENSE`); modele proceduralne projektu: CC-BY-4.0, autor kpok. Logo: kpok, wszystkie prawa zastrzeżone. Godot: MIT, licencja w `GODOT_LICENSE.txt`.

Karta stylu: `../../docs/aipocalypse/references/RATOWNIK.md`. Obrazy referencyjne nie są automatycznie używane jako tła. Poprzednia próbka 25 s pozostaje w `sample.tscn` na potrzeby testów modelu i gestu.

Kontrole obejmują kompilację planu, granice wszystkich ujęć, budowę 149 scen, ponowne skoki przez 22 sekwencje, ograniczoną liczbę węzłów, przewijanie, napisy, dokładne plansze finału, zgaśnięcie dzielnicy, zapłon i światło uderzenia. Testy próbki nadal kontrolują geometrię, szkielet i gest. Renderowane kadry Compatibility/Mesa służą kontroli kompozycji; testy headless nie potwierdzają jakości artystycznej.

APK jest sprawdzany pod kątem kompletnej osi filmu, ARM64, application ID, versionCode i braku uprawnienia Internet; następnie podpisu i wyrównania.

## Stały podpis i publikacja

Settings → Secrets and variables → Actions:

- `AIPOCALYPSE_KEYSTORE_BASE64`: stały keystore wBase64.
- `AIPOCALYPSE_KEYSTORE_PASSWORD`: to samo hasło magazynu i prywatnego klucza.
- `AIPOCALYPSE_KEY_ALIAS`: alias klucza.

Nie generować nowego klucza do aktualizacji, nie dodawać go doGit/artefaktów/cache. Bez sekretów publikacja zatrzymuje się. ApplicationID `org.cartoonai.aipocalypse`; versionCode rośnie według numeru uruchomieniaworkflow, rerun zachowuje numer.

Workflow właściciela na feat/aipocalypse-film lub ręcznie na tymbranchu/main. Publikuje podpisany APK+SHA256 w artefakcie aipocalypse-android przez1dzień. EXE, web i MP4 nie są częścią tego etapu.


