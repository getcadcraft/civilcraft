# SPDX-License-Identifier: Apache-2.0
"""
CadCraft link for .3dm files (0.9 SU.810b): keep a model live in ModelCraft or PartCraft while you work on it in the other program.
Our own script. It uses that program's own SDK on your computer; nothing goes over the internet, only to CadCraft Studio at 127.0.0.1.
Rhinoceros and Grasshopper are trademarks of Robert McNeel & Associates; this script is not made or endorsed by them.

Before you start, in CadCraft Studio: open ModelCraft or PartCraft, Settings > Assistants, tick "Let AI assistants and scripts use"
and Edit; then Connect an assistant shows the address and the token.

In Rhino 8 (Python 3 in the Script Editor; or Rhino 7's Python editor):
    Run this file. The first run asks for the address and token (kept in .cadcraft-link.json in your home folder, never in the
    model; Studio makes a new token each time it starts, so it asks again then). The whole model goes over, then each change does.
    Run it again to stop.

In Grasshopper (the Script component set to Python 3, or GhPython):
    Paste this file in. Inputs: G (the geometry, list access, type hint GeometryBase or none), N (a name, optional), On (a boolean
    toggle), Target (optional: model or part). Output: a (what happened). Each solve with On true sends G over. Run the script
    once in Rhino first, so the address and token are saved.

Goes over: meshes, polysurfaces, surfaces, extrusions, SubD (as the mesh you see), curves, blocks (flattened), layers, colours, units.
Left out and said: points, text, dimensions, lights and the like. It only goes one way: the model stays yours here; CadCraft shows and uses it.
"""
from __future__ import print_function

import base64
import hashlib
import json
import os
import tempfile
import time
import uuid

try:
    from urllib.request import Request, build_opener, ProxyHandler
    from urllib.error import HTTPError, URLError
except ImportError:  # Rhino 7's Python 2
    from urllib2 import Request, build_opener, ProxyHandler, HTTPError, URLError

VERSION = '1.0'
DEFAULT_URL = 'http://127.0.0.1:47615'
CONFIG = os.path.join(os.path.expanduser('~'), '.cadcraft-link.json')
BODY_LIMIT = 3900000      # Studio takes at most 4 MB in a request
DEBOUNCE = 0.3            # seconds without a change before a push
RETRY = 3.0               # seconds before trying again after a failure
HOSTS = {'modelcraft': 'model', 'partcraft': 'part'}


class LinkError(Exception):
    pass


class TokenRefused(LinkError):
    pass


# ------------------------------------------------------------------ Studio

class Studio(object):
    """Studio's local server: JSON-RPC over /control, a Bearer token on every request."""

    def __init__(self, url, token, timeout=120):
        self.url = url.rstrip('/')
        if self.url.endswith('/mcp') or self.url.endswith('/control'):
            self.url = self.url.rsplit('/', 1)[0]
        self.token = token
        self.timeout = timeout
        self.opener = build_opener(ProxyHandler({}))  # never through a proxy: it is this computer
        self.seq = 0

    def rpc(self, method, params=None):
        self.seq += 1
        body = json.dumps({'jsonrpc': '2.0', 'id': self.seq, 'method': method, 'params': params or {}}).encode('utf-8')
        req = Request(self.url + '/control', body, {'Content-Type': 'application/json', 'Authorization': 'Bearer ' + self.token, 'X-CadCraft-Session': '3dm-link'})
        try:
            raw = self.opener.open(req, timeout=self.timeout).read()
        except HTTPError as e:
            if e.code == 401:
                raise TokenRefused('Studio refused the token. It makes a new one each time it starts: copy it again from Connect an assistant.')
            raise LinkError('Studio answered HTTP %d.' % e.code)
        except (URLError, OSError, IOError) as e:
            raise LinkError('Cannot reach CadCraft Studio at %s (%s). Is it running?' % (self.url, e))
        answer = json.loads(raw.decode('utf-8'))
        if answer.get('error'):
            raise LinkError(answer['error'].get('message', 'Studio refused the request.'))
        return answer.get('result') or {}

    def call(self, tool, args):
        r = self.rpc('tools.call', {'name': tool, 'arguments': args})
        if r.get('isError'):
            text = ' '.join(c.get('text', '') for c in r.get('content', []))
            raise LinkError(text or tool + ' failed.')
        return r.get('structuredContent') or {}

    def hello(self):
        return self.rpc('control.hello', {'client': {'name': 'CadCraft link for .3dm files', 'version': VERSION}})

    def windows(self):
        return self.call('studio_windows_list', {}).get('windows', [])

    def find_target(self, want=None):
        """The app window to push to → (tool prefix, window id). `want` = 'model' or 'part' when both are open."""
        usable = []
        for w in self.windows():
            key = HOSTS.get(w.get('app'))
            if key and w.get('assistants') and 'edit' in (w.get('allowed') or []) and (not want or want == key):
                usable.append((key, w.get('window')))
        if not usable:
            raise LinkError('No ModelCraft or PartCraft window allows it: in Studio open one, then Settings > Assistants: tick it on, and Edit.')
        return usable


def push(studio, prefix, window, link, name, data, replace='all', deleted=None, source_ids=None):
    """One file (several parts when it is big). → the app's answer."""
    args = {'link': link, 'name': name, 'replace': replace}
    if window:
        args['window'] = window
    last = dict(args)
    if deleted:
        last['deleted'] = list(deleted)
    if source_ids:
        last['source_ids'] = source_ids
    room = BODY_LIMIT - len(json.dumps(last)) - 200
    if room < 200000:
        raise LinkError('Too many objects changed at once for one push.')
    tool = prefix + '_link_push'
    b64 = base64.b64encode(data).decode('ascii') if data else ''
    room -= room % 4
    if len(b64) <= room:
        if b64:
            last['data'] = b64
        return studio.call(tool, last)
    parts = [b64[i:i + room] for i in range(0, len(b64), room)]
    transfer = uuid.uuid4().hex
    answer = {}
    for i, chunk in enumerate(parts):
        a = dict(last if i == len(parts) - 1 else args)
        a.update({'data': chunk, 'part': i + 1, 'of': len(parts), 'transfer': transfer})
        answer = studio.call(tool, a)
    return answer


def load_config(path=None):
    try:
        with open(path or CONFIG) as f:
            return json.load(f)
    except (IOError, OSError, ValueError):
        return {}


def save_config(cfg, path=None):
    path = path or CONFIG
    fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o600)  # the token: only you
    with os.fdopen(fd, 'w') as f:
        try:
            os.chmod(path, 0o600)  # a file already there keeps its old mode otherwise
        except OSError:
            pass
        json.dump(cfg, f)


def tell(answer):
    """The app's answer in one line."""
    if answer.get('applied') is False:
        if answer.get('needFull'):
            return 'CadCraft needs the whole model.'
        if answer.get('suggested'):
            return 'CadCraft recorded this as a suggestion: allow Edit in Settings > Assistants.'
        return answer.get('reason') or 'CadCraft did not take this push.'
    line = 'CadCraft updated: %s objects, %s faces.' % (answer.get('objects', '?'), answer.get('faces', '?'))
    if answer.get('holesFilled'):
        line += ' It filled %d holes to make a solid.' % answer['holesFilled']
    return line


# ------------------------------------------------------------------ the .3dm file

def write_3dm(rh, items, unit_system):
    """Items → .3dm bytes through the SDK's own writer. An item = {id, name, layer, layer_color, hidden, color, mesh | curve}.
    → (bytes, {object id in the file: source id})."""
    f = rh.FileIO.File3dm()
    f.Settings.ModelUnitSystem = unit_system
    layers = {}
    source_ids = {}
    for it in items:
        attrs = rh.DocObjects.ObjectAttributes()
        if it.get('layer'):
            name = it['layer'].replace('::', ' / ')
            if name not in layers:
                layers[name] = f.AllLayers.AddLayer(name, it['layer_color'])
            if layers[name] >= 0:
                attrs.LayerIndex = layers[name]
        if it.get('name'):
            attrs.Name = it['name']
        if it.get('color') is not None:
            attrs.ColorSource = rh.DocObjects.ObjectColorSource.ColorFromObject
            attrs.ObjectColor = it['color']
        if it.get('hidden'):
            attrs.Visible = False
        added = f.Objects.AddMesh(it['mesh'], attrs) if it.get('mesh') is not None else f.Objects.AddCurve(it['curve'], attrs)
        source_ids[str(added).lower()] = str(it['id']).lower()
    fd, path = tempfile.mkstemp(suffix='.3dm')
    os.close(fd)
    try:
        if not f.Write(path, 7):
            raise LinkError('The .3dm writer refused the model.')
        with open(path, 'rb') as g:
            return g.read(), source_ids
    finally:
        try:
            os.remove(path)
        except OSError:
            pass


def join_meshes(rh, meshes):
    meshes = [m for m in (meshes or []) if m is not None]
    if not meshes:
        return None
    if len(meshes) == 1:
        return meshes[0]
    out = rh.Geometry.Mesh()
    for m in meshes:
        out.Append(m)
    return out


def geometry_to_item(rh, g):
    """Any geometry → {'mesh': …} or {'curve': …}, or None when it is a kind that does not go over."""
    G = rh.Geometry
    if hasattr(g, 'ScriptVariable'):  # a Grasshopper wrapper
        g = g.ScriptVariable()
    if isinstance(g, G.Mesh):
        return {'mesh': g}
    if isinstance(g, G.Curve):
        return {'curve': g}
    sd = getattr(G, 'SubD', None)
    if sd is not None and isinstance(g, sd):
        try:
            density = G.SubDDisplayParameters.Density.DefaultDensity
        except AttributeError:
            density = 3
        return {'mesh': G.Mesh.CreateFromSubD(g, density)}
    if not isinstance(g, G.Brep):
        g = g.ToBrep() if hasattr(g, 'ToBrep') else None  # surfaces, extrusions, boxes, spheres
    if g is None:
        return None
    m = join_meshes(rh, G.Mesh.CreateFromBrep(g, G.MeshingParameters.Default))
    return {'mesh': m} if m is not None else None


def object_parts(rh, obj, depth=0):
    """A model object → its geometry items. The mesh you see on screen first; a block's pieces where the block puts them."""
    D = rh.DocObjects
    if isinstance(obj, D.InstanceObject):
        out = []
        if depth < 16:
            for sub in obj.GetSubObjects() or []:
                out.extend(object_parts(rh, sub, depth + 1))
        return out
    g = obj.Geometry
    if isinstance(g, rh.Geometry.Curve) or isinstance(g, rh.Geometry.Mesh):
        return [geometry_to_item(rh, g)]
    m = join_meshes(rh, obj.GetMeshes(D.MeshType.Render))
    if m is not None:
        return [{'mesh': m}]
    it = geometry_to_item(rh, g)
    return [it] if it else []


def doc_items(rh, doc, ids=None):
    """The model's objects (or those with these ids) → (items, how many were left out)."""
    if ids is None:
        s = rh.DocObjects.ObjectEnumeratorSettings()
        s.HiddenObjects = True
        s.LockedObjects = True
        objs = doc.Objects.GetObjectList(s)
    else:
        objs = [doc.Objects.FindId(uuid_of(rh, i)) for i in ids]
    items, left = [], 0
    for obj in objs:
        if obj is None or obj.IsDeleted:
            continue
        a = obj.Attributes
        layer = doc.Layers[a.LayerIndex]
        parts = [p for p in object_parts(rh, obj) if p]
        if not parts:
            left += 1
        for p in parts:
            p.update({'id': obj.Id, 'name': a.Name, 'layer': layer.FullPath, 'layer_color': layer.Color, 'color': a.DrawColor(doc),
                      'hidden': obj.IsHidden or not layer.IsVisible})
            items.append(p)
    return items, left


def uuid_of(rh, s):
    make = getattr(rh, 'make_guid', None)
    if make:
        return make(s)
    import System
    return System.Guid(str(s))


# ------------------------------------------------------------------ what has changed since the last push

class Session(object):
    """Collects the model's changes, waits for a pause, pushes them. `send(ids or None, deleted)` does the push and returns the
    app's answer; `alive(id)` says whether an object is in the model (a replace reads as delete + add, in either order)."""

    def __init__(self, send, alive, say=print, clock=time.time):
        self.send, self.alive, self.say, self.clock = send, alive, say, clock
        self.full = True
        self.dirty, self.deleted = set(), set()
        self.last = 0
        self.next_try = 0

    def mark(self, oid):
        self.dirty.add(str(oid).lower())
        self.last = self.clock()

    def mark_deleted(self, oid):
        self.deleted.add(str(oid).lower())
        self.last = self.clock()

    def mark_all(self):
        self.full = True
        self.last = self.clock()

    def due(self):
        now = self.clock()
        return (self.full or self.dirty or self.deleted) and now - self.last >= DEBOUNCE and now >= self.next_try

    def flush(self):
        for oid in list(self.deleted):
            if self.alive(oid):
                self.deleted.discard(oid)
                self.dirty.add(oid)
        self.dirty -= self.deleted
        try:
            if self.full:
                answer = self.send(None, [])
            else:
                answer = self.send(sorted(self.dirty), sorted(self.deleted))
                if answer.get('needFull'):
                    answer = self.send(None, [])
        except TokenRefused:
            raise
        except LinkError as e:
            self.next_try = self.clock() + RETRY
            self.say('CadCraft link: %s' % e)
            return None
        self.full = False
        self.dirty, self.deleted = set(), set()
        self.say('CadCraft link: ' + tell(answer))
        return answer


# ------------------------------------------------------------------ inside Rhino

def doc_sender(rh, studio, prefix, window):
    """The push of the open model: all of it (ids None) or these objects and these deletions."""
    def send(ids, deleted):
        doc = rh.RhinoDoc.ActiveDoc
        link = 'rhino:' + hashlib.sha1((doc.Path or doc.Name or 'untitled').encode('utf-8')).hexdigest()[:20]
        items, left = doc_items(rh, doc, ids)
        data, source_ids = (b'', {})
        if items or ids is None:  # a whole model always has a file, an empty one included: it says the units
            data, source_ids = write_3dm(rh, items, doc.ModelUnitSystem)
        answer = push(studio, prefix, window, link, doc.Name or 'Untitled', data, 'all' if ids is None else 'objects', deleted, source_ids)
        if left:
            rh.RhinoApp.WriteLine('CadCraft link: %d objects left out (points, text, dimensions and the like do not go over).' % left)
        return answer
    return send


def rhino_main():
    import Rhino
    import scriptcontext as sc
    KEY = 'cadcraft.link'
    was = sc.sticky.get(KEY)
    if was:
        was['stop']()
        sc.sticky.pop(KEY, None)
        Rhino.RhinoApp.WriteLine('CadCraft link: stopped.')
        return

    def ask(prompt, default):
        import rhinoscriptsyntax as rs
        return rs.StringBox(prompt, default, 'CadCraft link for .3dm files')

    cfg = load_config()
    url = cfg.get('url') or ask('Address from Studio > Connect an assistant', DEFAULT_URL)
    token = cfg.get('token') or ask('Token from Studio > Connect an assistant', '')
    if not url or not token:
        return
    studio = Studio(url, token)
    try:
        studio.hello()
    except TokenRefused:
        token = ask('Studio refused the token (it makes a new one each time it starts). Paste the new one:', '')
        if not token:
            return
        studio = Studio(url, token)
        studio.hello()
    cfg.update({'url': url, 'token': token})
    save_config(cfg)
    targets = studio.find_target(cfg.get('target'))
    if len(targets) > 1:
        import rhinoscriptsyntax as rs
        names = ['%s (%s)' % (k, w) for k, w in targets]
        pick = rs.ListBox(names, 'Which CadCraft window?', 'CadCraft link for .3dm files')
        if not pick:
            return
        targets = [targets[names.index(pick)]]
    prefix, window = targets[0]

    send = doc_sender(Rhino, studio, prefix, window)

    def alive(oid):
        o = Rhino.RhinoDoc.ActiveDoc.Objects.FindId(uuid_of(Rhino, oid))
        return o is not None and not o.IsDeleted

    session = Session(send, alive, say=Rhino.RhinoApp.WriteLine)

    def on_add(s, e):
        session.mark(e.ObjectId)

    def on_delete(s, e):
        session.mark_deleted(e.ObjectId)

    def on_replace(s, e):
        session.mark(e.ObjectId)

    def on_attrs(s, e):
        session.mark(e.RhinoObject.Id)

    def on_layer(s, e):
        session.mark_all()

    def on_doc(s, e):
        session.mark_all()

    def stop():
        Rhino.RhinoDoc.AddRhinoObject -= on_add
        Rhino.RhinoDoc.UndeleteRhinoObject -= on_add
        Rhino.RhinoDoc.DeleteRhinoObject -= on_delete
        Rhino.RhinoDoc.ReplaceRhinoObject -= on_replace
        Rhino.RhinoDoc.ModifyObjectAttributes -= on_attrs
        Rhino.RhinoDoc.LayerTableEvent -= on_layer
        Rhino.RhinoDoc.EndOpenDocument -= on_doc
        Rhino.RhinoApp.Idle -= on_idle

    def on_idle(s, e):
        if session.due():
            try:
                session.flush()
            except TokenRefused as err:
                stop()
                sc.sticky.pop(KEY, None)
                Rhino.RhinoApp.WriteLine('CadCraft link: stopped. %s Run the script again.' % err)

    Rhino.RhinoDoc.AddRhinoObject += on_add
    Rhino.RhinoDoc.UndeleteRhinoObject += on_add
    Rhino.RhinoDoc.DeleteRhinoObject += on_delete
    Rhino.RhinoDoc.ReplaceRhinoObject += on_replace
    Rhino.RhinoDoc.ModifyObjectAttributes += on_attrs
    Rhino.RhinoDoc.LayerTableEvent += on_layer
    Rhino.RhinoDoc.EndOpenDocument += on_doc
    Rhino.RhinoApp.Idle += on_idle
    # kept here so the handlers live on after the script ends, and the next run can stop them
    sc.sticky[KEY] = {'stop': stop, 'session': session, 'handlers': (on_add, on_delete, on_replace, on_attrs, on_layer, on_doc, on_idle)}
    Rhino.RhinoApp.WriteLine('CadCraft link: on, to %s. Run this script again to stop.' % (window or prefix))
    session.flush()


# ------------------------------------------------------------------ inside Grasshopper

def component_push(rh, studio, target, link, name, geometry, unit_system):
    """One solve: all of the input → the whole model on the other side. → the line for the component's output."""
    items, left = [], 0
    for i, g in enumerate(geometry or []):
        if g is None:
            continue
        if isinstance(g, uuid.UUID) or type(g).__name__ == 'Guid':  # a referenced object in GhPython's own mode
            doc_obj = rh.RhinoDoc.ActiveDoc.Objects.FindId(g)
            g = doc_obj.Geometry if doc_obj else None
        it = geometry_to_item(rh, g) if g is not None else None
        if it is None:
            left += 1
            continue
        it.update({'id': 'g%d' % i, 'name': '', 'layer': '', 'layer_color': None, 'color': None, 'hidden': False})
        items.append(it)
    data, source_ids = write_3dm(rh, items, unit_system)
    answer = push(studio, target[0], target[1], link, name, data, 'all', None, source_ids)
    return tell(answer) + (' %d inputs left out (points and the like do not go over).' % left if left else '')


def grasshopper_main(env):
    import Rhino
    if not env.get('On'):
        return 'Off.'
    cfg = load_config()
    if not cfg.get('token'):
        return 'No token yet: run this script once in Rhino, so the address and token from Studio are saved.'
    try:
        studio = Studio(cfg.get('url') or DEFAULT_URL, cfg['token'])
        target = studio.find_target(env.get('Target') or cfg.get('target'))[0]
        link = 'gh:' + str(env['ghenv'].Component.InstanceGuid).lower()
        doc = Rhino.RhinoDoc.ActiveDoc
        return component_push(Rhino, studio, target, link, env.get('N') or 'Grasshopper', env.get('G'), doc.ModelUnitSystem)
    except LinkError as e:
        return str(e)


if 'ghenv' in globals():
    a = grasshopper_main(globals())
elif __name__ == '__main__':
    rhino_main()
