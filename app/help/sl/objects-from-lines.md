---
title: Objekti iz črt, ki ostanejo povezani
summary: Naredite tlakovanje, zasajeno površino, gredo, živo mejo, pot, zid, robnik, stopnice, rampo, ploščad, jarek ali karakteristično črto iz črte; sledi, ko se črta premakne, dokler povezave ne prekinete.
keywords: iz črte, črtovje, DWG, DXF, povezava, povezan, sledenje, ponovno ustvari, prekini povezavo, karakteristična črta, karakteristična črta iz črtovja, uvožen sloj, obris, supercad studio, risalna črta
from: eb67a0c6
---

{{ui:Iz črte}} (Krajinsko oblikovanje › {{ui:Več}}): kliknite karakteristično črto ali črto oziroma obris uvoženega sloja DWG/DXF. Zaprta črta lahko naredi tlakovanje, travnik, zasajeno gredo, travišče, zemeljsko rastje, gredo ali ploščad; odprta črta pa pot, zid, robnik, stopnice (njihova prva in zadnja točka), rampo, živo mejo ali jarek. Vsaka vrsta lahko naredi **karakteristično črto**, razen same karakteristične črte.

## Karakteristična črta iz črte

Karakteristična črta, narejena iz črte, prevzame njene točke, zaprta, če je bila črta zaprta. Njene kote so položene na obstoječi teren (0, kjer ga še ni), njena uporaba pa je **Izključeno**: ne oblikuje terena, dokler ne izberete uporabe in ne nastavite njenih kot v njenih Lastnostih. Ko se črta premakne, karakteristična črta z enakim številom točk ohrani vsako koto, ki ste jo nastavili; ko črta pridobi ali izgubi točke, se kote znova položijo na teren. Glejte [Karakteristične črte](topic:feature-lines).

Novi objekt ohrani **povezavo** na svojo črto. Ko se črta premakne (povlečete njene točke ali se risba premakne ali znova prebere), objekt prevzame novo obliko v istem koraku razveljavitve, prek modifikatorjev terena pa načrtovani teren sledi. Lastnosti povedo, na kaj je povezan; {{ui:Prekini povezavo}} ga naredi prostega.

Črte se najprej preverijo: črta potrebuje vsaj 2 točki (3 za obris), največ 5000, realna števila; obris mora biti zaprt in se ne sme sekati sam s sabo. Črta, ki ne uspe, se ne uporabi: objekt ostane, kot je bil, podokno Težave pa pove zakaj. Če se črta izbriše, objekt ostane, podokno Težave pa to zabeleži.

## V SuperCad Studio

Odprite mesto in 2D risbo v istem projektu. Izberite eno črto ali polilinijo v 2D risbi, pritisnite Ctrl+K in zaženite {{ui:Krajinski objekt iz izbrane črte risbe}}: CivilCraft vpraša, kaj naj naredi, kot zgoraj, objekt pa ostane povezan s to črto risbe. Ko spremenite črte v risbi, Ctrl+K {{ui:Posodobi krajinsko oblikovanje iz risbe}} naredi, da objekti sledijo, en korak razveljavitve za vsako črto. Datoteka povezav projekta beleži, kateri objekt sledi kateri črti. Pomoč SuperCad Studio ima temo Krajinsko oblikovanje.
