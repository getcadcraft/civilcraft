---
title: Mga plant record, cultivar at ibinigay na sukat
summary: Ang sarili mong listahan ng halaman ng proyekto bilang talahanayan: cultivar, ibinigay na sukat (lalagyan, rootball, girth, clear stem), density, mga tala ng specification, CSV papasok at palabas; bawat nailagay na halaman ay may pinangalanang sukat; mga simbolo ng halaman ayon sa scale at sarili mong simbolo at 3D model.
keywords: plant table, database ng halaman, cultivar, variety, ibinigay na sukat, container, rootball, root ball, bare root, girth, clear stem, density, halaman bawat metro kuwadrado, specification, spec notes, simbolo ng halaman, block, sariling simbolo, 3D na halaman, antas ng detalye, scale
from: 12251beb
---

Buksan ang {{ui:Plant table}} mula sa menu na {{ui:More}} ng grupong Landscape, o mula sa seksyong Plants. Ang bawat hilera ay isang plant record sa sariling listahan ng proyektong ito (kinokopya ang record mula sa listahan ng halaman kapag idinagdag mo ito). Bawat pag-edit ay sinusuri na parang inaangkat na file, at bawat isa ay isang undo step.

## Mga column

- **Botanical name**, **Common name**, **Type**, **Height** at **Spread** sa maturity (metro).
- **Spacing** (sentro hanggang sentro) o **Density** (halaman bawat m²). Ang bed ng record na may density at walang spacing ay pupunuin sa density na iyon, ayon sa sarili nitong pattern (triangular o square).
- **Supplied sizes**: isang entry bawat sukat, pinaghihiwalay ng `;`. Bawat entry ay may id, uri (`container`, `rootball`, `wrapped`, `bareroot`, `plug`, `seed`), at alinman sa: volume `10L`, taas `h0.6`, spread `s0.4`, girth `g14-16` (cm), clear stem `st1.8`. Halimbawa: `c10 container 10L h0.6; rb rootball h3 g14-16 st1.8`.
- **Cultivars**: mga pangalan na pinaghihiwalay ng `;`. Pinananatili ng cultivar ang sarili nitong sukat at tala kapag may ganito ang inangkat mong file.
- **Specification notes**.

Kinokopya ng {{ui:Duplicate}} ang isang hilera sa ilalim ng bagong key; isinusulat ng {{ui:Save as CSV}} at {{ui:Save as a plants file}} ang listahan (nasa ilalim ng kanilang species ang mga CSV row ng cultivar, kasama ang `cultivar_of`). Kapag nag-import ng CSV o plants file, pinagsasama ito.

## Sarili mong Library plant list

Mag-sign in sa iyong CadCraft account (Mga setting, Mga add-on mo, Mag-sign in) at magagamit ng plant table ang listahang iniingatan mo sa Library:

- {{ui:From my Library list}} ay nag-aangkat ng sarili mong plant item (kasama ang mga naghihintay pa ng review). Ang halamang mayroon ka na rito ay ina-update mula sa Library; pinananatili ang mga cultivar, ibinigay na sukat, density at specification na idinagdag mo rito.
- {{ui:Save as a plant list}} ay nagse-save ng bawat hilera bilang sarili mong plant item sa Library, isang item bawat species: ang bagong halaman ay bagong item, ang binagong halaman ay bagong bersyon, at ang hindi nabago ay iniiwan. Lagyan muna ng tsek ang kahon: ibinibigay ng pag-save ang mga halaman sa publiko sa ilalim ng CC0. Sinusuri ng tao ang unang pampublikong upload ng taong hindi pa pinagkakatiwalaan bago ito lumitaw, gaya ng bawat upload.

Pangunahing plant record lamang ang tinatago ng Library. Nananatili sa proyekto at sa plants file ({{ui:Save as a plants file}}) ang mga cultivar, ibinigay na sukat, density at tala ng specification; sinasabi ng dialog kung ilang hilera ang maaapektuhan tuwing magse-save ka.

## Ang nailagay na halaman ay may pinangalanang sukat

Pumili ng halaman, hedge, o mix row ng bed o planted area: kapag may cultivar o ibinigay na sukat ang record, pumipili ang {{ui:Cultivar and size}} ng isa. Binibilang ng plant schedule ang mga halaman ayon sa species, cultivar at sukat, at maaaring ipakita ng label ang mga ito: `{botanical} '{cultivar}' {size}` o `{full}`.

## Mga simbolo ng halaman ayon sa scale

{{ui:Plant graphics}} (Landscape › More) ang nagtatakda kung paano iginuguhit ang mga halaman sa plano: **automatic** (mas magaspang sa 1:500, isang bilog sa spread; sa pagitan ng 1:200 at 1:500, isang outline na may sentro; mas pino, ang detalyadong simbolo; maaaring baguhin ang dalawang scale), o isang antas para sa bawat scale. May sariling **Plant detail in plan** ang Sheets dialog para sa set na iyon.

Sa isang record sa seksyong Plants, binabasa ng {{ui:Own symbol…}} ang SVG, o block ng DXF/DWG drawing, at iginuguhit ito sa spread ng halaman sa detalyadong antas. Binabasa ng {{ui:Own 3D model…}} ang OBJ, STL o GLB; sa Plant graphics, piliin ang **Each record's own model** para makita ito sa 3D. Limitado ang mga file (512 KB na SVG, 2000 shape, 50 000 triangle) at nakatago sa proyekto. Hindi ina-apply ang mga SVG transform (sasabihan ka kapag may taglay na transform ang file). Tingnan ang [Graphics ng halaman, sariling simbolo at 3D na halaman](topic:plant-graphics) para sa mga antas, limit, at kung ano ang maaaring taglayin ng GLB.
