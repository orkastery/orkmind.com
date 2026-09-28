// Campo de memória do hero: partículas WebGL2 que saem do caos e se
// organizam em 23 grupos (as coleções de memória) conforme o scroll.
// Motivação da animação: contar a tese do produto no primeiro segundo.
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const VERTEX = `#version 300 es
precision highp float;
layout(location=0) in vec3 a_seed;
layout(location=1) in float a_indice;
uniform float u_tempo;
uniform float u_ordem;
uniform vec2 u_mouse;
uniform vec2 u_res;
out float v_brilho;
out float v_tipo;

float hash(float n){ return fract(sin(n) * 43758.5453123); }

void main(){
  float t = u_tempo * 0.12;
  float aspecto = u_res.x / max(u_res.y, 1.0);

  float a1 = a_seed.x * 6.2831853 + t * (0.5 + a_seed.y);
  float a2 = a_seed.y * 6.2831853 - t * (0.3 + a_seed.z * 0.7);
  vec2 caos = vec2(
    sin(a1) * (0.55 + 0.45 * sin(a2 * 1.7 + a_seed.z * 4.0)),
    cos(a2) * (0.5 + 0.5 * sin(a1 * 1.3))
  );
  caos.x *= aspecto * 0.98;
  caos.y *= 0.95;

  float grupo = floor(a_seed.z * 23.0);
  float angG = (grupo / 23.0) * 6.2831853;
  float anel = mod(grupo, 2.0);
  float raio = 0.40 + anel * 0.24;
  vec2 centro = vec2(cos(angG) * raio, sin(angG) * raio * 0.8);
  centro.x = centro.x * 0.9 + aspecto * 0.42;
  float angP = a_seed.x * 6.2831853 + t * (0.18 + 0.12 * anel);
  float rP = 0.018 + a_seed.y * 0.08;
  vec2 ordem = centro + vec2(cos(angP), sin(angP)) * rP;

  vec2 p = mix(caos, ordem, u_ordem);

  vec2 d = p - u_mouse;
  float dist2 = dot(d, d);
  p += (d / sqrt(dist2 + 0.0004)) * (0.03 / (dist2 * 22.0 + 0.55));

  gl_Position = vec4(p.x / aspecto, p.y, 0.0, 1.0);
  float tam = (1.4 + a_seed.y * 2.8) * (u_res.y / 900.0);
  gl_PointSize = clamp(tam, 1.2, 6.0);
  v_brilho = 0.35 + 0.65 * hash(a_indice * 1.7);
  v_tipo = step(0.86, a_seed.x);
}`;

const FRAGMENT = `#version 300 es
precision highp float;
in float v_brilho;
in float v_tipo;
uniform float u_ordem;
out vec4 cor;
void main(){
  vec2 uv = gl_PointCoord * 2.0 - 1.0;
  float d = dot(uv, uv);
  if (d > 1.0) discard;
  float alfa = exp(-d * 3.2) * smoothstep(1.0, 0.55, d);
  vec3 base = vec3(0.30, 0.40, 0.48);
  vec3 verde = vec3(0.204, 0.827, 0.600);
  float mistura = clamp(v_tipo * 0.9 + u_ordem * 0.5, 0.0, 1.0);
  vec3 c = mix(base, verde, mistura) * v_brilho;
  cor = vec4(c, alfa * (0.45 + 0.5 * v_brilho));
}`;

const QTD = 7000;

function compilar(gl: WebGL2RenderingContext, tipo: number, fonte: string) {
  const shader = gl.createShader(tipo);
  if (!shader) return null;
  gl.shaderSource(shader, fonte);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.warn("shader:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function iniciar() {
  const canvas = document.querySelector<HTMLCanvasElement>("[data-campo-memoria]");
  const hero = document.querySelector<HTMLElement>("[data-hero]");
  if (!canvas || !hero) return;

  const reduzir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const gl = canvas.getContext("webgl2", {
    alpha: true,
    antialias: false,
    powerPreference: "low-power",
  });
  if (!gl) {
    canvas.remove();
    return;
  }

  const vs = compilar(gl, gl.VERTEX_SHADER, VERTEX);
  const fs = compilar(gl, gl.FRAGMENT_SHADER, FRAGMENT);
  if (!vs || !fs) {
    canvas.remove();
    return;
  }
  const prog = gl.createProgram()!;
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    canvas.remove();
    return;
  }
  gl.useProgram(prog);

  const seeds = new Float32Array(QTD * 3);
  const indices = new Float32Array(QTD);
  for (let i = 0; i < QTD; i++) {
    seeds[i * 3] = Math.random();
    seeds[i * 3 + 1] = Math.random();
    seeds[i * 3 + 2] = Math.random();
    indices[i] = i;
  }

  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
  const bufSeed = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, bufSeed);
  gl.bufferData(gl.ARRAY_BUFFER, seeds, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
  const bufIdx = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, bufIdx);
  gl.bufferData(gl.ARRAY_BUFFER, indices, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(1);
  gl.vertexAttribPointer(1, 1, gl.FLOAT, false, 0, 0);

  const uTempo = gl.getUniformLocation(prog, "u_tempo");
  const uOrdem = gl.getUniformLocation(prog, "u_ordem");
  const uMouse = gl.getUniformLocation(prog, "u_mouse");
  const uRes = gl.getUniformLocation(prog, "u_res");

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
  gl.clearColor(0, 0, 0, 0);

  let largura = 0;
  let altura = 0;
  const redimensionar = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    largura = Math.max(1, Math.round(rect.width * dpr));
    altura = Math.max(1, Math.round(rect.height * dpr));
    if (canvas.width !== largura || canvas.height !== altura) {
      canvas.width = largura;
      canvas.height = altura;
    }
    gl.viewport(0, 0, largura, altura);
  };
  redimensionar();
  const ro = new ResizeObserver(redimensionar);
  ro.observe(canvas);

  let ordem = reduzir ? 0.85 : 0.12;
  let ordemAlvo = ordem;
  let mouseX = 2.4;
  let mouseY = 0;
  let mouseAlvoX = 2.4;
  let mouseAlvoY = 0;

  if (!reduzir) {
    hero.addEventListener(
      "pointermove",
      (e) => {
        const rect = hero.getBoundingClientRect();
        const aspecto = rect.width / Math.max(rect.height, 1);
        mouseAlvoX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouseAlvoX *= aspecto;
        mouseAlvoY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      },
      { passive: true },
    );
    hero.addEventListener(
      "pointerleave",
      () => {
        mouseAlvoX = 2.4;
        mouseAlvoY = 0;
      },
      { passive: true },
    );

    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.create({
      trigger: hero,
      start: "top top",
      end: "bottom 30%",
      scrub: true,
      onUpdate: (self) => {
        ordemAlvo = 0.12 + self.progress * 0.88;
      },
    });
  }

  const desenhar = (tempo: number) => {
    ordem += (ordemAlvo - ordem) * 0.05;
    mouseX += (mouseAlvoX - mouseX) * 0.08;
    mouseY += (mouseAlvoY - mouseY) * 0.08;
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform1f(uTempo, tempo);
    gl.uniform1f(uOrdem, ordem);
    gl.uniform2f(uMouse, mouseX, mouseY);
    gl.uniform2f(uRes, largura, altura);
    gl.drawArrays(gl.POINTS, 0, QTD);
  };

  if (reduzir) {
    desenhar(40);
    return;
  }

  let visivel = true;
  let rodando = false;
  let raf = 0;
  const inicio = performance.now();

  const laco = () => {
    if (!visivel || document.hidden) {
      rodando = false;
      return;
    }
    desenhar((performance.now() - inicio) / 1000);
    raf = requestAnimationFrame(laco);
  };
  const acordar = () => {
    if (!rodando && visivel && !document.hidden) {
      rodando = true;
      raf = requestAnimationFrame(laco);
    }
  };

  const io = new IntersectionObserver(([entrada]) => {
    visivel = Boolean(entrada && entrada.isIntersecting);
    if (visivel) acordar();
  });
  io.observe(canvas);
  document.addEventListener("visibilitychange", acordar);
  acordar();

  window.addEventListener("pagehide", () => {
    cancelAnimationFrame(raf);
    ro.disconnect();
    io.disconnect();
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", iniciar);
} else {
  iniciar();
}
