# CivilCraft for Linux

CivilCraft comes inside [CadCraft Studio](https://github.com/getcadcraft/studio) (all eight apps in one install) from 0.5 on; there are no separate CivilCraft installers any more. Get Studio 0.6 from the [download page](https://getcadcraft.com/download#studio) or its [GitHub release](https://github.com/getcadcraft/studio/releases/tag/studio-v0.6.0). Studio ships as a `.deb` and an AppImage.

## Flathub

[`flathub/`](flathub/) is the Flathub manifest (`com.getcadcraft.civilcraft.yml`) with its desktop entry, AppStream metainfo, MIME types and icons. It builds from public sources only: the shell's tag and the release zip. Values marked `OWNER:` are filled in at submission.

```sh
flatpak-builder --user --install build-dir flathub/com.getcadcraft.civilcraft.yml
```

## File types

- Opens by default unless another program already does: `.landxml` (LandXML file)
- Listed under "Open with": `.xml` (XML file), `.geojson` (GeoJSON file), `.kml` (KML file), `.kmz` (KMZ file), `.shp` (Shapefile), `.gpkg` (GeoPackage), `.las` (LAS point cloud), `.laz` (LAZ point cloud), `.dwg` (DWG drawing), `.dxf` (DXF drawing)
