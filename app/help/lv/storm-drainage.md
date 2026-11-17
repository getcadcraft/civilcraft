---
title: Aprēķināt lietus plūsmas, cauruļu izmērus un hidraulisko gradienta līniju
summary: Zīmēt baseinus, kas novada uz katru konstrukciju, saskaitīt plūsmas tīklā ar racionālo metodi, noteikt cauruļu izmērus pēc Manninga vienādojuma un redzēt, kur hidrauliskā gradienta līnija ir pilna vai sasniedz virsmu.
keywords: lietus ūdens novadīšana, baseins, novadīšanas laukums, racionālā metode, noteces koeficients, koncentrācijas laiks, nokrišņu intensitāte, idf, manning, cauruļu izmēra noteikšana, hidrauliskā gradienta līnija, hgl, enerģijas gradienta līnija, egl, pārslodze, applūšana, astes ūdens
from: e44872ec
---

Lietus ūdens novadīšana darbojas uz [cauruļu tīkla](topic:pipe-network): vispirms zīmējiet tīklu, tad laukumus, kas tajā novada. Viss parādās sadaļā **Lietus ūdens novadīšana** labajā panelī, kad nekas nav atlasīts.

## Zīmēt baseinu

1. Noklikšķiniet uz **Zīmēt baseinu** zem **Lietus ūdens novadīšana**.
2. Noklikšķiniet uz tā laukuma stūriem, kas novada uz vienu konstrukciju. {{key:Enter}} vai dubultklikšķis pabeidz; {{key:Backspace}} atceļ pēdējo stūri, {{key:Esc}} aptur.
3. Baseins novada uz konstrukciju, kas atrodas tā iekšpusē, citādi uz tuvāko. Atveras tā **Rekvizīti**: iestatiet tā nosaukumu, **Noteces koeficientu C** (lietus daļa, kas noteek, no 0 līdz 1), **Koncentrācijas laiku** minūtēs un to, uz kuru konstrukciju tas **Novada uz**.

**Zīmēt citu baseinu** tā rekvizītos sāk nākamo. Plānā noklikšķiniet baseina iekšpusē, lai to atlasītu; {{key:Delete}} to noņem. Katra izmaiņa ir viens solis: {{key:Mod+Z}} to atsauc.

## Iestatīt projektēto lietu

Nokrišņu intensitāte ir i = a ÷ (tc + b) pakāpē c, collās stundā pēdu projektam un milimetros stundā metru projektam. Pielāgojiet **Intensitāti a**, **b** un **c** savai intensitātes–ilguma–biežuma līknei projektētajam atkārtošanās periodam.

:::warning
Sākotnējā intensitātes līkne, Manninga n (0.013) un mezgla zudums (0.5) ir vietturi, nevis standarts. Iestatiet tos pēc saviem nokrišņu datiem un projektēšanas kritērijiem.
:::

- **Īsākais koncentrācijas laiks**: neviena caurule netiek aprēķināta īsākam laikam (sākotnēji 10 minūtes).
- **Manninga n**: cauruļu raupjums.
- **Mezgla zudums**: spiediena augstums, kas zaudēts katrā konstrukcijā, kā daļa no ātruma augstuma V²/2g izejošajai caurulei.
- **Ūdens līmenis izplūdē**: astes ūdens, kur iztek pēdējā caurule. Atstājiet tukšu, ja izplūde ir brīva.

## Kā plūsmas saskaitās

Katra caurule nes visus baseinus virs tās. Q = C × i × A, kur C × A tīklā tiek summēts lejup, un i ir intensitāte pie garākā koncentrācijas laika no pienākošā ūdens: paša baseina laiks vai laiks no augšpus baseina plus ceļošanas laiks caur caurulēm (garums ÷ ātrums pilnā caurulē). Q ir kubikpēdās sekundē (A akros) vai kubikmetros sekundē (A hektāros).

## Cauruļu izmēru noteikšana

Tabulā zem **Plūsmas un gradienta līnijas** katrai caurulei parādīta plūsma, ko tā nes pilnā caurulē savā slīpumā, ātrums, hidrauliskais gradients tās augšā un apakšā un cik dziļi tā plūst.

**Noteikt cauruļu izmērus šīm plūsmām** katrai caurulei piešķir mazāko standarta izmēru, kas nes tās plūsmu savā slīpumā (12 līdz 72 collas vai 300 līdz 1800 mm). Tas ir viens solis. Dibena atzīmes paliek, kur tās ir: ja izmēri mainās, izmantojiet **Iestatīt visas atzīmes pēc noteikumiem**, lai saglabātu seguma dziļumu, un pēc tam pārbaudiet tabulu vēlreiz.

## Gradienta līniju nolasīšana

Hidrauliskā gradienta līnija (HGL) tiek aprēķināta no izplūdes augšup:

- Caurulei, kas plūst daļēji pilna, HGL atrodas ūdens virsmā: dibena atzīme plus normālais dziļums.
- Kad ūdens zemāk ir augstāks par tās augšējo malu vai tā nes vairāk, nekā var pilnā plūsmā, tā plūst pilna (ar pārslodzi) un tās HGL paceļas par berzes slīpumu visā garumā.
- Katrā konstrukcijā HGL ir izejošās caurules augšējais HGL plus mezgla zudums.
- Enerģijas gradienta līnija (EGL) ir HGL plus ātruma augstums.

Caurule, kas plūst pilna, ir uzskaitīta, tāpat jebkura konstrukcija, kur HGL ir virs malas: ūdens tur sasniedz virsmu, un konstrukcija plānā ir iezīmēta sarkanā krāsā. Atlasiet cauruli vai konstrukciju, lai redzētu tās plūsmu, dziļumu, ātrumu un abas gradienta līnijas tās rekvizītos.

## Lietus gaitas aprēķins

Racionālā metode dod vienu maksimumu katrai caurulei. {{ui:Aprēķināt lietu}} (zem rezultātiem, tīkla rekvizītos) aprēķina visu lietu: katra baseina noteci laikā, novadītu lejup pa caurulēm ar to ceļošanas laiku un uzkrāšanu un summētu, kur tie saplūst.

1. Atstājiet tukšus {{ui:Lietus ilgst}} un {{ui:Lietus intensitāte}}, lai izmantotu garāko koncentrācijas laiku un augstāk minēto nokrišņu līkni, vai ierakstiet savas vērtības.
2. Nospiediet {{ui:Aprēķināt lietu}}. Tabulā katrai caurulei uzskaitīta lielākā ieplūde un izplūde, cik zemāks ir izejošais maksimums, cik daudz no tās pilnās jaudas tā izmanto un minūte, kurā tas sasniedz maksimumu.
3. Katrai izplūdei ir neliela plūsmas laikā diagramma un {{ui:Lejupielādēt hidrogrāfu (CSV)}}.

Baseins izvada lietu, vidēji aprēķinātu pa tā koncentrācijas laiku, tāpēc īsāka lietus gāze sasniedz zemāku maksimumu nekā C × i × A. Katra caurule tiek aprēķināta ar Muskingum–Cunge metodi, izmantojot plūsmas dziļumu, ko racionālā metode jau atrada. Divi zari ar dažādiem koncentrācijas laikiem nesasniedz maksimumu kopā, tāpēc to summa ir zemāka par maksimumu summu.

Šajā aprēķinā netiek modelēta pārslodze, atpludinājums, uzkrāšana konstrukcijās vai applūšana. Caurule, kuras aprēķinātais maksimums ir virs pilnās jaudas, ir uzskaitīta, un tās ūdens tiek nodots tālāk tā, it kā tas ietilptu. Izmantojiet to, lai redzētu laiku un slāpēšanu, nevis lai noteiktu cauruļu izmēru. Tas ir aprēķina palīglīdzeklis: to pārbauda inženieris.

## Saglabāts ar projektu

Baseini un lietus iestatījumi tiek saglabāti projekta failā. Tie vēl nav PDF zīmējumā, DWG vai DXF failā vai LandXML: skatiet [Vēl nav izveidots](topic:not-built-yet).
