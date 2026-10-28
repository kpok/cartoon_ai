# Roadmapa — filmy tworzone kodem

Data uzgodnienia: 2026-10-28. Status: plan zaakceptowany, Sprint 1 jeszcze nie rozpoczęty.
Ten dokument nie oznacza wdrożenia generatora, utworzenia modelu ani trzeciego filmu.

## Cel i sposób pracy

Właściciel przedstawia pomysł w ChatGPT Work. Wspólnie tworzymy kod w tym repozytorium,
a GitHub Actions uruchamia go i generuje geometrię, materiały, ruch oraz klatki filmu.
AI pomaga napisać kod podczas pracy w rozmowie; generator podczas wykonania nie wywołuje
AI, nie generuje wideo przez usługę AI i nie wymaga klucza OpenAI ani innych płatnych API.
Obraz referencyjny można przygotować wcześniej. Gotowe MP4 właściciel ręcznie publikuje
na YouTube Shorts lub Facebook Reels. Monetyzacja jest celem możliwym w przyszłości,
nie gwarantowanym wynikiem eksperymentu; zasady platform sprawdzamy przed publikacją.

## Organizacja i technologie

Wszystko pozostaje w publicznym `kpok/cartoon_ai`, bez osobnego repo generatora.

| Element | Uzgodnienie |
| --- | --- |
| Generator | Proponowany folder `experiments/dancing-robot/`, Python i Blender API `bpy` |
| Scena i animacja | Modelowanie proceduralne, materiały, światła, kamera i klatki kluczowe w Blenderze |
| Wykonanie | Osobny ręczny workflow Actions, przypięta wersja Blendera, początkowo CPU |
| Film | FFmpeg, pionowe 9:16 MP4, bez ścieżki dźwiękowej w pierwszym eksperymencie |
| Pliki wynikowe | PNG podglądu, GLB modelu, BLEND projektu, następnie MP4 |
| Podgląd telefonu | Three.js na tej samej stronie GitHub Pages, obracanie i przybliżanie |
| Biblioteka strony | Trzecia karta robota; obecne bajki meadow i garden pozostają dostępne |

Blender działa w Actions, nie na telefonie ani w GitHub Pages. Pages udostępnia wcześniej
wygenerowane pliki. Robot ma mieć dwa widoki: „Obejrzyj film” i „Obejrzyj model 3D”.
Podgląd czasu rzeczywistego może wyglądać inaczej niż render filmowy. Przy eksporcie GLB
sprawdzamy obsługę materiałów i animacji; niestandardowe efekty mogą wymagać uproszczenia
lub wypieczenia do tekstur/klatek kluczowych. GLB sam w sobie nie gwarantuje gotowego rigu.

Nie piszemy własnego silnika graficznego. Własny niewielki generator korzysta z Blendera;
Peeps i BlenderProc są materiałem do oceny lub inspiracji, nie zatwierdzonymi zależnościami.
Nie przyjmujemy systemu wymagającego modelu AI podczas wykonywania generatora.

## Sprint 1 — eksperyment z tańczącym robotem

Cel: sprawdzić realizm, możliwość animacji, mobilny podgląd i czas wykonania.
Pierwsza postać jest inspirowana obrazem robota z metalem i neonową powłoką, który według
właściciela został wcześniej wygenerowany przez ChatGPT. Przed implementacją zapewnić
ponowny dostęp do referencji, jeżeli załącznik z rozmowy nie będzie już dostępny.

### Etap A — model i punkt oceny

1. Przygotować folder generatora, instrukcję, informacje licencyjne oraz ręczny workflow.
2. Zachować kontrolę właściciela, repozytorium i gałęzi main oraz aktora ponawiającego run.
   Minimalne uprawnienia, przypięte zależności/akcje, izolowana concurrency i brak sekretów.
3. Przypiąć wersję Blendera i weryfikować pobrane archiwum. Startowy limit zadania: 60 minut;
   limit czasu i zasobów sprawdzamy pomiarami, nie obiecujemy czasu renderu z góry.
4. Kodem utworzyć głowę i ramiona: oczy, metal, śruby, błyszczącą kolorową powłokę.
5. Ustawić światło studyjne i wyrenderować pojedynczy PNG; wyeksportować GLB i BLEND.
6. Sprawdzić geometrię, kompletność plików, eksport i koszty/czas wykonania.
7. Udostępnić wybrany model i PNG na mobilnej podstronie Pages; właściciel ocenia wygląd.

Akceptacja wyglądu po etapie A jest punktem decyzji przed pracą nad całą sylwetką i tańcem.
Nie gwarantujemy idealnego odwzorowania obrazu ani filmowego realizmu na każdym telefonie.

### Etap B — po akceptacji wyglądu

1. Dodać pełną sylwetkę, mechaniczne stawy i hierarchię/szkielet do ruchu.
2. Przygotować 5–10 sekund próbnego tańca i pionowy niemy MP4.
3. Do dokładnego dopasowania rytmu właściciel wskazuje konkretne nagranie lub czasy akcentów
   „digi digi … Hey”. Nie pobieramy ani nie publikujemy nieuzgodnionej muzyki.
4. Sprawdzić liczbę klatek, czas, kodek, wymiary oraz brak ścieżki audio; ocenić ruch wizualnie.
5. Dodać trzecią kartę z filmem i modelem, zweryfikować obie dotychczasowe bajki i nawigację.

Na początek powłoka jest częścią modelu. Realistyczna symulacja chlupotania i odrywania
kropli pozostaje poza zakresem pierwszego eksperymentu.

### Kryteria zakończenia

- Powtarzalne wykonanie skryptów z zapisanymi parametrami/seedem, wersjami i raportem czasu.
- Brak wywołań AI, nowych kluczy API i instalacji wymaganych na urządzeniu właściciela.
- Poprawne PNG/GLB/BLEND, mobilny podgląd oraz — po bramce wizualnej — niemy próbny MP4.
- Automatyczne kontrole wyników i testy regresji istniejących bajek; ocenę estetyki wykonuje właściciel.
- Kod przeglądany przed wykonaniem. Błędy/timeouty raportowane bez nieskończonych ponowień.

## Generowanie i publikowanie

Generowanie nie uruchamia się przy każdym pushu. Pierwsza publikacja wybranych wyników
jest świadoma i ręczna: artefakt Actions nie jest automatycznie plikiem dostępnym na Pages.
Do strony promujemy wyłącznie wybrane GLB/PNG/MP4 z identyfikatorem źródłowego commita
oraz konfiguracją; robocze BLEND i próbne rendery zostają w artefaktach z krótką retencją.
Przed publikacją kontrolujemy rozmiar, licencje, metadane, niepotrzebne ścieżki i dane robocze.

Aktualny build/serwer/polityka bezpieczeństwa mają ścisłe listy dozwolonych plików i workflowów.
Sprint musi świadomie rozszerzyć je dla modelu, filmu i podstrony — bez publikowania całego
folderu generatora do dist i bez wyłączania zabezpieczeń. Nie zmieniamy ustawień administracyjnych
bez odrębnej potrzeby; instrukcje są w [ADMIN_SECURITY_PL.md](../ADMIN_SECURITY_PL.md).

Publiczne repo i opublikowane modele można pobrać. Samo zamknięcie repo w przyszłości nie
cofnie istniejących kopii ani już udzielonych licencji. Standardowe publiczne runnery Actions
nie zużywają prywatnej puli minut, ale obowiązują limity zadań, zasobów i artefaktów.
Przed większym renderowaniem ponownie sprawdzamy aktualne warunki GitHuba.

## Wskazówki na przyszłość — co trzymać poza publicznym repo

W pierwszym eksperymencie nie potrzebujemy żadnych poniższych danych ani integracji.

| Potencjalny przyszły element | Zasada |
| --- | --- |
| Klucze AI/API | Dopiero przy świadomie dodanej integracji; sekrety po stronie wykonawczej, nigdy w kodzie, URL, modelu ani logach |
| Dostęp AWS/Google Cloud | Dopiero przy użyciu chmury; preferowana tożsamość federacyjna/OIDC i minimalne uprawnienia zamiast stałych kluczy |
| Tokeny YouTube/Facebook | Tylko przy przyszłej automatycznej publikacji; tokeny OAuth/odświeżania w magazynie sekretów, nie hasła w repo |
| Dane GitHuba | Korzystać ze scoped GITHUB_TOKEN; dodatkowy token tylko przy rzeczywistej potrzebie, nigdy w plikach projektu |
| Kupione modele/tekstury/HDRI/muzyka/ruchy/fonty | Osobno sprawdzać prawo do filmu i prawo do redystrybucji źródłowego pliku; nie dodawać ograniczonych zasobów do publicznego repo |
| Materiały przed premierą | Trzymać prywatnie tylko jeżeli właściciel chce ukryć projekt/film; nie jest to wymaganie obecnego eksperymentu |
| Duże pliki i wersje próbne | Retencja artefaktów i kontrola rozmiaru; nie dodawać każdego renderu do historii Git |

Dla każdej zewnętrznej zależności/assetu zapisać źródło, wersję, licencję i wymagane uznanie
autorstwa. Publiczny dostęp nie oznacza braku praw autorskich ani zgody na dowolne użycie.
Dla publikowanego generatora używającego bpy przyjmujemy zgodność z GPL i dołączamy właściwe
informacje licencyjne przy implementacji. Nie przeliczamy automatycznie licencji całego repo:
kod generatora oraz modele i filmy mają oddzielnie opisane zasady. Nie obiecujemy wyłączności
praw do materiałów wygenerowanych AI ani braku podobieństwa do cudzych projektów.

## Dalsze sprinty — decyzja po eksperymencie

Możliwe kierunki, jeszcze nie zlecone do realizacji: lepszy taniec i dłuższe filmy,
biblioteka postaci/scen/ruchów, animowana masa, audio i naturalne dialogi, renderowanie GPU,
rozszerzenie pipeline'u o zatwierdzaną publikację. AWS i Google Cloud nie są potrzebne do
Sprintu 1. Dobór mocniejszego renderowania nastąpi dopiero po pomiarach.

## Dokumentacja a CI

Automatyczny workflow CI/Pages pomija push, jeżeli wszystkie zmiany dotyczą plików `.md`
lub katalogu `docs/`. Zmiana dokumentacji razem z kodem albo workflowem uruchamia CI.
Ręczne uruchomienia CI, eksportu i diagnostyki pozostają dostępne. Dokumentacji nie używamy
jako miejsca przechowywania wykonywalnego kodu aplikacji. Mechanizm: `paths-ignore` dla push.
