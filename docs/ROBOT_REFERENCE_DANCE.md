> Aktualne gesty „hej” są przy2.0s i5.5s, zgodnie ze wskazaniem użytkownika. [Aktualizacja głowy, mimiki i tła](ROBOT_HEAD_FACE_STAGE.md). Starsza orientacyjna tabela poniżej nie określa już czasu powitania.

# Taniec według nagrania referencyjnego

Publikacja40-sekundowego układu na podstawie nagrania przekazanego przez właściciela.
Nagranie i jego dźwięk nie są dołączane do publicznego repo. Pozostaje podgląd GLB3D,
bez MP4. Wygląd i proporcje robota pozostają zachowane; oryginalne powierzchnie rąk
podzielono na sztywne części łokci/nadgarstków, z małymi schowanymi przegubami.
To ręcznie dopasowana adaptacja dla krótkich kończyn, bez symulacji palców i bez mocap.
Nie deklarujemy synchronizacji co do klatki z muzyką.

## Sekwencja

- 0–5.8s: boczne przesuwanie głowy, spokojniejszy tułów i puls kolan.
- 5.8–8.5s: gesty przy barkach.
- 8.5–11.3s: powitanie po lewej stronie obrazu.
- 11.3–17.4s: kołysanie i przenoszenie ciężaru.
- 17.4–21.6s: gest niewidzialnej gitary.
- 21.6–23.8s: płytki sprężysty przysiad.
- 23.8–28.2s: otwarte końcówki rąk i zbliżenie przed klatką.
- 28.2–32.2s: pochylenie oraz otwarcie ramion.
- 32.2–36.8s: ręka przy piersi.
- 36.8–40s: gesty przy twarzy i powrót do początku.

Suwak na stronie pozwala obejrzeć dowolny moment; pauza i obrót pozostają niezależne.
IK nóg utrzymuje stopy na poziomie podłoża, z drobnym naprzemiennym odciążaniem.
Dysk pod modelem ułatwia ocenę kontaktu stóp. Przy reduced motion start jest zatrzymany.

## Odtworzenie

`npm ci` i `npm run robot:retarget` generują GLB bez renderowania, Blendera i API AI.
`npm run robot:check` porównuje wygenerowany plik z publikacją bajt po bajcie.
Źródła: `experiments/dancing-robot/choreography.mjs`, `retarget.mjs`; wejście
`assets/rig-base.glb` to identyczna archiwalna zatwierdzona sylwetka z wcześniejszym rigem.
Kod nowych skryptów GPL-3.0-or-later, oryginalny model i animacja CC BY4.0,
Neon Tinker by kpok. Manifest zapisuje hash wejścia, źródeł i wyniku.

Aktualne parametry: jeden ReferenceDance40s,24fps,961 kluczy na kanał,
bez tekstur, zewnętrznych URI, kamer, audio i deformowania siatki skinningiem.
Generator geometrii Blendera pozostaje statyczny; nowy etap ruchu wykonuje Node/Three.js.

Na polecenie właściciela ta iteracja jest najpierw zapisywana na main i publikowana
przez istniejący CI, a potem kończona jest lokalna weryfikacja. Wyniki testów i review
należy odczytywać z aktualnego CI oraz raportu końcowego, nie traktować tego dokumentu
jako potwierdzenia zakończonych testów.

## Wynik weryfikacji po publikacji

Sprawdzona wersja: `18270f102ca6a017c03fc95a4402931acdbdb601` (2026-10-29).
Deployment Pages i job CI test zakończyły się sukcesem. Lokalnie po zapisie na main:
36/36 testów Node,3/3 Python,40/40 E2E (desktop i mobile), robot:check,
walidator pakietu, build i polityka7 zadań owner-only — PASS.
Pobrany z Pages GLB jest identyczny z publikowanym plikiem, suwak dostępny na stronie.
Niezależny `reference_dance_review`: PASS; zamknięto nieaktualne oczekiwanie ruchu rąk
w pierwszej fazie, sprawdzając je w momentach powitania i gestu przy piersi.
Sprawdzenie całych960 klatek potwierdziło podparcie obu stóp i zmieszczenie modelu
w mobilnym kadrze początkowym. Odchylenie numeryczne podparcia <2.1e-8.
Pełny job CI Browser and export regression także zakończył się sukcesem.
Eksport regresyjny dotyczy dotychczasowych bajek, nie generuje filmu robota.
