# CivilCraft for Linux

**Available from 0.4.** The `.deb` and AppImage are in [Releases](https://github.com/getcadcraft/civilcraft/releases).

Both are the [browser edition](../web/), unchanged, in a WebKitGTK window, built by [getcadcraft/desktop-shell](https://github.com/getcadcraft/desktop-shell).

## Flathub

[`flathub/`](flathub/) is the Flathub manifest (`com.getcadcraft.civilcraft.yml`) with its desktop entry, AppStream metainfo, MIME types and icons. It builds from public sources only: the shell's tag and the release zip. Values marked `OWNER:` are filled in at submission.

```sh
flatpak-builder --user --install build-dir flathub/com.getcadcraft.civilcraft.yml
```

## File types

- Opens by default unless another program already does: `.landxml` (LandXML file)
- Listed under "Open with": `.xml` (XML file), `.geojson` (GeoJSON file), `.kml` (KML file), `.kmz` (KMZ file), `.shp` (Shapefile), `.gpkg` (GeoPackage), `.las` (LAS point cloud), `.laz` (LAZ point cloud), `.dwg` (DWG drawing), `.dxf` (DXF drawing)
