/* SPDX-License-Identifier: Apache-2.0 */
/**
 * edl.js — eye-dome lighting for the point cloud in CivilCraft's 3D view (spec § 6, PC.2): a depth-based edge shading that makes the
 * shape of a cloud readable without normals (a point whose neighbours on screen lie nearer to the eye is darkened, so edges and
 * steps show). Our own small shader; the idea is the published one (Boucheny 2009), nothing is copied.
 *
 *   const edl = createEdl(THREE, renderer);
 *   edl.install()            wrap renderer.render: scene → colour + depth target → full-screen pass that shades by depth
 *   edl.enabled = false      draws straight, as before (no target, no cost)
 *   edl.strength, edl.radius (px)     defaults 1.0 and 1.4
 *   edl.uninstall()
 * Everything the view draws goes through the pass (meshes, labels and the cloud), so the screen reads as one picture. The target has
 * no multisampling: with EDL on, edges are not anti-aliased (the shading hides it at normal sizes).
 */
export function createEdl(THREE, renderer) {
  const st = { on: true, strength: 1, radius: 1.4, target: null, quad: null, scene: null, cam: null, orig: null, raw: null, w: 0, h: 0, drawn: 0 };
  const VS = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }';
  const FS = `
    uniform sampler2D tColor; uniform sampler2D tDepth; uniform vec2 px; uniform float near; uniform float far; uniform float persp;
    uniform float strength; uniform float radius; varying vec2 vUv;
    float lin(float d){ return persp > 0.5 ? (near * far) / (far - d * (far - near)) : near + d * (far - near); }
    void main(){
      vec4 c = texture2D(tColor, vUv); float d = texture2D(tDepth, vUv).r;
      if (d >= 1.0) { gl_FragColor = linearToOutputTexel(c); return; }   // the target holds linear colour: convert as the screen would
      float z = log2(max(lin(d), 1e-6)); float r = 0.0;
      vec2 o[4]; o[0] = vec2(1.0, 0.0); o[1] = vec2(-1.0, 0.0); o[2] = vec2(0.0, 1.0); o[3] = vec2(0.0, -1.0);
      for (int i = 0; i < 4; i++) {
        float dn = texture2D(tDepth, vUv + o[i] * px * radius).r;
        float zn = dn >= 1.0 ? z : log2(max(lin(dn), 1e-6));
        r += max(0.0, z - zn);          // neighbour nearer to the eye than this point
      }
      float shade = exp(-r * 300.0 * strength);
      gl_FragColor = linearToOutputTexel(vec4(c.rgb * shade, c.a));
    }`;
  function ensure(w, h) {
    if (st.target && st.w === w && st.h === h) return;
    if (st.target) { st.target.depthTexture.dispose(); st.target.dispose(); }
    const dt = new THREE.DepthTexture(w, h); dt.type = THREE.UnsignedIntType;
    st.target = new THREE.WebGLRenderTarget(w, h, { depthBuffer: true, depthTexture: dt, minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter });
    st.w = w; st.h = h;
    if (!st.quad) {
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.BufferAttribute(new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]), 3));
      g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array([0, 0, 2, 0, 0, 2]), 2));
      st.mat = new THREE.ShaderMaterial({ vertexShader: VS, fragmentShader: FS, depthTest: false, depthWrite: false,
        uniforms: { tColor: { value: null }, tDepth: { value: null }, px: { value: new THREE.Vector2() }, near: { value: 0.1 }, far: { value: 1000 }, persp: { value: 1 }, strength: { value: 1 }, radius: { value: 1.4 } } });
      st.quad = new THREE.Mesh(g, st.mat); st.quad.frustumCulled = false;
      st.scene = new THREE.Scene(); st.scene.add(st.quad);
      st.cam = new THREE.Camera();
    }
  }
  function render(scene, camera) {
    if (!st.on || scene === st.scene) return st.orig(scene, camera);
    const size = renderer.getDrawingBufferSize(new THREE.Vector2());
    ensure(size.x, size.y);
    const prev = renderer.getRenderTarget();
    renderer.setRenderTarget(st.target);
    st.orig(scene, camera);
    renderer.setRenderTarget(prev);
    const P = camera.projectionMatrix.elements, persp = P[11] === -1, u = st.mat.uniforms;
    u.near.value = persp ? P[14] / (P[10] - 1) : (P[14] + 1) / P[10];
    u.far.value = persp ? P[14] / (P[10] + 1) : (P[14] - 1) / P[10];
    u.persp.value = persp ? 1 : 0;
    u.tColor.value = st.target.texture; u.tDepth.value = st.target.depthTexture;
    u.px.value.set(1 / size.x, 1 / size.y); u.strength.value = st.strength; u.radius.value = st.radius;
    st.orig(st.scene, st.cam);
    st.drawn++;
  }
  return {
    install() { if (st.orig) return; st.raw = renderer.render; st.orig = st.raw.bind(renderer); renderer.render = render; },
    uninstall() { if (!st.orig) return; renderer.render = st.raw; st.orig = null; if (st.target) { st.target.depthTexture.dispose(); st.target.dispose(); st.target = null; } if (st.mat) { st.mat.dispose(); st.quad.geometry.dispose(); st.quad = null; st.mat = null; } st.w = 0; },
    get enabled() { return st.on; }, set enabled(v) { st.on = !!v; },
    get strength() { return st.strength; }, set strength(v) { st.strength = Number(v); },
    get radius() { return st.radius; }, set radius(v) { st.radius = Number(v); },
    /** How many frames went through the pass (the browser test asserts it is used). */
    get passes() { return st.drawn; },
  };
}
