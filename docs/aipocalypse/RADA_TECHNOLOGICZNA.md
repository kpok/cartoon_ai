# DEC-AIP-002 — technologia AIpokalypse bez płatnego GPU

**Data:** 10 listopada 2026. **Status:** warunkowa rekomendacja; wymaga próby technicznej i artystycznej. **Rewizja analizowana:** `2256f5e0796a5adb91d4e5436180c1a50ebdae5b`.

## Pytanie i granice

Jak zrealizować film 14:30, sterując pracą z telefonu, gdy CI generuje modele i przygotowuje animację, bez płatnych runnerów GPU, wynajmu sprzętu i generowania wideo przez AI? Użytkownik dopuszcza obrazy z ChatGPT oraz kod. Dopuszcza również gotowy EXE zamiast Pages, ale nie chce instalować narzędzi deweloperskich i edytorów na swoim komputerze.

W trakcie prac doprecyzowano, że komputer odbiorcy może uruchomić gotową aplikację i renderować obraz swoim GPU. Zakaz GPU dotyczy jego kupowania/wynajmu do CI, nie wykorzystania istniejącego sprzętu widza.

## Rada

Zebrano trzy niezależne początkowe opinie agentów AI, następnie przekazano im wspólną syntezę do oceny. To role eksperckie AI, nie konsultacja z zatrudnionymi ludzkimi specjalistami. Nie wykonywali implementacji ani benchmarków.

| Rola / agent | Niezależna rekomendacja | Ocena syntezy |
|---|---|---|
| Architekt web/3D — `web_tech_council` | Godot jako główny kandydat dla EXE; Blender/Python do modeli. Three.js ma najmniejszy koszt wejścia dla telefonu. | Akceptacja warunkowa: minimalny sprzęt, wygodna ocena telefonem i osobno sprawdzony zapis filmu. |
| Inżynier renderowania/CI — `cpu_render_council` | Godot + Blender przy dopuszczeniu EXE; Blender→GLB→Three.js, gdy Pages jest wymagane. Nie renderować domyślnie całych 20 880 klatek na CPU CI. | Akceptacja warunkowa: zgodne wersje i szablony, import przed eksportem, rzeczywista próba obrazu i urządzeń. |
| Reżyser artystyczny/technical artist — `film_visual_council` | Godot EXE, styl poważny i stylizowany, modele z poprawnymi proporcjami i rigami; obrazy tylko dla referencji/tekstur i kontrolowanego tła. | Akceptacja warunkowa: próbka 20–30 s potwierdzająca obraz; nie zakładać fotorealizmu ani identyczności web/desktop. |

Wszystkie trzy role zaakceptowały syntezę z warunkami. Nie zgłoszono pozostałego blokera architektonicznego lub artystycznego dla samej propozycji. Zgodność opinii nie dowodzi wykonalności produkcji na nieznanym sprzęcie.

## Wybrana rekomendacja

**Godot 4, wersja standardowa i GDScript, z modelami generowanymi przez Blender/Python w CPU CI.** Gotowy produkt początkowo jako Windows ZIP z EXE i danymi. Komputer odbiorcy odtwarza oskryptowaną animację bez instalacji edytora. Wersja silnika, renderer i minimalny sprzęt do ustalenia na próbie.

To wybór kandydata do eksperymentu, nie autoryzacja zmiany całego projektu na Godot. Three.js jest alternatywą, jeśli najważniejszy okaże się prosty podgląd w telefonie lub próba Godota nie wykaże odpowiedniej korzyści. Nie rozwijamy automatycznie dwóch pełnych rendererów.

### Dlaczego nie pozostałe opcje jako baza

- Unreal/Unity mogą budować aplikacje bez filmowego renderowania na GPU CI. Nie wykluczamy ich jako technicznie niemożliwych; oceniamy ich zaplecze i obsługę jako cięższe od potrzeb tego procesu.
- Pełny render Blender/Cycles na CPU może działać, lecz brak pomiaru czasu i limitów dla 14:30. Zostaje opcją dla ograniczonych materiałów, nie podstawą produkcji całego filmu.
- Babylon.js nie daje obecnie wykazanej korzyści uzasadniającej migrację istniejącego Three.js.

## Warunki i eksperymenty

1. **Próba budowania 5–10 s:** generacja modelu, import i headless export z CPU CI; uruchomienie ZIP/EXE na docelowym komputerze bez edytorów. Sprawdzić obraz, dźwięk, pamięć, płynność i czas startu.
2. **Próba oceny na telefonie:** ten sam projekt jako ograniczony Godot Web w Compatibility albo krótki materiał podglądowy z CPU po pomiarze. Nie uznawać zrzutów za test jakości ruchu. EXE nie uruchamia się na Androidzie.
3. **Próba stylu 20–30 s:** ulica, człowiek przy telefonie, wnętrze orbitalne. Ocena użytkownika przed realizacją wszystkich sekwencji.
4. **Eksport do wideo:** osobna funkcja gotowej aplikacji; Godot Movie Maker zapisuje obraz i dźwięk, a docelowy MP4 wymaga ustalonej ścieżki konwersji i walidacji. Nie obiecywać tej funkcji jako już dostępnej w projekcie.

Niewykonane eksperymenty pozostają niewykonane. Headless export nie sprawdza wyglądu i płynności, a zwykłe CI również ma limity i zasady rozliczeń. Brak danych o komputerze odbiorcy nie blokuje rekomendacji, ale blokuje gwarancję konkretnego renderera/poziomu jakości.

## Dowody

Repo zawiera Three.js, generator modeli Blendera oraz przeglądarkowy eksporter korzystający ze SwiftShader. Dowody: `package.json`, `experiments/dancing-robot/generator.py`, `.github/workflows/robot-model.yml`, `scripts/export-film.mjs`, `src/night-shift-stage.js`. Projekt Godot nie został jeszcze dodany.

Oficjalna dokumentacja sprawdzona na potrzeby decyzji:

- CLI/headless export: https://docs.godotengine.org/en/stable/tutorials/editor/command_line_tutorial.html
- Windows i dane runtime: https://docs.godotengine.org/en/stable/tutorials/export/exporting_for_windows.html
- Wymagania i różnice rendererów: https://docs.godotengine.org/en/stable/tutorials/rendering/renderers.html
- Zapis filmów i audio: https://docs.godotengine.org/en/stable/tutorials/animation/creating_movies.html
- Unreal, rozdzielenie cook/package od renderowania: https://dev.epicgames.com/documentation/unreal-engine/build-operations-cooking-packaging-deploying-and-running-projects-in-unreal-engine

## Obowiązki przed zamknięciem decyzji

Właściciel rekomendacji: prowadzący projekt. Ocena estetyki i ergonomii: użytkownik. Przed ostatecznym wyborem wymagane wyniki prób, potwierdzony sprzęt odbiorcy i działający sposób przeglądania efektów z telefonu. Nie wprowadzono płatnych zasobów ani nowej usługi AI.

Decyzja zastępuje wcześniejsze zalecenie rozpoczęcia od renderowania Unreal na wynajętym GPU. [Aktualny plan implementacji](IMPLEMENTACJA.md) uwzględnia powyższe ograniczenia. Scenariusz i logo pozostają bez zmian.
