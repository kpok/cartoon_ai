# Ręczna konfiguracja bezpieczeństwa GitHub Actions

Repozytorium: **kpok/cartoon_ai**. Instrukcja dotyczy tylko tego repozytorium. Ustawienia administracyjne nie zostały przeze mnie zmienione; poniższe kroki wykonuje właściciel konta.

Zmiany w plikach workflow już ograniczają istniejące joby do właściciela `kpok`, właściwego repozytorium i gałęzi `main`. CI i Pages zachowują automatyczny tryb po Twoim pushu, a eksport MP4 pozostaje ręczny. Nie ma już workflowa do przepisywania historii.

## 1. Najważniejsze: zatwierdzanie workflowów z forków

1. Otwórz [Settings → Actions → General](https://github.com/kpok/cartoon_ai/settings/actions).
2. Znajdź **Approval for running fork pull request workflows from contributors**.
3. Wybierz **Require approval for all external contributors**.
4. Kliknij **Save** w tej sekcji.

Wybierz wszystkich zewnętrznych współtwórców, a nie tylko osoby nowe na GitHubie lub pierwszy raz wysyłające PR. Nawet drobna, wcześniej przyjęta poprawka nie powinna automatycznie zwalniać autora z zatwierdzania kolejnych uruchomień.

**Ten krok jest konieczny do pełnego ograniczenia niezatwierdzonych uruchomień z forków.** Obca osoba może w PR-ze dodać nowy workflow albo zmienić warunek w proponowanym pliku. Samo usunięcie wyzwalacza PR z naszych obecnych workflowów nie zastępuje ustawienia całego repozytorium. Nie zatwierdzaj uruchomienia z zewnętrznego PR-a bez przejrzenia jego workflowów, skryptów i zależności.

## 2. Domyślne uprawnienia tokenu

Na tej samej stronie, w **Workflow permissions**:

1. Zaznacz **Read repository contents and packages permissions**.
2. Odznacz **Allow GitHub Actions to create and approve pull requests**.
3. Kliknij **Save**.

Deployment Pages nadal dostaje potrzebne `pages:write` i `id-token:write` wyłącznie w osobnym, zabezpieczonym jobie. Eksport i budowanie nie potrzebują zapisu do kodu.

## 3. Dopuszczaj tylko sprawdzone akcje

W **Actions permissions**:

1. Pozostaw Actions włączone i wybierz **Allow kpok, and select non-kpok, actions and reusable workflows**.
2. Odznacz ogólne zezwolenie na wszystkie akcje GitHuba oraz wszystkie akcje zweryfikowanych wydawców.
3. W polu dozwolonych akcji wklej poniższą listę. Przecinki oddzielają wpisy:

```text
actions/checkout@11d5960a326750d5838078e36cf38b85af677262,
actions/setup-node@49933ea5288caeca8642d1e84afbd3f7d6820020,
actions/upload-artifact@ea165f8d65b6e75b540449e92b4886f43607fa02,
actions/upload-pages-artifact@7b1f4a764d45c48632c6b24a0339c27f5614fb0b,
actions/configure-pages@983d7736d9b0ae728b81ab479565c72886d7745b,
actions/deploy-pages@d6db90164ac5ed86f2b6aed7e0febac5b3c0c03e
```

4. Włącz **Require actions to be pinned to a full-length commit SHA**, jeżeli opcja jest dostępna.
5. Kliknij **Save**.

Lista odpowiada aktualnemu plikowi [.github/action-pins.json](.github/action-pins.json). Po aktualizacji SHA akcji w workflowie trzeba zaktualizować także listę w ustawieniach. `upload-artifact` jest potrzebny również wewnątrz akcji pakującej Pages; dlatego nie usuwaj go z listy.

## 4. Pages tylko z gałęzi main

1. Otwórz **Settings → Environments → github-pages**.
2. W **Deployment branches and tags** wybierz **Selected branches and tags**.
3. Dodaj regułę typu **Branch** o dokładnej nazwie `main`.
4. Usuń ewentualne szersze wzorce, np. `*`, inne gałęzie i reguły typu **Tag**. Tag nazwany `main` nie jest gałęzią `main`.
5. Zapisz zmiany. Zachowaj istniejące dodatkowe zabezpieczenia, np. reviewerów lub wait timer, jeśli wcześniej sam je włączyłeś.

Jeśli środowisko obecnie dopuszcza wyłącznie chronione gałęzie, nie usuwaj ochrony samego `main`; ogranicz wdrożenie do `main`, zachowując jej reguły. Nie musisz dodawać obowiązkowego ręcznego zatwierdzania deploymentu, jeśli chcesz zachować automatyczną publikację po poprawnym CI.

W **Settings → Pages** źródło publikacji pozostaje **GitHub Actions**. Zmienna repozytorium `ENABLE_GITHUB_PAGES` pozostaje `true`.

## 5. Osoby i dawne workflowy

- W **Settings → Collaborators** sprawdź, kto ma zapis lub administrację. Zostaw tylko osoby, którym świadomie ufasz. Osoba mogąca zmieniać `main` lub ustawienia może również zmienić zabezpieczenia YAML.
- W **Actions** sprawdź, czy pozostał wpis **Sanitize commit email history**. Jeśli menu starego workflowa pozwala go wyłączyć, wybierz **Disable workflow**. Jego plik został usunięty z aktualnego `main`; nie ponawiaj starych uruchomień administracyjnych.
- Przy późniejszej współpracy ustaw reguły `main` ograniczające force-push i usuwanie gałęzi oraz wymagające przeglądu zmian. Sam plik CODEOWNERS jedynie wskazuje recenzenta. Nie ustawiaj bez zastanowienia obowiązkowej drugiej osoby, jeśli jesteś jedynym właścicielem projektu.

## 6. Sprawdzenie po zapisaniu

1. Wróć do każdej zmienionej sekcji i sprawdź, czy wybrane wartości pozostały zapisane.
2. Uruchom **Actions → Film checks and Pages → Run workflow**, wybierając `main`. Testy i deployment powinny przejść.
3. Eksport sprawdź przez **Export cartoon MP4 → Run workflow → main**. Do szybkiej próby wybierz jakość `draft`.
4. Opcjonalnie, w lokalnym checkoutcie z zalogowanym GitHub CLI, wykonaj audyt bez zapisu:

```sh
node scripts/github-security-settings.mjs
```

Skrypt `--apply` jest opcjonalną alternatywą dla ręcznych zmian; nie trzeba go uruchamiać po wykonaniu instrukcji. Nie dodawaj tokenu administracyjnego do sekretów workflowa.

## Co te ograniczenia oznaczają

Właściciel forka nadal może uruchamiać zmienione kopie kodu na swoim koncie i swoich zasobach. Nie da się tego zabronić ustawieniami Twojego publicznego repo. Chronimy Twoje uruchomienia, deployment i sekrety. Stare runy korzystają z dawnych definicji, więc nowa polityka nie działa na nie wstecz.

Gdy dodamy płatne TTS, klucz trafi wyłącznie do dedykowanego generowania głosów, poza aplikację przeglądarkową i joby budowania. Obecna zmiana nie dodaje żadnych kluczy API.

Dokumentacja GitHuba:
- https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/enabling-features-for-your-repository/managing-github-actions-settings-for-a-repository
- https://docs.github.com/en/actions/reference/security/secure-use
- https://docs.github.com/en/actions/how-tos/manage-workflow-runs/re-run-workflows-and-jobs


## Ręczna diagnostyka konfiguracji

Otwórz Actions → Repository configuration diagnostics → Run workflow, wybierz `main` i uruchom jako `kpok`.

- `diagnostics` sprawdza start runnera bez zewnętrznych akcji i próbuje odczytać wybrane ustawienia przez API. Raport znajdziesz w Summary.
- `actions-smoke` sprawdza przypięte checkout/setup-node/upload-artifact, politykę workflowów i testy bezpieczeństwa. Tworzy niewielki artefakt `configuration-probe` z retencją 1 dzień.
- `UNKNOWN` przy HTTP 403/404 oznacza brak możliwości weryfikacji przez wbudowany token. Nie oznacza poprawnego ani błędnego ustawienia. Wartości oznaczone jako odczytane należy porównać z instrukcją powyżej.

Zielony wynik potwierdza wykonanie powyższych prób, ale nie potwierdza kompletnego zabezpieczenia repo ani blokowania nowych workflowów w zewnętrznych PR. Ustawienia administracyjne nadal wymagają sprawdzenia w Settings lub lokalnym skryptem audytu. Workflow nie zmienia konfiguracji, nie wdraża Pages i nie eksportuje filmu. Działa ręcznie, tylko dla właściciela na `main`; nie wymaga nowych sekretów ani rozszerzenia listy dozwolonych akcji.

Jeżeli Actions są całkowicie wyłączone, workflow nie wystartuje — włącz je ręcznie w Settings → Actions → General. Jeśli `diagnostics` działa, a `actions-smoke` jest blokowany przed pierwszym krokiem, sprawdź listę dozwolonych akcji i ich SHA.
