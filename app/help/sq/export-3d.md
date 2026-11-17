---
title: Eksporto vendin në 3D
summary: Ruani atë që shfaq pamja 3D si skedar GLB ose OBJ për programe të tjera 3D, në metra me Y lart, rreth një origjine lokale që skedari e regjistron.
keywords: glb, gltf, obj, eksport 3d, eksport modeli, motor lojërash, vizualizim, shikues 3d, metra, y lart, origjinë, origjinë lokale, sistem shtetëror
from: 07d23992
---

Pamja 3D eksporton atë që shfaq si një model 3D që një program tjetër mund ta hapë: një shikues 3D, një modelues, një motor lojërash ose një mjet vizualizimi.

## Eksporto

1. Hapni pamjen 3D ({{key:D}}) dhe zgjidhni çfarë shfaqet me {{ui:Show}}. Ajo që është fshehur nuk eksportohet.
2. Klikoni {{ui:GLB}} ose {{ui:OBJ}} te shiriti.
   Skedari shkarkohet si "*emri i projektit*-3d.glb" ose "-3d.obj", dhe shiriti i statusit thotë origjinën.

## Çfarë mbajnë skedarët

| | GLB | OBJ |
|---|---|---|
| Sipërfaqet | Rrjete me normale dhe ngjyrat e brezave ose sipërfaqeve | Rrjete me normale (pa ngjyra) |
| Tubat dhe strukturat | Rrjete të rrumbullakëta, ato me probleme në të kuqe | Rrjete të rrumbullakëta |
| Izoipsat, vijat e thyerjes, aksët rrugorë, shenjat, vijat e korridorit dhe të platformave | Vija, secila grup në ngjyrën e vet | Regjistrime vijash (`l`) |
| Pikat e rilevimit | Pika | Regjistrime pikash (`p`) |

Çdo grup e mban emrin e vet ("Existing ground", "Pipes", "Major contours" e kështu me radhë), kështu që mund ta fshihni ose ta stiloni në programin tjetër.

## Njësitë, boshtet dhe origjina

- **Metra.** Një projekt në këmbë konvertohet nga këmbët e anketës amerikane (1 ft = 1200/3937 m).
- **Y lart**, konventa e zakonshme për këto formate: lindja bëhet +X, kota +Y, dhe veriu −Z.
- **Shkallë e vërtetë.** Ekzagjerimi vertikal i pamjes nuk aplikohet.
- **Një origjinë lokale.** Koordinatat e sistemit shtetëror janë miliona këmbë, shumë të mëdha për numrat me saktësi të thjeshtë (single-precision) që ruajnë këto formate, kështu që skedari shkruhet relativ ndaj një origjine të afërt: origjina e vetë terrenit ekzistues për lindjen dhe veriun, dhe kota e tij më e ulët, e rrumbullakosur poshtë. Origjina, në njësitë e projektit, regjistrohet në skedar: në një GLB si `extras` te skena dhe nyja e saj e sipërme, në një OBJ si rresht komenti afër fillimit (`# origin easting … northing … elevation …`). Për ta vendosur modelin sërish në koordinatat e projektit, shtoni origjinën (pasi konvertoni metrat sërish në këmbë te një projekt në këmbë).

## Ende nuk është ndërtuar

- Eksportimi i pamjes së ekzagjeruar, ose eksportimi në njësitë e projektit në vend të metrave.
- Teksturat, një skedar materialesh për OBJ (.mtl) dhe vetitë për objekt (emrat e tubave dhe strukturave janë vetëm në CivilCraft).
- Eksportimi i korridorit si trupa të ndarë, ose pamja e profilit në 3D.
