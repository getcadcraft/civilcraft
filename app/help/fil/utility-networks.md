---
title: Mga utility network at OpenStreetMap
summary: Mga takbo ng tubig, imburnal, storm, gas, kuryente at telecom na may material, sukat, cover at may-ari; datos ng OpenStreetMap mula sa Overpass JSON file; mga crossing, trench section at volume; service layer sa DWG, DXF at PDF; IFC pipe at cable segment.
keywords: utility, utilities, network, osm, openstreetmap, overpass, tubo, cable, gas, imburnal, storm, telecom, kuryente, tubig, hydrant, manhole, trench, crossing, clearance, cover, lalim, dwg, ifc, georeferenced, layers
from: 8a85dace
---

Iguhit ang mga nakabaong serbisyo ng isang site bilang isang network kada serbisyo, tingnan kung saan sila nagtatawiran, at i-export ang mga ito bilang drawing layer at bilang IFC.

## Gumawa ng mga run

Buksan ang **Surface, Iba pa, Mga utility network...**

- **Gumawa ng run mula sa selection** ay ginagawang run ng serbisyong pinili mo ang napiling alignment, feature line o pipe. Pagkatapos, punan sa table ang material, sukat (mm), cover (ang lalim hanggang sa itaas ng tubo o cable) at may-ari.
- **Basahin ang datos ng OpenStreetMap** ay bumabasa ng Overpass JSON file na na-save mo (isang query na may `out geom;`). Kailangan muna ng proyekto ng coordinate system, dahil ang posisyon sa OpenStreetMap ay latitude at longitude. Binabasa ang mga pipeline (ayon sa substance), underground na power at telecom cable, hydrant, manhole at storm drain; ang iba pa ay binibilang bilang naiwan at sinasabi sa mensahe. Hindi kasama ang overhead lines.
- **Idagdag ang OpenStreetMap map** ay nagdaragdag ng OpenStreetMap map sa ilalim ng plano. Lumalabas lang ito kapag naka-on ang map layers mula sa internet sa Settings.

## Mga tseke at output

- **Crossing**: ang mga run ng magkaibang serbisyo na nagtatawiran sa plan ay nakalista kasama ang malinaw na taas sa pagitan nila kung may ground surface; ang minimum ay placeholder na itinakda mo, hindi numero ng isang standard.
- **Trench**: bawat run ay may trench (sukat ng tubo plus clearance sa bawat gilid, side slope, bedding) na may volume. Ipinapakita ang kabuuan sa window at sa CSV.
- **Drawing**: ang mga run at punto ay nasa service layer (halimbawa U-WATR-RUN, U-POWR-RUN), kaya umaabot sa PDF, DXF at DWG.
- **IFC**: ang mga run ay napupunta sa IFC export bilang pipe segment at cable segment, kasama ang hydrant, valve at chamber, isang system kada serbisyo, sa coordinate system ng proyekto.

## Datos ng OpenStreetMap

Ang datos ng OpenStreetMap ay copyright ng OpenStreetMap contributors at lisensyado sa ilalim ng ODbL. Idinadagdag ang attribution sa drawing, sa CSV at sa IFC. Kung magbabahagi ka ng file na may datos ng OpenStreetMap, panatilihin ang attribution at basahin ang share-alike terms ng lisensya.

## Hindi pa ginagawa

Hindi pa iginuguhit ang mga run punto por punto sa plan gamit ang tool, at hindi pa ipinapakita ang mga crossing sa profile view (nabuo na ang kalkulasyon). Ang mga lalim, sukat at clearance ay nagsisimula bilang placeholder: gamitin ang mga numero ng sarili mong standard.
