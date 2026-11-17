---
title: Joonistamine haakumistega, valitud nurgad ning teisaldamine, kopeerimine ja pööramine
summary: Paiguta trassid, platsid, kinnistud ja tunnusjooned täpselt olemasolevatele punktidele ja nurkadele, sisesta või vali nurga idakoordinaat ja põhjakoordinaat, pööra puutuja kahe punkti poole ning teisalda, kopeeri või pööra objekti kauguse või nurga järgi.
keywords: haakumine, haakumised, osnap, haakumine punktile, haakumine nurgale, PI, tipp, nurk, valimine, ristkursor, idakoordinaat, põhjakoordinaat, koordinaadid, sisestatud koordinaadid, puutuja, suund, asimuut, teisalda, kopeeri, pööra, teisenda, kopeeri pööratult, dubleeri, alt, vaba punkt, joonistamine
from: 49864dda
---

Uues versioonis 0.9: kui joonistad, hüppab kursor plaanil juba olemasolevatele punktidele ja nurkadele ning platsi, kinnistu või tunnusjoone nurga saab sisestada või valida. See teema käib läbi kolm tööriista.

## Mida sa teed

- Joonista haakumistega, nii et uus trass, plats, kinnistu või joon algab ja lõpeb täpselt millelgi, mis juba on.
- Sea nurga idakoordinaat ja põhjakoordinaat, kas sisestades või valides koha plaanil.
- Pööra trassi puutuja kahe valitud punkti poole.
- Teisalda, kopeeri või pööra kogu objekti.

## Sammud

1. Vali joonistustööriist, näiteks {{ui:Trass}}, {{ui:Plats}}, {{ui:Kinnistu}} või {{ui:Tunnusjoon}}. Liiguta kursor mõõdistuspunkti, trassi PI, platsi, kinnistu või massi nurga, tunnusjoone tipu või sadeveerajatise lähedale. Ilmub marker sildiga (PI, Nurk, Tipp, Rajatis või Punkt ja selle number) ning idakoordinaat ja põhjakoordinaat, kuhu see maandub. Klõpsa, et punkt sinna asetada.
2. Punkti vabalt paigutamiseks hoia klõpsamise ajal all {{key:Alt}}. Haakumine lülitub välja.
3. Vali plats, kinnistu või tunnusjoon. Jaotises **Omadused** loetleb plokk {{ui:Nurgad}} iga nurga koos idakoordinaadi ja põhjakoordinaadi väljadega. Sisesta uued numbrid või vajuta ristkursori nuppu nurga kõrval ja klõpsa kohta plaanil. Nurk võtab selle idakoordinaadi ja põhjakoordinaadi. Vajuta {{key:Esc}}, et valimine tühistada. Ristkursor töötab ainult plaanil: sulge enne 3D-vaade.
4. Puutuja pööramiseks vali trass. Jaotises **Omadused** all {{ui:Puutuja kahest punktist}} vali puutuja, vajuta {{ui:Esimene punkt}} ja klõpsa plaanil, vajuta {{ui:Teine punkt}} ja klõpsa uuesti ning vajuta {{ui:Määra suund}}. Puutuja pöördub nii, et kulgeb esimesest punktist teise poole ja säilitab oma pikkuse.
5. Teisaldamiseks, kopeerimiseks või pööramiseks vali trass, plats, kinnistu või tunnusjoon. Jaotises **Omadused** all {{ui:Teisalda, kopeeri ja pööra}} sisesta {{ui:Teisalda itta}} ja {{ui:Teisalda põhja}} (negatiivsed arvud on lääs ja lõuna) ning vajuta {{ui:Teisaldamine}} või {{ui:Kopeeri}}. Või vajuta {{ui:Kaugus kahest punktist}} ja klõpsa punktil, millest liigutada, ning punktil, kuhu liigutada.
6. Pööramiseks sisesta nurk väljale {{ui:Pööra vastupäeva}} (kraadides) ja vajuta {{ui:Pööra}} või {{ui:Kopeeri pööratult}}. See pöörleb ümber oma nurkade keskpunkti, kui sa ristkursoriga ei vali nurga kõrval punkti, mille ümber pöörata.

## Märkused

- Kopeerimine jätab originaali oma kohale ja valib koopia pärast.
- Iga teisaldamine, kopeerimine, pööramine, valitud nurk ja pööratud puutuja on üks võtmistagasi samm.
- Haakumised ulatuvad 10 ekraanipiksli kaugusele kursorist. Haakumismarker ainult pakub kohta; midagi ei muutu enne, kui klõpsad.
- Sama ristkursor on trassi PI ridadel. Vaata [Trassid](topic:alignment), [Kinnistud](topic:parcels) ja [Tunnusjooned](topic:feature-lines).
