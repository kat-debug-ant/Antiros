# ANTIRŌS — OPRAVA PRO GITHUB (EDITOVATELNÉ SOUBORY)

## Proč předchozí web vypadal jako bílá stránka
Na tvůj GitHub se při nahrávání přes webové rozhraní dostaly všechny soubory do jedné hlavní složky. Starší `index.html` ale vyhledával styly v `assets/css/`, které tam neexistují.

**Tento speciálně opravený ZIP počítá s tím, že všechny soubory jsou v jedné hlavní složce repozitáře.** Proto odkazy mezi nimi fungují a každou HTML/CSS/JS stránku můžeš dál upravovat.

## Jak nahrát opravu do stávajícího repozitáře
1. Rozbal tento ZIP na počítači.
2. Otevři https://github.com/kat-debug-ant/Antiros
3. Klikni `Add file` > `Upload files`.
4. Přetáhni všechny soubory UVNITŘ rozbalené složky (ne samotný ZIP).
5. Potvrď `Commit changes`. `index.html` musí přepsat původní.
6. Otevři https://kat-debug-ant.github.io/Antiros/ a obnov stránku (Ctrl+Shift+R).

**Do repozitáře nepřidávej složku navíc**, soubory musí být přímo vedle `index.html`. Žádné podadresáře pro tuto speciální verzi nepotřebuješ.

## Co se upravuje kde
- `index.html` — hlavní stránka
- `home-main.css` a `home-v3.css` — design hlavní stránky
- `home-main.js` — animovaná soustava a interakce na hlavní stránce
- `site-v3.css` — vzhled podstránek
- `site-v3.js` — společné funkce
- `atlas.html`, `atlas.js` — interaktivní mapa
- `kalendar.html`, `calendar.js` — kalendář
- `nyvare.html`, `dictionary.js`, `nyvare.json` — slovník
- `kmenovy-test.html`, `quiz.js` — kmenový test
- `sivrua.html`, `aquarin.html` a ostatní názvy biomů — profily biomů
- `eshave.html`, `noruai.html` a další — profily 36 kmenů
- soubory `.webp` — jednotlivé ilustrace biomů
- `biomy-index.html`, `kmeny-index.html` — katalogy biomů a kmenů

### Důležitá poznámka
V repozitáři mohou zůstat i staré nadbytečné soubory (`index (1).html`, `index (2).html` atd.). Tyto nové opravené stránky na ně neodkazují. Smazat je můžeš později.

Web je statický; nákupní košík je demonstrační. Mapa a některé texty jsou pracovní návrhy, nikoli schválený kánon.
