---
title: Pustite AI pomočniku delati z vašo lokacijo
summary: Vklopite pomočnike v Nastavitvah, da lahko pomočnik v vašem računalniku prebere odprto lokacijo (točke, površja, prostornine, profile, parcele), doda geodetske točke, shrani in izvozi LandXML ali DWG prek CadCraft Studia. Dokler ga ne vklopite, je izklopljen.
keywords: umetna inteligenca, ai, pomočnik, mcp, skripta, avtomatizacija, studio, točke, višina, stacionaža, odmik, trasa, prostornina, izkop, nasip, profil, parcela, landxml, dwg, usd, mape, dovoljenja, odklop, dejavnost
from: d0356582
---

## Kaj se naučite

Kako pustiti AI pomočniku (kateremukoli pomočniku, ki podpira MCP) delati z odprto lokacijo, kaj lahko in česa ne more storiti ter kako ga ustaviti.

## Kaj lahko pomočnik naredi v CivilCraftu

| Zahteva | Kaj dobi | Potrebuje |
|---|---|---|
| Lokacija | Ime, enote, koordinatni sistem, skupine točk, trase, površja, ploščadi, parcele in cevi | Branje |
| Geodetske točke | Številka, vzhodna, severna, višina in opis, po skupini, po opisu ali znotraj okvirja | Branje |
| Višine površja | Obstoječi teren (ali urejeno površje) na poljubnih točkah, ki jih navede | Branje |
| Stacionaže in odmiki | Stacionaža in odmik točk vzdolž trase ali koordinate in višina terena stacionaž | Branje |
| Profil | Višine terena, načrtovanega profila in urejene površine vzdolž trase, na vsakih toliko ft ali metrov | Branje |
| Izkop in nasip | Prostornine med obstoječim terenom in urejeno površino (tudi za vsako ploščad in koridor) ali med terenom in ravnjo | Branje |
| Parcele | Oglišča, površina (v akrih ali hektarjih), obseg in opis parcele | Branje |
| Izbor | Točke, ki jih navede, so izbrane na načrtu, kot da bi jih izbrali vi | Urejanje |
| Nove geodetske točke | Točke, dodane s številkami, ki jih navede, ali naslednjimi prostimi. Vsak klic je en korak, ki ga lahko razveljavite | Urejanje |
| Shranjevanje | Lastni gumb {{ui:Shrani}} v CivilCraftu | Shrani |
| LandXML ali DWG | Enake datoteke kot gumba {{ui:LandXML}} in {{ui:DWG}} | Izvoz |
| Lokacija v 3D | OpenUSD (.usdz, .usda ali .usdc) terena, urejene površine, ploščadi in cevi, kot jo izvozi 3D pogled | Izvoz |
| Rastline in seznam rastlin | Rastline, najdene v seznamu rastlin po katerem koli imenu, in števila iz seznama rastlin | Branje |
| Sajenje in urejanje terena | Rastline, greda ali živa meja, postavljena, ali ploščad, brežina, jarek ali območje planiranja, dodano; vsaka je en korak, ki ga lahko razveljavite, s svojim izkopom in nasipom | Urejanje |
| Preverjanje namakanja | Pretok vsake cone, tlak, potreben na njenem ventilu in na dovodu, najneugodnejša višina, časi delovanja, težave in kosovnica, kot računski pripomoček, ki ga preveri projektant namakanja | Branje |

Deluje z lokacijo, ki je odprta. V Studiu lahko shranjuje in izvaža tudi v mape, ki jih izberete (spodaj); brez mape se njegove datoteke prenesejo enako kot pri gumbih.

## Vklop

Pomočniki dostopajo do CivilCrafta prek CadCraft Studia v vašem računalniku; navaden brskalnik nima poti do njega.

1. Odprite {{ui:Nastavitve}} in izberite zavihek **CivilCraft**.
2. Pod **Pomočniki** označite **Dovoli AI pomočnikom in skriptam uporabo CivilCrafta**.
3. **Branje** je za vas že označeno. Označite **Urejanje**, **Shrani** ali **Izvoz** samo, če pomočnik to potrebuje.
4. Če želite, da lahko shranjuje in izvaža v mapo, izberite {{ui:Dodaj mapo…}} pod **Mape, ki jih sme uporabljati**, in izberite mapo v pogovornem oknu Studia. {{ui:Odstrani}} jo takoj vzame nazaj; vsaka druga pot je zavrnjena.
5. Povežite pomočnika v Studiu (Studio pokaže naslov in nastavitve, ki jih prilepite vanj).

## Ko je pomočnik povezan

Opomba na vrhu desnega panela pove, kateri pomočnik je povezan in kaj lahko počne. Kliknite {{ui:Prekini povezavo}}, da takoj končate njegovo sejo; za nadaljevanje se mora znova povezati.

**Dejavnost**, pod **Pomočniki** v Nastavitvah, navaja vsak klic, ki ga je pomočnik naredil, od najnovejšega, in ali je uspel.

:::tip
Vprašajte z običajnimi besedami, na primer „Kakšna je višina terena na vsakih 50 ft ob Main Streetu?“, „Koliko izkopa in nasipa potrebujejo ploščadi?“ ali „Dodaj kontrolno točko na teh koordinatah.“ Pomočnik prebere lokacijo in odgovori ali naredi spremembo kot en korak, ki ga lahko razveljavite.
:::

## Brez odpiranja CivilCrafta

Datotečni strežnik CadCraft za pomočnike (`npx @getcadcraft/mcp`) in ukazna vrstica `cadcraft` odpirata shranjene projekte CivilCrafta (`.civilcraft.json`) in datoteke točk z lastno kodo CivilCrafta, brez okna: enaka orodja za branje, dodajanje točk, shranjevanje projekta, LandXML in lokacijo v 3D kot OpenUSD. `cadcraft convert site.civilcraft.json site.xml` zapiše LandXML iz ukazne vrstice. Odpiranje LandXML, izvoz DWG in orodja delovnega okolja Landscape še vedno potrebujejo okno CivilCrafta.

## Izklop

Odznačite **Dovoli AI pomočnikom in skriptam uporabo CivilCrafta**. Vsi pomočniki so takoj odklopljeni, nastavitev pa se ohrani za naslednjič.

## Glejte tudi

- [Recepti za AI pomočnike](common:assistants-recipes): delovni primeri, vsak z orodji, ki jih kliče.
- [Izrisovanje vodoravne trase](topic:alignment)
- [Izdelava in dopolnjevanje površja](topic:build-surface)
- [Izbor, kopiranje in prilepljanje geodetskih točk](topic:copy-paste-points)
- [Nastavitve CivilCrafta](topic:settings)
