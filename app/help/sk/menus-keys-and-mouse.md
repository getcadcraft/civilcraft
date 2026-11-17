---
title: Ponuky, klávesy a myš
summary: Vyberte štýl ponuky, ktorý zodpovedá vášmu spôsobu práce, priraďte ľubovoľnému príkazu vlastnú klávesu, presúvajte príkazy medzi kartami pásky a nastavte, čo robí koliesko a tlačidlá myši v pôdoryse a v 3D.
keywords: štýl ponuky, ponuky, páska, civilná páska, panel nástrojov, príkazový riadok, klasické rysovanie, klávesové skratky, skratky, klávesy, prispôsobiť, premapovať, znova priradiť, myš, koliesko, obrátiť, smer zoomu, prostredné tlačidlo, pravé tlačidlo, posun, otáčanie, export, import, prepínanie, známe
from: 07ac73a0
---

Príkazy programu CivilCraft fungujú rovnako bez ohľadu na to, ako k nim pristúpite. **Štýl ponuky** určuje len to, kde sa nachádzajú na obrazovke, ako sa tam volajú a ktorými klávesmi sa spúšťajú, takže si môžete zachovať zaužívané návyky. Vyberte ho v {{ui:Settings}} ({{key:Mod+,}}) › {{ui:CivilCraft}} › {{ui:Menus, keys and mouse}}; zmena sa uplatní okamžite a tento prehliadač si ju zapamätá.

## Tri štýly

| Štýl | Čo dostanete |
|---|---|
| {{ui:CivilCraft}} | Vlastný panel nástrojov programu CivilCraft (Súbor, Export, Povrch, Návrh, Úpravy, GIS, Zobrazenie) a jednoduché klávesy: {{key:A}} os trasy, {{key:G}} plošina, {{key:P}} potrubia, {{key:B}} hrana zlomu, {{key:O}} hranica, {{key:L}} charakteristická čiara, {{key:R}} pozdĺžny profil, {{key:X}} rezy, {{key:E}} sklony, {{key:D}} 3D, {{key:F}} prispôsobiť, {{key:V}} výber. Východzí stav. |
| {{ui:Drafting classic}} | Malá páska ({{ui:Home}}, {{ui:Insert}}, {{ui:Output}}) a príkazový riadok pre tých, ktorí zadávajú príkazy: ALIGNMENT, PAD, PIPE, FEATURELINE, BREAKLINE, PROFILE, SECTIONS, U (späť), ZOOM, 3D, PLOT, LANDXML, XATTACH, MAPIMPORT, HELP. Začnite písať kdekoľvek a písmená idú do príkazového riadka; {{key:Enter}} spustí príkaz, {{key:Enter}} na prázdnom riadku zopakuje posledný príkaz, {{key:Esc}} ho vymaže. Stredným tlačidlom sa posúva pohľad. |
| {{ui:Civil ribbon}} | Karty veľkých tlačidiel podľa toho, ako civilné návrhové programy zoskupujú nástroje: {{ui:Home}} (údaje o teréne, vytvorenie návrhu, pohľady na profil a rez), {{ui:Surfaces}}, {{ui:Modify}}, {{ui:Geolocation}}, {{ui:View}} a {{ui:Output}}, s ponukou {{ui:File}} a rýchlymi tlačidlami vpravo. Jednoduché klávesy zostávajú. Stredným tlačidlom sa v pôdoryse posúva; v 3D sa stredným tlačidlom posúva a so stlačeným {{key:Shift}} sa stredným tlačidlom otáča. |

Každý štýl zachováva klávesy {{key:Mod}}: {{key:Mod+Z}}, {{key:Mod+Y}}, {{key:Mod+S}}, {{key:Mod+O}}, {{key:Mod+P}}, {{key:Mod+C}}, {{key:Mod+X}}, {{key:Mod+V}}, {{key:Mod+D}}, {{key:Mod+A}}.

:::tip
Klávesa, ktorá patrí rozloženiu programu CivilCraft, ale váš štýl priradil inému príkazu, nerobí nič a stavový riadok uvedie, kam sa jej príkaz presunul (napríklad "V Moje klávesy je Plošina na Ctrl+Alt+G"). {{key:Delete}}, {{key:Esc}}, {{key:Enter}}, {{key:Tab}}, {{key:Space}} a šípky si vždy zachovávajú svoj význam a pri kreslení čiary si jej body zachovávajú svoje klávesy ({{key:Backspace}}, {{key:Enter}}).
:::

## Vytvorte si vlastný štýl

1. Vyberte štýl, ktorý sa najviac blíži vašej predstave, a potom kliknite na {{ui:Customize…}}.
2. Na {{ui:Keys and menus}} nájdite príkaz (pomôže vyhľadávacie pole). Kliknite na {{ui:Add a key}} a stlačte klávesu, alebo dve klávesy za sebou pre dvojpísmenovú klávesu. Kliknutím na klávesu ju odstránite.
3. Pri páske {{ui:Where it sits}} presunie príkaz na inú kartu a panel, do ponuky {{ui:File}} alebo na {{ui:Keys only}}.
4. Na {{ui:Mouse}} nastavte koliesko, tlačidlá, ktorými sa posúva pôdorys, a to, čo robí každé tlačidlo v 3D zobrazení.
5. Pomenujte ho a kliknite na {{ui:Save}}.

Uloženie vstavaného štýlu vytvorí vašu vlastnú kópiu ("Moja civilná páska"); vstavaný štýl sa nikdy nemení. Kláves priradený dvom príkazom alebo taký, ktorý by sa spustil skôr, než by sa dal napísať dvojpísmenový kláves, sa zobrazí červenou farbou a pred uložením ho treba opraviť.

## Myš

- **Koliesko myši**: {{ui:Scroll up zooms in}} (východzí stav) alebo {{ui:Scroll up zooms out}}, a tiež rýchlosť, v pôdoryse aj v 3D. Štipnutie na touchpade vždy priblíži alebo oddiali podľa pohybu prstov.
- **Posun pôdorysu pomocou**: stredného tlačidla, pravého tlačidla alebo oboch. {{key:Space}} a ťahanie tiež posúva. Ľavé tlačidlo vždy vyberá a kreslí.
- **Ťahanie v 3D zobrazení**: {{ui:Vlastné pre každé zobrazenie}} ponecháva tlačidlá CivilCraft (ľavé otáča, pravé posúva). Alebo nastavte každé tlačidlo na otáčanie, posun, zoom alebo na nič; {{key:Shift}} so stlačeným tlačidlom prehodí otáčanie a posun. Klik bez ťahania stále vyberá.

## Vezmite si to so sebou

Tlačidlom {{ui:Export}} uložíte používaný štýl ako malý súbor `.ccinput.json`; tlačidlom {{ui:Import…}} pridáte jeden zo súboru z iného počítača alebo od kolegu. Importovaný súbor môže ukazovať iba na vlastné príkazy programu CivilCraft: všetko ostatné sa vynechá a spočíta v stavovom riadku. Tlačidlom {{ui:Delete this style}} odstránite niektorý z vašich vlastných štýlov.

:::note
Tieto nastavenia zostávajú v tomto prehliadači. Tlačidlo {{ui:Use this style in every app}} pod kartami štýlov zabezpečí, že každá aplikácia sa otvorí v zodpovedajúcom štýle (vlastný panel nástrojov, páska alebo klasické rysovanie), so zmenami, ktoré ste urobili v každej aplikácii. CivilCraft nemá štýl s panelom ponúk: keď sa pre všetky aplikácie zvolí panel ponúk inej aplikácie, CivilCraft si ponechá vlastný panel nástrojov.
:::

Súvisiace: [Klávesnica a myš](topic:keyboard) · [Nastavenia CivilCraft](topic:settings) · [Prechod z iného civilného softvéru](topic:coming-from)
