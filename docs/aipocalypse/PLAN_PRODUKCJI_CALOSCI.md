# AIpokalypse — przygotowanie i produkcja całego filmu

**Status: rekomendacja rady do omówienia, nie rozpoczęta masowa produkcja.**

11 listopada 2026. Podstawa: `SCENARIUSZ_PL.md` wersja2, 22 sekwencje,870sekund; kod3c1cc31c9d22dbb5d75ff295152b002026414384. Użytkownik potwierdził uruchomienie APK z klockiem, a następnie z poruszającym się autem. To dowód działania podstawowego pipeline’u, nie zatwierdzenie docelowego stylu, ludzi, wydajności całego filmu ani pomiar instalacji aktualizacji.

## Rekomendacja

**Cały film planujemy od razu. Cały film najpierw składamy roboczo. Docelową jakość budujemy paczkami powiązanych lokalizacji i zasobów.**

Nie tworzymy wszystkich finalnych obrazów, wszystkich szczegółowych modeli ani pierwszej sceny na gotowo przed sprawdzeniem reszty historii.

| Wariant | Co daje | Dlaczego nie jako samodzielna strategia |
|---|---|---|
| Najpierw wszystkie obrazy | Wizja atmosfery | Niespójne postacie, nieosiągalne kamery/światło, praca nad kadrami później wyciętymi |
| Najpierw wszystkie modele | Biblioteka zasobów | Niewidoczne detale, niepotrzebne wnętrza, zbyt późny test animacji i pamięci |
| Kolejno sceny01–22 do końca | Wczesny gotowy fragment | Początek zużywa wysiłek; finał i najtrudniejsze sceny pozostają niesprawdzone |
| Plan całości → próbki → animatik → paczki | Kontrola rytmu, spójności i kosztu | Wymaga obejrzenia początkowo uproszczonego całego filmu |

## Stałe granice

- Tworzenie z telefonu przez ChatGPT; kod i CPU GitHub Actions generują modele oraz APK Godota. Telefon renderuje animację podczas odtwarzania.
- Bez wynajmowanych GPU, usług AI generujących wideo lub ujęcia, lokalnego edytora na komputerze. Obrazy ChatGPT mogą być referencjami, teksturami i elementami tła po świadomym wyborze.
- Android pozostaje jedynym celem bieżącego pipeline’u. EXE/web/MP4 nie są warunkiem tego planu; publikacja filmu na YouTube będzie wymagała później osobno zaplanowanego eksportu wideo i dźwięku.
- Zachować22sekwencje,870s, brak protagonisty, powracające postacie, globalne lokalizacje, nuklearny finał i pełne końcowe plansze/ciszę. Nie zmieniamy fabuły z powodów technicznych bez decyzji użytkownika.
- Podpis „Hacked by AIpokalypse” jest na urządzeniu lub wypowiadany przez urządzenie w każdej nowej lokalizacji. Czytelność sprawdzana w kadrze; wpis w tabeli jej nie dowodzi.
- Zachować stały klucz/application ID, rosnące wersje i retencję wszystkich artefaktów1dzień. Nigdy nie dodawać sekretów do planów/modeli/repo.

## Etap A — kompletna mapa filmu przed produkcją zasobów

Rezultaty pierwszej paczki przygotowawczej:

1. Lista wszystkich ujęć22sekwencji z unikalnymi ID, np.S01-U01. Scenariusz pozostaje źródłem czasu i działań; nie dopisujemy dowolnej liczby panoram.
2. Macierz „ujęcie → lokalizacja → postać → model → animacja → efekt → dźwięk”. Każdy współdzielony zasób ma jedno ID i listę zastosowań.
3. Storyboard roboczy całej historii: schematyczne kadry, kamery i ruchy. Nie wymaga generowania finalnych ilustracji każdego ujęcia.
4. Rejestr ryzyk i lista tego, co widać z bliska. Oznaczenie: model pierwszoplanowy / moduł powtarzalny / uproszczone tło / element2D.
5. Osobna lista dialogów, głosuAI, efektów i muzyki wraz z proponowanym źródłem i statusem praw. Nie zakładamy zgody na płatne lub generatywne głosy.

Rekord ujęcia zawiera: start/długość, UTC/pora dnia, cel emocjonalny, kamera/obiektyw i widoczny obszar, działania/postacie, tekst/głos urządzenia z czasem ekspozycji, zależności, dźwięk, stan normalny/uszkodzony, wariant uproszczony oraz kryterium odbioru. Suma odcinków ma wynosić870sekund bez luk i nakładek.

**Odbiór:** cała historia i finał mieszczą się w mapie; wiadomo, po co powstaje każdy zasób. To nadal plan ujęć, nie gotowe modele.

## Etap B — spójny wygląd i ograniczona paczka obrazów

Najpierw wspólne proporcje, materiały i paleta. Propozycja artystyczna: poważne stylizowane3D o realistycznych proporcjach; do oceny użytkownika, nie zatwierdzony styl. Obecny samochód ma charakter technicznego prototypu. Nie obiecujemy fotorealistycznych twarzy ani automatycznej synchronizacji ust.

Generujemy obrazy partiami, porównując je ze stylem możliwym do odtworzenia w Godocie:

- Plansza stylu: architektura, sylwetki, materiały, kolor i zmiana światła od codzienności do alarmu, błysku i czerni.
- Karty powracających postaci: ratownik, sprzedawczyni, operator portowy, dyżurna, astronautka. Jednoznaczny strój/sylwetka/kolory; zakres detalu twarzy zależy od ujęć.
- Kluczowe przestrzenie: Warszawa, Manila, Nairobi, hol/winda, port/fabryka, habitat, stacja polarna, orbita, fikcyjna sala wojskowa. Nie muszą powstać wszystkie naraz przed testem pierwszej rodziny.
- Projekt terminali i ekranów. Wszystkie właściwe napisy składamy kodem, a nie wypalamy w wygenerowanych obrazach.

Każdy obraz ma określoną rolę: referencja albo konkretny zasób produkcyjny. Panorama z ruchem kamery może wymagać3D/paralaksy; pojedyncza ilustracja nie zapewnia dowolnego widoku. Nie traktujemy obrazów automatycznie jako finalnych teł.

**Odbiór:** użytkownik ocenia spójny zestaw i jego próbę w APK, nie tylko atrakcyjny pojedynczy obraz.

## Etap C — najpierw trudne próbki, zanim zbudujemy wszystko

1. Próbka20–30s: ulica z człowiekiem przy telefonie, gest/reakcja oraz kontrastujące wnętrze orbitalne. Sprawdzić skalę, proporcje, emocję, światło, tekst i kamerę.
2. Krótkie osobne próby ryzyk: bieg ratownika/kontakt dłoni z rekwizytem; nieważkość; woda i iluminator; zamieć; błysk finału i reakcja człowieka.
3. Zdecydować, które efekty są animacją modeli/światła, a które oszczędnymi warstwami2D. Nie zakładać ciężkich symulacji płynów, tłumów i fizyki zniszczeń.
4. Na telefonie zmierzyć czas klatki i pamięć trudnej próbki. Na tej podstawie ustalić budżety tekstur, geometrii, postaci i efektów; obecne limity auta nie są budżetem całego filmu.

**Odbiór:** wybrany styl da się realizować z emocją i czytelnością na docelowym telefonie. W razie problemu poprawiamy zakres detalu/próbkę przed produkcją biblioteki.

## Etap D — cały roboczy film14:30 w APK

Wszystkie22sekwencje, proste modele, uproszczone postacie, właściwe kamery, roboczy dźwięk/napisy, przejścia i końcowe plansze. Bazowe wspólne generatory są dozwolone już tutaj; późniejsze tworzenie biblioteki oznacza ich dopracowanie, nie odkładanie wszelkiego kodu.

Jedna oś czasu kontroluje ruch, zdarzenia, podpisy i audio. Docelowo przejścia, pauza/restart i wybór sekwencji do przeglądu muszą wynikać z tego samego czasu. To wymaganie przyszłej implementacji, nie istniejąca dziś funkcja całego filmu.

Ładowanie: bieżąca lokalizacja, przygotowanie następnej i zwalnianie poprzedniej. Nie trzymamy wszystkich miast i stacji w pamięci jednocześnie. Animatik służy również testom takich przejść i kontroli narastania pamięci.

**Odbiór:** obejrzenie całych870s; dramaturgia, dialogi, geografia, czas plansz i ciszy działają. Dopiero teraz zamykamy listę szczegółowych modeli. Robocze napisy/głosy nie oznaczają ukończonego dźwięku.

## Etap E — wspólna biblioteka i produkcja rodzin scen

| Rodzina zasobów | Sekwencje | Zasoby i stany |
|---|---|---|
| Warszawa: skrzyżowanie/kawiarnia/ratownictwo |01,04,09,10,19,20| Jezdnia, sygnalizatory, elewacje, kawiarnia; taksówka/dostawczak/karetka, wraki; ratownik/przechodzień; nosze i torba |
| Manila: sklep/ulica/szpital |03,09,10,17,19,20| Sklep, telefon/terminal, szpital, łóżko/nosze, przeszkoda na drodze; ta sama sprzedawczyni i jej strój |
| Nairobi: sklep/łączność/woda/osiedle |03,09,12,19,20| Sklep, nowoczesne centrum operatorskie, pompy, budynek, strażacki pojazd; sprzedawca, technicy i ratownicy |
| Rotterdam: port |03,08,17| Suwnica, kontenery, kabina, plac, pojazd portowy; operator, radio, papierowa mapa |
| USA: robotaksówka |05| Wariant auta z wnętrzem i ekranem, pasażerowie, nocna droga/bariera, stan po uderzeniu |
| São Paulo: hol/winda |06,17| Garaż/brama, korytarz, drzwi, wnętrze windy, interkom; ochrona i sprzątający |
| Japonia: fabryka |07| Stanowisko robota, osłony, narzędzia, fizyczny przycisk, karta bezpieczeństwa; pracownicy |
| Europa: energia/szpital |11| Konsola, fragment infrastruktury, panorama dzielnicy, wariant korytarza szpitala i oświetlenia |
| Habitat |13,20| Moduł zewnętrzny/wnętrze, iluminator, rury, terminal, sprzęt; dwoje badaczy i środowisko wodne |
| Antarktyda |14,20| Budynek, duże/małe pomieszczenie, radio, terminal, kurtki, termometr, zamieć |
| Orbita |15,21,22(głos)| Moduł z oknem, Ziemia, laptop, radiostacja, ołówek; astronautka i drugi członek załogi |
| Fikcyjne wojsko |02,16,18,19| Rodzina sal i terminali, dron, pocisk, fikcyjne instalacje/starty i personel; bez realnych procedur/oznaczeń |
| Efekty i teksty wspólne |Wiele; zwłaszcza18–22| Stany alarmu/blackoutu, dym, szkło, światło, odległe rozbłyski; tytuł i dokładne plansze finału |

Wspólne generatory: rodzina pojazdów; moduły pomieszczeń/elewacji; człowiek ze szkieletem i wariantami garderoby; biblioteka gestów; drzwi/okna; urządzenia/ekrany; materiały i parametry światła. Jednak wnętrze orbitalne nie może wyglądać jak ta sama konsola szpitalna: ponowne użycie techniczne nie zastępuje projektu lokalizacji.

Specyfikacja zasobu: metry, osie/przód, punkt kontaktu z gruntem, pivoty, nazwy kości i klipów, mocowania rekwizytów, materiały, warianty i licencja. Generator otrzymuje parametry, a manifest wskazuje ujęcia wykorzystujące wynik. Brak/błąd zasobu zatrzymuje build zamiast podstawiania klocka. Zmiana modelu wspólnego wymaga sprawdzenia wszystkich używających go scen.

**Proponowane pakiety wykonawcze po animatiku:**

1. Wspólne postacie/gesty, ekrany i urządzenia; miejskie moduły i rodzina pojazdów.
2. Warszawa wraz z jej powrotami i finałem; Manila i Nairobi wraz z ich powrotami.
3. Rotterdam/fabryka oraz hol/winda i energetyka, korzystające z dopracowanych modułów.
4. Habitat, Antarktyda i orbita z przetestowanymi efektami i ruchami.
5. Fikcyjne wojsko/starty i integracja finału z już istniejącymi miastami oraz ciszą.

To kolejność dopracowania, nie odkładanie finału na koniec pierwszego oglądania. Finał i jego trudne efekty mają być sprawdzone już w próbkach i pełnym animatiku. Każdy pakiet daje aktualizowany APK; wcześniejsze lokalizacje i końcowe wersje miejsc są oceniane razem.

## Etap F — dźwięk, montaż i końcowy odbiór

Dźwięk planujemy od EtapuA i próbujemy w animatiku, a finalizujemy po ustabilizowaniu montażu. Źródła: nagrania użytkownika/aktorów, licencjonowane nagrania lub proceduralne sygnały/efekty. Dla każdego: właściciel, licencja, rola, język, czas oraz status roboczy/finalny. Generowanie obrazów nie jest zgodą na generowanie mowy; nie zakładamy dodatkowych płatnych usług.

Sprawdzić powracające postacie, pory dnia/UTC, geografię ujęć, podpisy urządzeń, ciągłość uszkodzeń, respektowanie ciszy i braku huku w kosmosie. Zachować skrajne założenie i planszę otwierającą; nie udawać, że film dowodzi dzisiejszej zdolności AI do przejęcia całego świata.

CI sprawdza manifest, kompletność generacji, budżety, import, oś870s, logikę przejść/sterowania, strukturę APK i podpis. Telefon sprawdza obraz, tekst, dotyk, dźwięk, pamięć i płynność całego przejścia. Żaden wynik CI nie zastępuje oceny aktorstwa i kompozycji.

## Co robimy jako pierwsze

**Pierwsza praca to kompletna lista ujęć i rejestr zasobów całego filmu, nie następna przypadkowa paczka modeli.** Następnie przygotowujemy prompty i mały zestaw referencji wynikających z tej listy. Ten dokument jest planem wykonania tych prac; nie twierdzi, że pełny storyboard, lista ujęć, animatik lub wszystkie modele już istnieją. Harmonogram dni i liczby finalnych modeli/obrazów wymagają tej rozpiski oraz próbek; rada ich nie oszacowała.

## Rada — pochodzenie i decyzja

DEC-PRODUCTION-01: przygotować całość przed produkcją szczegółowych zasobów; strategia mieszana. Status: rekomendacja prowadzącego do przedstawienia użytkownikowi. Zmienia szczegółową kolejność dalszej produkcji w poprzednim PLAN_DZIALANIA.md, nie cofa technicznego APK/auta i nie zmienia scenariusza.

Trzy niezależne opinie agentówAI, role analityczne, nie konsultacje z zatrudnionymi ludzkimi filmowcami:

- production_strategy — producent/reżyser: akceptacja z warunkami pełnej mapy powrotów/finału/czerni, próby człowieka/ekranów/dźwięku/wydajności, pełnego animatiku i sprawdzania zastosowania obrazów jako teł.
- art_strategy — art director/modeler: wspólna biblia wizualna i karty postaci; prototyp auta nie wyznacza stylu; akceptacja z warunkami ujęciowego detalu i kontroli współdzielonych modeli.
- technical_strategy — GodotAndroid/CI: akceptacja z warunkami wczesnego testu postaci/efektów, ładowania/zwalniania scen w animatiku, praw do audio i manifestu bez ukrywania błędów.

Nie ma zastrzeżeń blokujących rekomendację. Zgodność opinii nie dowodzi wykonalności całej jakości filmu. Obowiązkowe próby i odbiór pozostają otwarte.
