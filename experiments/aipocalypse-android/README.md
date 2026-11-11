# AIpokalypse — próbka postaci Android0.3

APK zawiera25sekund próby, nie pełny film ani zatwierdzoną finalną stylistykę:

| Czas | Ujęcie |
|---|---|
|0–10s| Ratownik obok uproszczonej karetki, podnosi telefon |
|10–15s| Stabilny detal fizycznego telefonu i napisu Hacked by AIpokalypse |
|15–25s| Postać w module orbitalnym, ręczne radio, terminal i schematyczna Ziemia |

Generatory Blendera tworzą modele postaci z rzeczywistym szkieletem, skórą i5sekundowym klipem. Godot ustawia animację z jednego zegara; telefon/radio mocuje do right_hand. Astronautka lekko unosi się i obraca, bez kroku po podłodze. To uproszczone postacie i dekoracje. Twarze, naturalność chwytu, mimika, materiały i szczegóły wymagają dalszej pracy; ilustracja koncepcyjna jest znacznie bardziej szczegółowa od tej próbki.

## Sterowanie i odbiór

- Start uruchamia/wznawia, po zakończeniu odtwarza od początku. Krótki sygnał testowy; bez finalnych dialogów i muzyki.
- Pauza zatrzymuje zegar i sygnał. Restart ustawia0s i pozostawia pauzę.
- Przejście w tło zatrzymuje odtwarzanie; powrót wymaga Start.
- Orientacja pozioma, ARM64, Compatibility. LicznikFPS pomaga obserwować działanie na telefonie; pojedyncza klatka lub screenshot nie jest pomiarem wydajności.
- Zainstalować jako aktualizację, bez odinstalowania. Sprawdzić ruch ręki, mocowanie telefonu, ekran przez5s, zmianę ujęć przy10/15s, koniec25s, pauzę/restart i powrót z tła. Ocena wyglądu i przenikania wymaga obrazu oraz urządzenia.

## Narzędzia i zasoby

CPU CI pobiera przypięty Blender4.2.0 i Godot4.6.3, sprawdzaSHA256. Najpierw generuje car.glb, paramedic.glb i astronaut.glb, potem importuje do Godota. Generowane pliki są ignorowane wGit. Generator postaci:GPL-3.0-or-later (pełna licencja w `../dancing-robot/LICENSE`); modele proceduralne projektu:CC-BY-4.0, autor kpok. Logo:kpok, wszystkie prawa zastrzeżone. Godot:MIT, licencja wGODOT_LICENSE.txt i linku w aplikacji.

Źródło stylu i kontrakt postaci: `../../docs/aipocalypse/references/RATOWNIK.md`. Obrazy referencyjne nie są automatycznie używane jako tła.

Kontrole: testy całego planu filmu, import, test zachowanego podwozia auta, zegar25s, szkielet15kości/klip5s/skinning, budżet50tys.trójkątów na postać, telefon w3pozach, powtarzalny seek, stały detal, przejścia i restart. WalidacjaAPK sprawdza ARM64/applicationID/versionCode/offlinepermissions, następnie podpis i wyrównanie. Headless nie potwierdza jakości artystycznej; lokalnie sprawdzono również3kadry w Compatibility/Mesa llvmpipe.

## Stały podpis i publikacja

Settings → Secrets and variables → Actions:

- `AIPOCALYPSE_KEYSTORE_BASE64`: stały keystore wBase64.
- `AIPOCALYPSE_KEYSTORE_PASSWORD`: to samo hasło magazynu i prywatnego klucza.
- `AIPOCALYPSE_KEY_ALIAS`: alias klucza.

Nie generować nowego klucza do aktualizacji, nie dodawać go doGit/artefaktów/cache. Bez sekretów publikacja zatrzymuje się. ApplicationID `org.cartoonai.aipocalypse`; versionCode rośnie według numeru uruchomieniaworkflow, rerun zachowuje numer.

Workflow właściciela na feat/aipocalypse-film lub ręcznie na tymbranchu/main. Publikuje podpisany APK+SHA256 w artefakcie aipocalypse-android przez1dzień. EXE/web/MP4 nie są częścią tej próbki.
