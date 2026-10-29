# Szybsza głowa, gesty „hej”, dłonie i neonowe ruiny AI

Właściciel wskazał dwa momenty zawołania w swoim nagraniu: **2.0s i5.5s**.
Szczyt uniesienia lewej ekranowo dłoni jest powiązany z tymi czasami. Ręka podnosi
się wcześniej i opada później; przy zawołaniu otwarta dłoń jest skierowana do kamery,
zaś nadgarstek wykonuje krótki ruch na boki. Nie są to znaczniki rozpoznane przez AI:
lokalna transkrypcja śpiewu była niewiarygodna, dlatego użyto potwierdzenia użytkownika.
Test odczytuje faktyczny GLB i sprawdza maksimum uniesienia w granicach jednej klatki.

Głowa ma teraz pełny boczny cykl w około0.438s zamiast0.876s, z szybszym przejściem
przez środek i wyraźniejszym zatrzymaniem na bokach. To korekta wizualna według
informacji użytkownika, nie deklaracja zmierzonego mocap. Puls nóg pozostaje bez zmian.
Są osobne testy tempa i zakresu przesunięcia głowy, oprócz istniejącego audytu kolan.

Dodano małe otwarte dłonie: cztery palce, kciuk i ciemną wkładkę. Ręce i nogi pozostają
krótkie, duża głowa i wcześniejsze materiały pozostają zachowane. Sztywne segmenty
ramion mają teraz przycięte i zamknięte powierzchnie, bez ząbkowanych otwartych krawędzi.

Mimika: mechaniczne powieki, mruganie, mrugnięcie jednym okiem po zawołaniu,
subtelny ruch źrenic, brwi i uśmiechu. Nie jest to lip-sync. Animowana skala jest
dopuszczona wyłącznie na dwóch powiekach, w ściśle ograniczonym zakresie.

Scena to oryginalna geometria proceduralna: ruiny miasta, przerwany łuk transmisyjny,
neonowe ścieżki, unoszące się iskry i uszkodzony dron. Nie korzysta z zewnętrznych
zdjęć, tekstur ani HDRI. Wszystkie ruchy sceny zależą od tego samego zegara co robot,
więc pauza, cofanie i eksport klatek są deterministyczne. Tło działa w viewerze i MP4;
nie jest częścią pobieranego GLB postaci. Platforma ma górną powierzchnię na poziomie stóp.

Kod ruchu/mimiki i operacji na oryginalnym modelu w experiments/dancing-robot:
GPL-3.0-or-later. Wynikowy oryginalny model CC BY4.0, Neon Tinker by kpok.
Nie dołączono nagrania referencyjnego ani jego dźwięku. MP4 nadal jest niemy.

## Stan dostarczania

Częściowe checkpointy trafiają od razu na gałąź `robot/head-face-ai-ruins`, zgodnie
z preferencją właściciela. Po sprawdzeniu gałąź jest scalana do main. Wynik jest najpierw oceniany na Pages;
MP4 uruchamiany jest ręcznie dopiero po osobnym poleceniu użytkownika. Artefakty wcześniejszego workflow
nie aktualizują się: nowy film należy pobrać z nowego uruchomienia.
