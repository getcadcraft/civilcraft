---
title: Gravitācijas cauruļu tīkla izveide
summary: Zīmējiet lietusūdens vai sadzīves kanalizācijas caurules posmus pa konstrukcijām, iestatiet savus slīpuma, pārklājuma un krituma noteikumus, ļaujiet CivilCraft iestatīt atzīmes un labojiet tā uzskaitītās problēmas.
keywords: konstrukciju veidotājs, konstrukcijas tips, taisnstūra konstrukcija, ūdens uztvērējs, rāmis, pārklājums, sienas biezums, bibliotēkas vienums, cauruļu tīkls, lietusūdens, sadzīves kanalizācija, kanalizācija, konstrukcijas, revīzijas akas, ieteces, atzīmes, pārsegums, slīpums, kritums, malas atzīme, sūkņa bedre, gravitācijas caurules
from: 10a3c14d
---

Projektā ir viens gravitācijas cauruļu tīkls, lietusūdens vai sadzīves kanalizācija. Tas sastāv no konstrukcijām (revīzijas akām, ietekām) un taisnām caurulēm starp tām. Plūsma iet virzienā, kādā zīmējat. CivilCraft pārbauda katru cauruli un konstrukciju pret trim noteikumiem, ko iestatāt, un var iestatīt visas atzīmes pēc šiem noteikumiem.

## Zīmējiet posmu

Caurules var zīmēt bez virsmas, bet malas, pārklājums un automātiskās atzīmes tā vajag.

1. Nospiediet {{key:P}} vai noklikšķiniet {{ui:Caurules}} grupā **Dizains**.
   Norāde saka: "Caurules: noklikšķiniet konstrukcijas no posma augšas uz leju (noklikšķiniet esošu, lai pievienotos). {{key:Enter}} pabeidz."
2. Noklikšķiniet, kur novietot augšpus esošo konstrukciju. Konstrukcija tiek novietota.
3. Noklikšķiniet katru nākamo konstrukciju lejpus. Lai pieslēgtos jau esošai konstrukcijai, noklikšķiniet uz tās: statusa josla rāda "Pievienots S3."
4. Nospiediet {{key:Enter}}.
   Caurules tiek zīmētas, to atzīmes iestatītas pēc noteikumiem, un statusa josla rāda, piemēram, "Uzzīmētas 3 caurules, 12 atzīmes iestatītas pēc noteikumiem; visas pārbaudes izietas."

Jaunas konstrukcijas tiek nosauktas S1, S2 … ar 48 collu (1200 mm) diametru. Jaunas caurules tiek nosauktas P1, P2 … ar 12 collu (300 mm) diametru. Diametri ir collās pēdu projektā un milimetros metru projektā.

Pabeidziet ar {{key:Enter}}. Dubultklikšķis arī darbojas, bet, ja veicat dubultklikšķi uz esošas konstrukcijas, lai posmu tur beigtu, pievienošana tiek atmesta: vispirms vienreiz noklikšķiniet uz tās, pēc tam nospiediet {{key:Enter}}.

## Iestatiet savus noteikumus

Kad nekas nav atlasīts, labajā panelī (**Projekts**) ir bloks **Cauruļu tīkls**:

| Iestatījums | Sākuma vērtība | Nozīme |
|---|---|---|
| Tips | Lietusūdens | {{ui:Lietusūdens}} vai {{ui:Sadzīves kanalizācija}}; tiek ierakstīts LandXML |
| Mazākais slīpums | 0.50% | Katrai caurulei jākrīt vismaz tik daudz |
| Mazākais pārklājums | 2 ft (0.6 m) | No zemes līdz caurules augšai, visā caurulē |
| Kritums konstrukcijās | 0.10 ft (0.03 m) | Izplūdes atzīmei jābūt vismaz tik tālu zem katras ieteces atzīmes |

**Šīs sākuma vērtības ir vietturi, nevis standarts.** Iestatiet vērtības, ko prasa jūsu aģentūra vai projekts. Pārklājums tiek mērīts no zemes līdz caurules augšai (atzīme plus iekšējais diametrs); sienas biezums netiek skaitīts. Kur platformas vai koridori ir izrakti, izraktā virsma ir zeme.

## Ļaujiet CivilCraft iestatīt atzīmes

- {{ui:Iestatīt visas atzīmes pēc noteikumiem}} (blokā **Cauruļu tīkls**) iestata visas caurules.
- {{ui:Iestatīt tās atzīmes pēc noteikumiem}} (ar vienu atlasītu cauruli) iestata tikai šo cauruli.

Strādājot lejup, katrs posms sākas vismaz ar pārklājumu savā augšējā konstrukcijā, krīt vismaz mazāko slīpumu, krīt vismaz kritumu caur katru konstrukciju un iet dziļāk, ja zeme gar cauruli atstātu mazāku pārklājumu par mazāko. Atzīmes tiek noapaļotas uz leju līdz 0.01, nekad uz augšu. Statusa josla rāda "Atzīmes iestatītas: mazākais pārklājums katra posma augšā, vismaz mazākais slīpums, vismaz kritums katrā konstrukcijā." vai nosauc to, ko nevarēja izdarīt.

## Rediģējiet konstrukcijas un caurules

Noklikšķiniet konstrukciju vai cauruli ar {{ui:Atlasīt}}, lai to redzētu labajā panelī.

**Konstrukcija**: **Nosaukums**, **Mala**, **Sūkņa bedres dziļums**, **Diametrs**, tad **Izmantotā mala**, **Sūkņa bedre**, **Austrumi** un **Ziemeļi**, un caurules, kas ieiet un iziet, ar to atzīmēm.

- Atstājiet **Mala** tukšu, lai to ņemtu no virsmas; lodziņš tad rāda virsmas vērtību pelēkā krāsā. Ierakstiet vērtību, lai fiksētu malu.
- Velciet konstrukcijas rokturi plānā, lai to pārvietotu. Tās caurules seko; to atzīmes paliek, kādas bija, tāpēc pēc tam pārbaudiet problēmas.

**Tips**: izvēlieties vienu no tīkla konstrukciju tipiem (zemāk) vai nevienu apaļai konstrukcijai ar tās pašas diametru.

**Caurule**: **Nosaukums**, konstrukcijas, starp kurām tā iet, **Diametrs**, **Augšējā atzīme**, **Apakšējā atzīme**, tad **Garums**, **Slīpums** un **Mazākais pārklājums**.

Pēc katras vērtības nospiediet {{key:Enter}}.

## Lasiet un labojiet problēmas

Bloks **Cauruļu tīkls** uzskaita katru problēmu (līdz 40); noklikšķiniet uz vienas, lai atlasītu cauruli vai konstrukciju. Atlasīta caurule vai konstrukcija uzskaita savas. Ja nekas nav atlasīts, tiek rādīts "Katra caurule un konstrukcija izpilda noteikumus."

| Ziņojums (piemēri) | Ko darīt |
|---|---|
| "P2 iet kalnā (-0.40%)." vai "… iet līdzeni …" | Apmainiet atzīmes vai iestatiet tās pēc noteikumiem. |
| "P2 pie 0.30% ir plakanāka par minimālo 0.50%." | Pazeminiet lejupejošo atzīmi vai paaugstiniet augšupejošo. |
| "P3 ir 1.40 pārklājuma gar sevi, kas ir mazāk par minimālo 2." | Pazeminiet cauruli; iestatiet tās atzīmes pēc noteikumiem. |
| "S3 iekšienē P4 iziet ar 245.20, kas ir mazāk par 0.1 zem P3 ieejas 245.25." | Pazeminiet izejas caurules augšējo atzīmi. |
| "P1 malas augšdaļa ir virs S1 malas." | Caurule ir pārāk augstu konstrukcijai. |
| "S2 no tās iziet 2 caurules; gravitācijas tīklam vajadzētu būt vienam ceļam no katras konstrukcijas." | Noņemiet vienu izejošo cauruli vai pārzīmējiet to pareizā virzienā. |
| "Caurules veido cilpu; plūsmai jābeidzas izplūdē." | Posms zīmēts atpakaļ pats uz sevi; dzēsiet vienu cauruli. |
| "S5 atrodas ārpus virsmas un tai nav malas atzīmes." | Ierakstiet malu vai pārvietojiet konstrukciju uz virsmas. |
| "P6 daļēji iet ārpus virsmas; pārklājums tur nav zināms." | Paplašiniet virsmu vai pieņemiet, ka pārklājums tur netiek pārbaudīts. |
| "P7 vēl nav atzīmju." | Ierakstiet tās vai iestatiet tās pēc noteikumiem. |

Problēmu caurules un konstrukcijas plānā atzīmētas arī sarkanā krāsā.

## Konstrukciju tipi

Konstrukciju tips ir konstrukcija, kas veidota pēc tās parametriem: revīzijas aka, ieteka, savienojuma kaste vai izeja, **apaļa** (iekšējais diametrs) vai **taisnstūra** (iekšējais platums un garums), ar tās **sienas biezumu**, **grīdas plāksni**, **sūkņa bedri** zem zemākās caurules un **rāmi un vāku** (apaļu vai taisnstūra atveri, rāmja augstumu). Tipi pieder tīklam un atrodas zem **Konstrukciju tipi** projekta Rekvizītos.

1. Noklikšķiniet {{ui:Jauns konstrukcijas tips}}. Dialogs zīmē konstrukciju plānā un griezumā, kamēr rakstāt.
2. Noklikšķiniet {{ui:Pievienot tipu}}.
3. Atlasiet konstrukciju un izvēlieties tipu zem **Tips**. Tā pārņem tipa izmēru un sūkņa bedri; tās pašas sūkņa bedri var joprojām mainīt.

Rediģējiet tipu, un katra šā tipa konstrukcija seko tā izmēriem. Noņemiet tipu, un tās konstrukcijas paliek kā apaļas konstrukcijas tādā pašā platumā. Katra izmaiņa ir viens solis: {{key:Mod+Z}} to atsauc.

Taisnstūra konstrukcija tiek zīmēta plānā, DXF, DWG un PDF, un 3D kā taisnstūris ar garumu gar savu izejas cauruli; caurules sākas pie tās sienas. LandXML to raksta kā taisnstūra konstrukciju (`RectStruct`) ar sienas biezumu un nolasa šādas konstrukcijas atpakaļ kā tipus.

### Kopīgojiet tipu caur bibliotēku

{{ui:Saglabāt kā bibliotēkas vienumu}} ieraksta tipu kā CadCraft bibliotēkas vienumu (`.json` fails): tā plāna simbolu, 3D korpusu līdz tipiskam dziļumam un visus izmērus. Augšupielādējiet to bibliotēkā, lai kopīgotu. {{ui:Atvērt bibliotēkas vienumu}} nolasa šādi saglabātu konstrukciju atpakaļ tīklā, pārvērtot projekta mērvienībās. Bibliotēkas vienumi, kas nav CivilCraft veidotas konstrukcijas, tiek noraidīti, un iemesls tiek norādīts.

## Dzēšana

Atlasiet cauruli un nospiediet {{key:Delete}}, lai to noņemtu. Konstrukcijas dzēšana noņem arī ar to savienotās caurules. Mac datorā nospiediet Fn un dzēsiet vai noklikšķiniet {{ui:Dzēst}}.

## Vēl nav izveidots

Plūsmas, cauruļu izmēri un hidrauliskā enerģijas līnija ir [Lietusūdens novadīšana](topic:storm-drainage). Cauruļu katalogi, nenoapaļotas caurules, caurules garenprofila skatā, izliektas caurules un vairāk nekā viens tīkls vienā projektā vēl nav pieejami. Skatiet [Vēl nav izveidots](topic:not-built-yet).
