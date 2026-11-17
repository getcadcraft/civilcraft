---
title: Menüüd, klahvid ja hiir
summary: Vali menüüstiil, mis sobib sinu senise töövooga, anna mis tahes käsule oma klahv, liiguta käske riba sakkide vahel ning määra, mida ratas ja hiireklahvid teevad plaanil ja 3D-vaates.
keywords: menüüstiil, menüüd, riba, tsiviiltööde riba, tööriistariba, käsurida, klassikaline joonestus, kiirklahvid, klahvid, kohanda, uuesti määra, hiir, ratas, sisepõhi, suuna zoom, keskmine nupp, parem nupp, nihuta, orbiit, eksport, import, ümberlülitus, tuttav
from: 07ac73a0
---

CivilCraft'i käsud on samad, kuidas neid ka kätte ei saa. **Menüüstiil** määrab ainult, kus need ekraanil asuvad, mis neid nimetatakse ja millised klahvid neid käivitavad, nii et võid jääda oma harjumuste juurde. Vali see valikus {{ui:Settings}} ({{key:Mod+,}}) › {{ui:CivilCraft}} › {{ui:Menus, keys and mouse}}; muudatus jõustub kohe ja see brauser jätab selle meelde.

## Kolm stiili

| Stiil | Mida saad |
|---|---|
| {{ui:CivilCraft}} | CivilCraft'i oma tööriistariba (File, Export, Surface, Design, Edit, GIS, View) ja üksikklahvid: {{key:A}} trass, {{key:G}} platvorm, {{key:P}} torud, {{key:B}} murdjoon, {{key:O}} piir, {{key:L}} tunnusjoon, {{key:R}} profiil, {{key:X}} lõiked, {{key:E}} kalded, {{key:D}} 3D, {{key:F}} sobita, {{key:V}} vali. Algseis. |
| {{ui:Drafting classic}} | Väike riba ({{ui:Home}}, {{ui:Insert}}, {{ui:Output}}) ja käsurida neile, kes käske kirjutavad: ALIGNMENT, PAD, PIPE, FEATURELINE, BREAKLINE, PROFILE, SECTIONS, U (võta tagasi), ZOOM, 3D, PLOT, LANDXML, XATTACH, MAPIMPORT, HELP. Alusta kirjutamist kuhu tahes ja tähed lähevad käsuritta; {{key:Enter}} käivitab, {{key:Enter}} tühjalt kordab viimast käsku, {{key:Esc}} tühjendab selle. Keskmine nupp nihutab vaadet. |
| {{ui:Civil ribbon}} | Suurte nuppudega sakid, nii nagu tsiviilprojekteerimise programmid oma tööriistad rühmitavad: {{ui:Home}} (maapinna andmed, projekti loomine, profiili- ja lõigevaated), {{ui:Surfaces}}, {{ui:Modify}}, {{ui:Geolocation}}, {{ui:View}} ja {{ui:Output}}, koos menüüga {{ui:File}} ja kiirnuppudega paremal. Üksikklahvid jäävad alles. Keskmine nupp nihutab plaani; 3D-vaates nihutab keskmine nupp ja {{key:Shift}} koos keskmise nupuga pöörab. |

Iga stiil säilitab {{key:Mod}}-klahvid: {{key:Mod+Z}}, {{key:Mod+Y}}, {{key:Mod+S}}, {{key:Mod+O}}, {{key:Mod+P}}, {{key:Mod+C}}, {{key:Mod+X}}, {{key:Mod+V}}, {{key:Mod+D}}, {{key:Mod+A}}.

:::tip
CivilCraft'i enda paigutusse kuuluv klahv, mille su stiil on andnud teisele käsule, ei tee midagi ja olekurida ütleb, kuhu tema käsk läks („Klahvides Minu klahvid on Pad Ctrl+Alt+G“). {{key:Delete}}, {{key:Esc}}, {{key:Enter}}, {{key:Tab}}, {{key:Space}} ja nooleklahvid säilitavad alati oma tähenduse ning joone joonistamise ajal jäävad selle punktid oma klahvide juurde ({{key:Backspace}}, {{key:Enter}}).
:::

## Tee see enda omaks

1. Vali stiil, mis on sinu soovile kõige lähedasem, ja klõpsa {{ui:Customize…}}.
2. Valikus {{ui:Keys and menus}} leia käsk (otsinguväli aitab). Klõpsa {{ui:Add a key}} ja vajuta klahvi või kahte klahvi järjest kaheklahvilise jaoks. Klahvi eemaldamiseks klõpsa sellel.
3. Riba korral viib {{ui:Where it sits}} käsu teise sakki ja paneeli, menüüsse {{ui:File}} või valikusse {{ui:Keys only}}.
4. Valikus {{ui:Mouse}} määra ratas, nupud, mis plaani nihutavad, ja mida iga nupp 3D-vaates teeb.
5. Anna sellele nimi ja klõpsa {{ui:Save}}.

Sisseehitatud stiili salvestamine teeb sinu enda koopia („Minu tsiviiltööde riba“); sisseehitatud stiil ei muutu kunagi. Klahv, mis on antud kahele käsule, või klahv, mis käivituks enne, kui kaheklahvilist klahvi saab kirjutada, on näidatud punasena ja enne salvestamist tuleb see parandada.

## Hiir

- **Hiireratas**: {{ui:Scroll up zooms in}} (algseis) või {{ui:Scroll up zooms out}}, ja kui kiiresti, nii plaanil kui 3D-vaates. Puuteplaadi nipsutus suumib alati nii, nagu sõrmed liiguvad.
- **Plaani nihutamine**: keskmise nupuga, parema nupuga või mõlemaga. Ka {{key:Space}} ja lohistamine nihutab. Vasak nupp valib ja joonistab alati.
- **Lohistamine 3D-vaates**: {{ui:Each view's own}} hoiab CivilCraft'i nupud (vasak pöörab, parem nihutab). Või määra iga nupp pööramiseks, nihutamiseks, suumimiseks või tühjaks; {{key:Shift}} koos nupuga vahetab pööramise ja nihutamise. Klõps ilma lohistamiseta valib ikka.

## Võta kaasa

{{ui:Export}} salvestab kasutusel oleva stiili väikese faili `.ccinput.json`; {{ui:Import…}} lisab ühe, teisest arvutist või kolleegilt. Imporditud fail saab viidata ainult CivilCraft'i enda käskudele: kõik muu jäetakse välja ja loetakse olekureal kokku. {{ui:Delete this style}} eemaldab ühe sinu enda stiilidest.

:::note
Need sätted jäävad sellesse brauserisse. {{ui:Use this style in every app}} stiilikaartide all paneb iga rakenduse avanema oma vastava stiiliga (oma tööriistariba, riba või klassikaline joonestus), koos iga rakenduse jaoks tehtud muudatustega. CivilCraft'il ei ole menüüriba stiili: kui kõigi rakenduste jaoks on valitud teise rakenduse menüüriba, säilitab CivilCraft oma tööriistariba.
:::

Seotud: [Klaviatuur ja hiir](topic:keyboard) · [CivilCraft'i sätted](topic:settings) · [Tulek teiste tsiviiltarkvarade juurest](topic:coming-from)
