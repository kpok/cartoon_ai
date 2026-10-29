> Historyczny audyt przed poprawką pulsu. CSV opisuje starą wersję, nie nową publikację. Plik rhythm-result.json zawiera już bieżący wynik po poprawce; historyczny pomiar FAIL opisany jest poniżej.

# Audyt synchronizacji — wynik: wymaga korekty

Porównano80 par klatek co0.5 sekundy, t=0.0…39.5, na wspólnej osi40 sekund.
Referencja: przekazane nagranie ekranu; pierwszoplanowy tancerz. Animacja: rzeczywisty
podgląd Pages z lokalnego builda, z zatrzymanym zegarem i ustawianiem suwaka co0.5s.
Klatki referencji pobierano przez ffmpeg ze wskazanych czasów; nie jest to automatyczny
pomiar ludzkiego szkieletu. Wnioski o kształcie ruchu są oceną wizualną.

## Wynik pomiaru dźwięku i GLB

- Akcenty wykryto z dodatniego strumienia widmowego, z uwzględnieniem przesunięcia
  początku ścieżki audio +0.043104s względem wideo.
- W przedziale13–28s dopasowano68 akcentów do regularnej siatki: podział0.21897s,
  kandydat na puls0.43793s (~137.0/min). Mediana reszt2.9ms, maksimum11.5ms.
- To kandydat tempa z analizy sygnału, z niejednoznacznością half/double time.
  Nie rozpoznaje słów piosenki ani momentów „hey”.
- Z kluczy DanceRoot.position w aktualnym GLB zmierzono okres pulsu kolan0.52146s
  (estymacja liniowa po10 minimach, kwantyzacja24fps). To około19.1% dłużej od
  kandydata0.43793s. Źródło choreografii potwierdza założenie0.52s.
- Diagnostyka `node scripts/audit-robot-sync.mjs`: **FAIL** (exit1). Sprawdza zgodność
  okresu pulsu z niezależnie zmierzoną siatką przy tolerancji15ms. Nie jest certyfikatem
  podobieństwa wizualnego. Wynik negatywny jest wykrytą wadą, nie pominiętym testem.
- Osobne testy zegara i rzeczywistego rigu:2/2 PASS. Ich poprawność nie oznacza synchronizacji.

## Ocena klatek

Pełne80 wpisów: [samples-0.5s.csv](samples-0.5s.csv). Próbowanie co0.5s wystarcza do
wykrycia rozbieżności pozy, lecz nie do zatwierdzenia tolerancji±0.1s. Szybkie gesty
należy następnie ocenić w mniejszych odstępach i podczas płynnego odtwarzania.

| Czas | Istotna rozbieżność |
|---|---|
|0–5.8s|Boczne przesunięcie głowy jest, ale faza rytmu i mikroruchy rąk nie odpowiadają referencji.|
|8.5–11.3s|Powitanie zbyt jednostajne; granice i pochylenie do dokładniejszego oznaczenia.|
|11.3–17.4s|Brakuje opuszczania rąk i asymetrycznej pracy barków.|
|17.4–21.6s|Gitara czytelna ogólnie, ale bez zgodności rytmu szarpnięć.|
|21.6–24.5s|Przysiad i pochylenie zbyt płytkie; za wczesny powrót do otwartych rąk.|
|24.5–28.2s|Zbliżenie rąk obecne, ale trzeba oznaczyć faktyczne zetknięcie/rozdzielenie.|
|28.2–32.2s|Inna pozycja rąk i zbyt małe pochylenie.|
|32.2–34.8s|Ogólny gest na piersi podobny; nie zatwierdza to drobnej synchronizacji.|
|34.8–36.8s|Brakuje wyraźniejszego obrotu bokiem.|
|38.5–40s|Wygaszenie pętli zastępuje dalszy gest z referencji.|

## Kolejność poprawek

1. Oddzielić stałe czasy gestów od siatki rytmu; zmierzyć fazę pulsu i dopasować ją do
   dźwięku. Sama globalna zmiana szybkości całego40-sekundowego klipu przesunie gesty.
2. Wyznaczyć początki/szczyty/końce powitania, przysiadu, zetknięcia rąk i gestu na piersi
   w gęstszych próbkach. Na tej podstawie stworzyć niezależne asercje tolerancji czasowych.
3. Dopiero potem poprawić amplitudy i pozy, pozostawiając krótkie kończyny; nie da się
   wymagać identycznych współrzędnych dłoni człowieka i robota o innych proporcjach.
4. Zatwierdzić w płynnym porównaniu z dźwiękiem. Nie deklarować synchronizacji na
   podstawie samego zielonego testu odtwarzacza lub nazw faz.

Audyt nie zmienia animacji i nie publikuje nowej wersji Pages. Referencyjne klatki,
pełne nagranie i wyciąg audio pozostają poza publicznym repo. Przygotowane lokalne
pliki audytu nie są automatycznie zatwierdzone/publikowane na GitHubie.
