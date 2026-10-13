# CivilCraft for Windows

**Available from 0.4.** Download `CivilCraft-0.4-setup.exe` from [Releases](https://github.com/getcadcraft/civilcraft/releases).

The installer is the [browser edition](../web/), unchanged, in a WebView2 window (part of Windows 10 and 11), built by [getcadcraft/desktop-shell](https://github.com/getcadcraft/desktop-shell) (`node build.mjs civilcraft --edition <zip>`). Nothing here to compile.

**Not code-signed yet:** Windows SmartScreen shows "Windows protected your PC"; choose **More info › Run anyway**, and check the file against SHA256SUMS first. The Microsoft Store package follows once it is signed.

## File types

- Opens by default unless another program already does: `.landxml` (LandXML file)
- Listed under "Open with": `.xml` (XML file), `.geojson` (GeoJSON file), `.kml` (KML file), `.kmz` (KMZ file), `.shp` (Shapefile), `.gpkg` (GeoPackage), `.las` (LAS point cloud), `.laz` (LAZ point cloud), `.dwg` (DWG drawing), `.dxf` (DXF drawing)
