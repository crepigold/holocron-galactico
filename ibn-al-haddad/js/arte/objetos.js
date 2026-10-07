/* Objetos del escenario dibujados en tiempo real: fuego de la fragua, yunque, fuelle, hogueras,
 * faroles, estandartes que ondean, tinajas que se rompen, crónicas coleccionables, pozos,
 * maniquíes de entrenamiento y animales (gatos, palomas, gallinas, burro, caballo).
 * Todo se dibuja con rectángulos de píxel entero para conservar la nitidez.
 */
'use strict';
(function () {
  const IH = window.IH;
  const U = IH.U;
  const G = IH.G;

  function R(x, a, b, w, h, c) {
    x.fillStyle = c;
    x.fillRect(Math.round(a), Math.round(b), Math.round(w), Math.round(h));
  }

  const PROPS = (IH.PROPS = {});

  // ------------------------------------------------------------------ forja
  PROPS.fragua = {
    w: 54, h: 40, capa: -2,
    luz: { dy: -24, r: 170, color: '#ff9a4a', i: 1.0, parpadeo: 0.16 },
    dibujar(x, o, px, py, t) {
      // campana y chimenea de adobe ennegrecido
      R(x, px - 14, 0, 28, py - 84, '#3e3028');
      R(x, px - 14, 0, 3, py - 84, '#4e3e34');
      R(x, px + 9, 0, 5, py - 84, '#2a2018');
      for (let yy = 0; yy < 40; yy++) {
        const w = Math.round(14 + (yy / 40) * 18);
        R(x, px - w, py - 84 + yy, w * 2, 1, yy % 9 === 0 ? '#2e241e' : '#463830');
        R(x, px + w - 4, py - 84 + yy, 4, 1, '#2a2018');
      }
      R(x, px - 34, py - 46, 68, 4, '#5a4a40');
      // horno de ladrillo
      for (let yy = 0; yy < 40; yy += 5) for (let xx = 0; xx < 54; xx += 9) R(x, px - 27 + xx + ((yy / 5) % 2) * 4, py - 40 + yy, 8, 4, (xx + yy) % 3 ? '#7a3a28' : '#8a4630');
      R(x, px - 27, py - 42, 54, 4, '#5a4a40');
      // boca del fuego
      const k = (IH.U.ruido(t * 6, 3) * 0.5 + 0.5) * (o.intensidad == null ? 1 : o.intensidad);
      R(x, px - 16, py - 36, 32, 14, '#1a0a06');
      R(x, px - 14, py - 30, 28, 8, U.mezclar('#5a1a0a', '#ff7a2a', k * 0.8));
      for (let i = 0; i < 10; i++) {
        const fx = px - 12 + i * 2.6;
        const fh = 4 + Math.round((U.ruido(t * 9 + i * 1.7, 5) * 7 + 2) * (0.5 + k * 0.6));
        R(x, fx, py - 23 - fh, 2, fh, i % 3 === 0 ? '#ffe08a' : '#ff9a3a');
      }
      R(x, px - 14, py - 24, 28, 2, '#ffd27a');
      // carbones
      for (let i = 0; i < 9; i++) R(x, px - 13 + i * 3, py - 23, 2, 1, i % 2 ? '#ff5a1a' : '#a8301a');
    },
    actualizar(o, dt, z) {
      o.acum = (o.acum || 0) + dt;
      const int = o.intensidad == null ? 1 : o.intensidad;
      if (Math.random() < dt * 6 * int) z.particulas.emitir('brasa', o.x + U.lerp(-10, 10, Math.random()), o.y - 30, 1, { fuerza: 0.6 + int * 0.6 });
      if (Math.random() < dt * 1.5) z.particulas.emitir('humo', o.x + U.lerp(-8, 8, Math.random()), o.y - 120, 1, { color: '#3a302c' });
      if (o.luz) o.luz.i = 0.75 + int * 0.35;
    },
  };

  PROPS.yunque = {
    w: 24, h: 16, capa: 1,
    dibujar(x, o, px, py) {
      R(x, px - 6, py - 6, 12, 6, '#5a3a22'); // tocón
      R(x, px - 6, py - 6, 2, 6, '#6a4a2a');
      R(x, px - 4, py - 10, 8, 4, '#3a3c40');
      R(x, px - 11, py - 15, 20, 5, '#4a4c52');
      R(x, px + 9, py - 14, 4, 2, '#4a4c52'); // cuerno
      R(x, px + 13, py - 13, 2, 1, '#4a4c52');
      R(x, px - 11, py - 15, 22, 1, '#8a8e94');
      if (o.hierro > 0) {
        R(x, px - 6, py - 17, 12, 2, U.mezclar('#5a5a5a', '#ff8a2a', o.hierro));
        R(x, px - 4, py - 17, 8, 1, U.mezclar('#6a6a6a', '#ffe0a0', o.hierro));
      }
    },
  };

  PROPS.fuelle = {
    w: 30, h: 20, capa: 1,
    dibujar(x, o, px, py, t) {
      const c = o.comprimido || 0;
      const h = Math.round(14 - c * 7);
      R(x, px - 14, py - 4, 28, 4, '#5a3a22');
      R(x, px - 14, py - 4 - h, 24, h, '#7a4a28');
      for (let i = 0; i < h; i += 3) R(x, px - 14, py - 4 - h + i, 24, 1, '#5a3418');
      R(x, px - 16, py - 6 - h, 28, 3, '#5a3a22');
      R(x, px + 10, py - 6, 10, 2, '#3a3c40'); // tobera
      R(x, px - 20, py - 10 - h, 6, 2, '#5a3a22'); // asa
    },
  };

  PROPS.barril = {
    w: 14, h: 18, solido: false, capa: 1,
    dibujar(x, o, px, py) {
      R(x, px - 7, py - 18, 14, 18, '#6a4428');
      R(x, px - 7, py - 18, 3, 18, '#7a5432');
      R(x, px + 4, py - 18, 3, 18, '#4a2c18');
      R(x, px - 7, py - 15, 14, 1, '#3a3c40');
      R(x, px - 7, py - 4, 14, 1, '#3a3c40');
      if (o.agua) {
        R(x, px - 6, py - 19, 12, 2, '#2a4a6a');
        R(x, px - 4, py - 19, 4, 1, '#6a9ac8');
      }
    },
  };

  PROPS.armero = {
    w: 30, h: 40, capa: -1,
    dibujar(x, o, px, py) {
      R(x, px - 15, py - 34, 30, 3, '#5a3a22');
      R(x, px - 15, py - 4, 30, 4, '#5a3a22');
      R(x, px - 14, py - 34, 2, 34, '#4a2e1a');
      R(x, px + 12, py - 34, 2, 34, '#4a2e1a');
      for (let i = 0; i < 4; i++) {
        const lx = px - 10 + i * 7;
        R(x, lx, py - 46, 1, 44, '#6b4426');
        R(x, lx - 1, py - 50, 3, 5, '#c9ced3');
      }
    },
  };

  // ------------------------------------------------------------------ calle
  PROPS.puesto = {
    w: 50, h: 34, capa: -1,
    dibujar(x, o, px, py) {
      const col = o.color || '#b8402a';
      // mesa
      R(x, px - 24, py - 14, 48, 3, '#6a4428');
      R(x, px - 22, py - 11, 2, 11, '#4a2c18');
      R(x, px + 20, py - 11, 2, 11, '#4a2c18');
      // postes y toldo
      R(x, px - 25, py - 44, 2, 44, '#5a3a22');
      R(x, px + 23, py - 44, 2, 44, '#5a3a22');
      IH.Fondos.toldo(x, px - 28, py - 46, 56, col);
      // mercancía
      const m = o.mercancia || 'especias';
      if (m === 'especias') {
        const cols = ['#c8642a', '#d8a83a', '#8a3a2a', '#6a8a3a', '#a85a2a'];
        for (let i = 0; i < 5; i++) {
          const bx = px - 20 + i * 9;
          R(x, bx, py - 20, 7, 6, '#8a6a3a');
          R(x, bx + 1, py - 22, 5, 2, cols[i]);
          R(x, bx + 2, py - 23, 3, 1, cols[i]);
        }
      } else if (m === 'ceramica') {
        for (let i = 0; i < 4; i++) {
          const bx = px - 18 + i * 11;
          R(x, bx, py - 23, 8, 9, i % 2 ? '#a8603a' : '#c87a4a');
          R(x, bx + 2, py - 25, 4, 2, '#a8603a');
          R(x, bx + 1, py - 20, 6, 1, '#3a5a8a');
        }
      } else if (m === 'telas') {
        const cols = ['#8a2a2a', '#2a4a7a', '#c9a227', '#3f6a3a', '#e8e0c8'];
        for (let i = 0; i < 5; i++) R(x, px - 21 + i * 9, py - 19, 8, 5, cols[i]);
        for (let i = 0; i < 4; i++) R(x, px - 20 + i * 11, py - 42, 6, 20, cols[(i + 2) % 5]);
      } else if (m === 'fruta') {
        for (let i = 0; i < 12; i++) R(x, px - 20 + (i % 6) * 7, py - 18 - Math.floor(i / 6) * 3, 3, 3, i % 3 ? '#d88a2a' : '#6a8a2a');
        R(x, px - 22, py - 20, 44, 1, '#8a6a3a');
        // dátiles colgando
        for (let i = 0; i < 3; i++) R(x, px - 12 + i * 10, py - 40, 4, 6, '#7a3a1a');
      } else if (m === 'cobre') {
        for (let i = 0; i < 4; i++) {
          R(x, px - 19 + i * 11, py - 20, 9, 6, '#c87a3a');
          R(x, px - 18 + i * 11, py - 20, 7, 1, '#f0b878');
        }
        for (let i = 0; i < 3; i++) G.circulo(x, px - 12 + i * 12, py - 34, 3, '#d88a4a');
      }
    },
  };

  PROPS.tinaja = {
    w: 10, h: 14, capa: 3, rompible: true, vida: 1,
    dibujar(x, o, px, py) {
      if (o.roto) {
        R(x, px - 6, py - 2, 4, 2, '#a8603a');
        R(x, px + 1, py - 3, 5, 3, '#8a4a2a');
        return;
      }
      R(x, px - 5, py - 11, 10, 9, o.color || '#b8683a');
      R(x, px - 4, py - 2, 8, 2, '#8a4a2a');
      R(x, px - 3, py - 14, 6, 3, '#8a4a2a');
      R(x, px - 4, py - 11, 2, 7, '#d08a5a');
      R(x, px + 3, py - 10, 2, 8, '#7a3a1a');
    },
    romper(o, z) {
      o.roto = true;
      IH.audio.sfx('madera', { x: o.x, vol: 0.6 });
      z.particulas.emitir('astilla', o.x, o.y - 6, 8, { color: '#a8603a' });
      if (Math.random() < 0.35 && o.premio !== false) z.soltarMoneda(o.x, o.y - 6);
    },
  };

  PROPS.farol = {
    w: 6, h: 10, capa: 4,
    luz: { dy: -6, r: 60, color: '#ffb060', i: 0.85, parpadeo: 0.1 },
    dibujar(x, o, px, py, t) {
      R(x, px, py - 30, 1, 22, '#2a2018');
      R(x, px - 3, py - 10, 7, 9, '#3a2a1a');
      R(x, px - 2, py - 9, 5, 7, U.mezclar('#ffb060', '#ffe0a0', U.ruido(t * 5, 2)));
      R(x, px - 3, py - 12, 7, 2, '#5a4a30');
    },
  };

  PROPS.estandarte = {
    w: 10, h: 60, capa: -1,
    dibujar(x, o, px, py, t) {
      const alto = o.alto || 70;
      R(x, px, py - alto, 2, alto, '#4a3020');
      R(x, px - 1, py - alto - 3, 4, 3, '#c9a845');
      const col = o.color || '#d9a521';
      const ancho = o.ancho || 22, largo = o.largo || 16;
      for (let i = 0; i < ancho; i++) {
        const ond = Math.round(Math.sin(t * 4 + i * 0.35) * 2 * (i / ancho));
        R(x, px + 2 + i, py - alto + 2 + ond, 1, largo - Math.floor(i / 6), i % 7 === 0 ? U.tono(col, -0.15) : col);
      }
      if (o.emblema === 'cruz') {
        R(x, px + 9, py - alto + 5, 2, 9, '#b3262a');
        R(x, px + 6, py - alto + 8, 8, 2, '#b3262a');
      } else if (o.emblema === 'aguila') {
        R(x, px + 8, py - alto + 6, 6, 5, '#7a1a1a');
      } else if (o.emblema === 'texto') {
        for (let i = 0; i < 4; i++) R(x, px + 5 + i * 3, py - alto + 8 + (i % 2), 2, 1, '#fff4dc');
      }
    },
  };

  PROPS.pozo = {
    w: 26, h: 30, capa: -1,
    dibujar(x, o, px, py) {
      for (let yy = 0; yy < 14; yy += 4) for (let xx = 0; xx < 26; xx += 7) R(x, px - 13 + xx + ((yy / 4) % 2) * 3, py - 14 + yy, 6, 3, xx % 2 ? '#a8906a' : '#b8a07a');
      R(x, px - 14, py - 16, 28, 3, '#c8b08a');
      R(x, px - 12, py - 40, 2, 24, '#5a3a22');
      R(x, px + 10, py - 40, 2, 24, '#5a3a22');
      R(x, px - 13, py - 42, 26, 3, '#5a3a22');
      R(x, px, py - 39, 1, 14, '#c8b890');
      R(x, px - 3, py - 26, 7, 6, '#6a4428');
    },
  };

  PROPS.hoguera = {
    w: 20, h: 10, capa: 3,
    luz: { dy: -10, r: 140, color: '#ff8a3a', i: 1, parpadeo: 0.2 },
    dibujar(x, o, px, py, t) {
      R(x, px - 9, py - 3, 18, 3, '#3a2418');
      R(x, px - 7, py - 5, 4, 2, '#5a3a22');
      R(x, px + 3, py - 5, 4, 2, '#5a3a22');
      for (let i = 0; i < 7; i++) {
        const fh = 3 + Math.round((U.ruido(t * 8 + i * 1.3, 9) * 8 + 2));
        R(x, px - 6 + i * 2, py - 4 - fh, 2, fh, i % 2 ? '#ffb040' : '#ff7a2a');
        if (i % 3 === 1) R(x, px - 6 + i * 2, py - 4 - fh, 1, Math.max(1, fh - 3), '#ffe8a0');
      }
      // piedras
      for (let i = 0; i < 5; i++) R(x, px - 11 + i * 5, py - 2, 3, 2, '#6a6058');
    },
    actualizar(o, dt, z) {
      if (Math.random() < dt * 5) z.particulas.emitir('brasa', o.x + U.lerp(-5, 5, Math.random()), o.y - 10, 1);
      if (Math.random() < dt * 2) z.particulas.emitir('humo', o.x, o.y - 18, 1);
    },
  };

  PROPS.cronica = {
    w: 10, h: 12, capa: 6, recogible: true,
    dibujar(x, o, px, py, t) {
      if (o.recogido) return;
      const fl = Math.round(Math.sin(t * 2.5) * 2);
      x.globalCompositeOperation = 'lighter';
      x.globalAlpha = 0.35 + Math.sin(t * 3) * 0.15;
      x.drawImage(G.brillo(16, '#f0cf72', 0.8), px - 16, py - 26 + fl);
      x.globalAlpha = 1;
      x.globalCompositeOperation = 'source-over';
      R(x, px - 5, py - 14 + fl, 10, 6, '#e9dcb8');
      R(x, px - 6, py - 15 + fl, 2, 8, '#c8a860');
      R(x, px + 4, py - 15 + fl, 2, 8, '#c8a860');
      R(x, px - 3, py - 12 + fl, 6, 1, '#7a5a3a');
      R(x, px - 3, py - 10 + fl, 4, 1, '#7a5a3a');
      R(x, px - 1, py - 9 + fl, 2, 2, '#b3262a'); // sello
      if (Math.random() < 0.05) IH.escena.particulas && IH.escena.particulas.emitir('mota', o.x + U.lerp(-6, 6, Math.random()), o.y - 14, 1, { color: '#f0cf72' });
    },
  };

  PROPS.moneda = {
    w: 4, h: 4, capa: 6, recogible: true,
    dibujar(x, o, px, py, t) {
      if (o.recogido) return;
      const b = Math.floor(t * 8 + o.x) % 4;
      R(x, px - 2 + (b === 1 || b === 3 ? 1 : 0), py - 4, b === 1 || b === 3 ? 2 : 4, 4, '#d4a73a');
      R(x, px - 1, py - 4, 1, 1, '#fff0a0');
    },
  };

  PROPS.maniqui = {
    w: 16, h: 44, capa: 3, golpeable: true,
    dibujar(x, o, px, py, t) {
      const inc = Math.round((o.tambaleo || 0) * Math.sin(t * 20) * 3);
      R(x, px - 1, py - 44, 3, 44, '#5a3a22');
      R(x, px - 6, py - 2, 13, 2, '#4a2e1a');
      R(x, px - 7 + inc, py - 38, 15, 18, '#c8b07a');
      R(x, px - 7 + inc, py - 38, 15, 2, '#d8c08a');
      for (let i = 0; i < 5; i++) R(x, px - 7 + inc, py - 34 + i * 3, 15, 1, '#a8905a');
      G.circulo(x, px + inc, py - 44, 5, '#c8b07a');
      R(x, px - 12 + inc, py - 34, 26, 3, '#5a3a22'); // brazos
      if (o.flash > 0) {
        x.globalAlpha = o.flash * 3;
        R(x, px - 7 + inc, py - 49, 15, 31, '#fff4dc');
        x.globalAlpha = 1;
      }
    },
    actualizar(o, dt) {
      o.tambaleo = Math.max(0, (o.tambaleo || 0) - dt * 2);
      o.flash = Math.max(0, (o.flash || 0) - dt);
    },
  };

  PROPS.diana = {
    w: 16, h: 30, capa: -1,
    dibujar(x, o, px, py) {
      R(x, px - 1, py - 30, 3, 30, '#5a3a22');
      G.circulo(x, px, py - 30, 9, '#d8c8a0');
      G.circulo(x, px, py - 30, 6, '#b3262a');
      G.circulo(x, px, py - 30, 3, '#d8c8a0');
      R(x, px, py - 30, 1, 1, '#1a1010');
    },
  };

  PROPS.carro = {
    w: 50, h: 26, capa: -1,
    dibujar(x, o, px, py) {
      R(x, px - 26, py - 20, 48, 4, '#6a4428');
      R(x, px - 26, py - 30, 3, 10, '#5a3a22');
      R(x, px + 19, py - 30, 3, 10, '#5a3a22');
      G.circulo(x, px - 12, py - 9, 8, '#4a2e1a');
      G.circulo(x, px - 12, py - 9, 6, '#6a4428');
      R(x, px - 12, py - 15, 1, 12, '#4a2e1a');
      R(x, px - 18, py - 9, 12, 1, '#4a2e1a');
      R(x, px + 22, py - 18, 18, 2, '#5a3a22'); // varas
      const carga = o.carga || 'sacos';
      if (carga === 'sacos') for (let i = 0; i < 4; i++) R(x, px - 22 + i * 11, py - 28, 10, 8, i % 2 ? '#c8b088' : '#b8a078');
      else if (carga === 'jarras') for (let i = 0; i < 4; i++) R(x, px - 20 + i * 10, py - 30, 7, 10, '#a8603a');
    },
  };

  PROPS.escombros = {
    w: 40, h: 14, capa: 4,
    dibujar(x, o, px, py) {
      const rng = new IH.Azar(Math.floor(o.x));
      for (let i = 0; i < 12; i++) R(x, px - 20 + rng.entero(0, 36), py - rng.entero(1, 8), rng.entero(3, 7), rng.entero(2, 4), rng.elegir(['#8a7a62', '#6a5a4a', '#a89070', '#5a3a22']));
    },
  };

  PROPS.barricada = {
    w: 30, h: 30, capa: 4,
    dibujar(x, o, px, py) {
      R(x, px - 14, py - 10, 28, 10, '#5a3a22');
      for (let i = 0; i < 5; i++) {
        G.linea(x, px - 14 + i * 7, py, px - 18 + i * 7, py - 28, '#6a4428');
        G.linea(x, px - 13 + i * 7, py, px - 17 + i * 7, py - 28, '#4a2e1a');
      }
      R(x, px - 16, py - 18, 32, 3, '#6a4428');
    },
  };

  PROPS.mesaEscritura = {
    w: 30, h: 16, capa: 1,
    dibujar(x, o, px, py) {
      R(x, px - 14, py - 10, 28, 3, '#5a3a22');
      R(x, px - 12, py - 7, 2, 7, '#4a2e1a');
      R(x, px + 10, py - 7, 2, 7, '#4a2e1a');
      R(x, px - 8, py - 12, 12, 2, '#e9dcb8');
      R(x, px + 6, py - 14, 2, 4, '#2a1a10');
      R(x, px + 7, py - 17, 1, 4, '#d8c8a0');
    },
  };

  // ------------------------------------------------------------------ animales
  PROPS.gato = {
    w: 10, h: 8, capa: 3,
    dibujar(x, o, px, py, t) {
      const c = o.color || '#c88a4a', cs = U.tono(c, -0.25);
      const d = o.dir || 1;
      x.save();
      x.translate(Math.round(px), Math.round(py));
      x.scale(d, 1);
      if (o.estado === 'sentado') {
        R(x, -3, -7, 6, 7, c);
        R(x, 1, -10, 4, 4, c);
        R(x, 1, -11, 1, 1, c);
        R(x, 4, -11, 1, 1, c);
        R(x, 3, -9, 1, 1, '#2a3a10');
        const cola = Math.round(Math.sin(t * 2) * 2);
        R(x, -5, -2 + cola, 3, 1, cs);
        R(x, -3, 0, 6, 1, cs);
      } else {
        const p = Math.floor(t * 10) % 2;
        R(x, -5, -6, 9, 4, c);
        R(x, 3, -9, 4, 4, c);
        R(x, 3, -10, 1, 1, c);
        R(x, 6, -10, 1, 1, c);
        R(x, 5, -8, 1, 1, '#2a3a10');
        R(x, -4 + p, -2, 1, 2, cs);
        R(x, 2 - p, -2, 1, 2, cs);
        R(x, -7, -8, 2, 1, cs);
        R(x, -8, -9, 1, 1, cs);
        for (let i = 0; i < 3; i++) R(x, -4 + i * 3, -6, 1, 3, cs);
      }
      x.restore();
    },
    actualizar(o, dt, z) {
      const J = z.jugador;
      o.estado = o.estado || 'sentado';
      if (J && Math.abs(J.x - o.x) < 40 && Math.abs(J.vx) > 70 && o.estado === 'sentado') {
        o.estado = 'huir';
        o.dir = Math.sign(o.x - J.x) || 1;
        o.tHuir = 2.5;
      }
      if (o.estado === 'huir') {
        o.x += o.dir * 120 * dt;
        o.tHuir -= dt;
        if (o.tHuir <= 0 || o.x < 10 || o.x > z.ancho - 10) {
          o.estado = 'sentado';
          o.x = U.clamp(o.x, 10, z.ancho - 10);
        }
      }
    },
  };

  PROPS.palomas = {
    w: 30, h: 6, capa: 3,
    iniciar(o) {
      o.aves = [];
      for (let i = 0; i < (o.n || 6); i++) o.aves.push({ x: o.x + U.lerp(-18, 18, Math.random()), y: o.y, vx: 0, vy: 0, vuela: false, dir: Math.random() < 0.5 ? -1 : 1, fase: Math.random() * 6, color: Math.random() < 0.3 ? '#e8e4dc' : '#8a8a96' });
    },
    dibujar(x, o, px, py, t, cx, cy) {
      for (const a of o.aves) {
        const ax = Math.round(a.x - cx), ay = Math.round(a.y - cy);
        if (a.vuela) {
          const ala = Math.floor(t * 14 + a.fase) % 2;
          R(x, ax - 2, ay - 2, 4, 2, a.color);
          R(x, ax - 3, ay - 3 - ala * 2, 2, 2, U.tono(a.color, -0.15));
          R(x, ax + 1, ay - 3 - ala * 2, 2, 2, U.tono(a.color, -0.15));
        } else {
          const pica = Math.sin(t * 3 + a.fase) > 0.6 ? 1 : 0;
          R(x, ax - 2, ay - 3, 4, 3, a.color);
          R(x, ax + (a.dir > 0 ? 1 : -2), ay - 4 + pica, 2, 2, U.tono(a.color, -0.1));
          R(x, ax + (a.dir > 0 ? 3 : -3), ay - 3 + pica, 1, 1, '#c87a3a');
          R(x, ax - 1, ay, 1, 1, '#c87a3a');
        }
      }
    },
    actualizar(o, dt, z) {
      const J = z.jugador;
      for (const a of o.aves) {
        if (!a.vuela) {
          if (J && Math.abs(J.x - a.x) < 45 && (Math.abs(J.vx) > 50 || J.estado === 'ataque')) {
            a.vuela = true;
            a.vx = Math.sign(a.x - J.x || 1) * U.lerp(60, 110, Math.random());
            a.vy = -U.lerp(70, 120, Math.random());
            if (!o.sonado) {
              o.sonado = true;
              IH.audio.sfx('rodar', { x: a.x, vol: 0.35 });
            }
          } else if (Math.random() < dt * 0.5) {
            a.dir *= -1;
          }
        } else {
          a.vy -= 20 * dt;
          a.x += a.vx * dt;
          a.y += a.vy * dt;
        }
      }
    },
    sinRecorte: true,
  };

  PROPS.gallina = {
    w: 8, h: 8, capa: 3,
    dibujar(x, o, px, py, t) {
      const d = o.dir || 1;
      x.save();
      x.translate(Math.round(px), Math.round(py));
      x.scale(d, 1);
      const pica = Math.sin(t * 4 + o.x) > 0.7 ? 2 : 0;
      R(x, -4, -6, 7, 5, o.color || '#e8dcc8');
      R(x, -5, -7, 2, 3, U.tono(o.color || '#e8dcc8', -0.2));
      R(x, 2, -9 + pica, 3, 3, o.color || '#e8dcc8');
      R(x, 3, -10 + pica, 2, 1, '#c82a2a');
      R(x, 5, -8 + pica, 1, 1, '#d8a83a');
      R(x, -1, -1, 1, 1, '#d8a83a');
      R(x, 1, -1, 1, 1, '#d8a83a');
      x.restore();
    },
    actualizar(o, dt, z) {
      o.t2 = (o.t2 || 0) - dt;
      if (o.t2 <= 0) {
        o.t2 = U.lerp(0.8, 3, Math.random());
        o.vx = Math.random() < 0.5 ? 0 : (Math.random() < 0.5 ? -1 : 1) * 20;
        if (o.vx) o.dir = Math.sign(o.vx);
      }
      const J = z.jugador;
      if (J && Math.abs(J.x - o.x) < 26) {
        o.vx = Math.sign(o.x - J.x || 1) * 60;
        o.dir = Math.sign(o.vx);
      }
      o.x = U.clamp(o.x + (o.vx || 0) * dt, (o.min || 0) + 4, (o.max || z.ancho) - 4);
    },
  };

  PROPS.burro = {
    w: 30, h: 26, capa: -1,
    dibujar(x, o, px, py, t) {
      const c = o.color || '#8a7a6a', cs = U.tono(c, -0.2);
      const d = o.dir || 1;
      x.save();
      x.translate(Math.round(px), Math.round(py));
      x.scale(d, 1);
      R(x, -12, -20, 22, 10, c);
      R(x, -12, -12, 22, 2, cs);
      for (const lx of [-10, -6, 4, 8]) R(x, lx, -10, 2, 10, lx < 0 ? cs : c);
      const cab = Math.round(Math.sin(t * 1.5) * 1);
      R(x, 8, -28 + cab, 5, 10, c);
      R(x, 10, -26 + cab, 8, 5, c);
      R(x, 16, -24 + cab, 2, 2, '#3a3028');
      R(x, 9, -33 + cab, 2, 6, cs);
      R(x, 11, -32 + cab, 2, 5, c);
      R(x, 13, -26 + cab, 1, 1, '#1a1010');
      const cola = Math.round(Math.sin(t * 3) * 2);
      R(x, -14, -19, 2, 8 + cola, cs);
      if (o.carga) {
        R(x, -9, -24, 14, 6, '#b8402a');
        R(x, -7, -28, 4, 5, '#c8b088');
        R(x, 0, -28, 4, 5, '#c8b088');
      }
      x.restore();
    },
  };

  PROPS.caballo = {
    w: 40, h: 36, capa: -1,
    dibujar(x, o, px, py, t) {
      const c = o.color || '#5a3a22', cs = U.tono(c, -0.25), cl = U.tono(c, 0.15);
      const d = o.dir || 1;
      x.save();
      x.translate(Math.round(px), Math.round(py));
      x.scale(d, 1);
      R(x, -16, -30, 30, 13, c);
      R(x, -16, -30, 30, 2, cl);
      for (const lx of [-14, -9, 7, 11]) {
        R(x, lx, -18, 3, 18, lx < 0 ? cs : c);
        R(x, lx, -2, 3, 2, '#1a1010');
      }
      const cab = Math.round(Math.sin(t * 1.2 + o.x) * 1.5);
      G.poligono(x, [[10, -28], [14, -44 + cab], [19, -44 + cab], [16, -26]], c);
      R(x, 14, -46 + cab, 10, 6, c);
      R(x, 22, -42 + cab, 3, 3, cs);
      R(x, 14, -49 + cab, 2, 4, c);
      R(x, 17, -44 + cab, 1, 1, '#0a0606');
      // crin y cola
      for (let i = 0; i < 6; i++) R(x, 11 + i, -44 + cab + i * 3, 2, 3, '#1e140e');
      const cola = Math.round(Math.sin(t * 2.5 + o.x) * 2);
      R(x, -19, -29, 4, 3, '#1e140e');
      R(x, -20 + cola, -26, 3, 14, '#1e140e');
      if (o.silla) {
        R(x, -4, -34, 12, 5, o.silla);
        R(x, -2, -30, 8, 10, U.tono(o.silla, -0.2));
        R(x, -5, -35, 2, 3, '#c9a845');
      }
      x.restore();
    },
  };

  // ------------------------------------------------------------------ estructuras sobre las que se puede subir
  // (cada una se acompaña de una plataforma o un sólido en la definición de la zona)
  PROPS.punto = {
    w: 12, h: 30, capa: 0,
    dibujar() {},
  };
  PROPS.cajas = {
    w: 18, h: 18, capa: 1,
    dibujar(x, o, px, py) {
      const w = o.w || 18, h = o.h || 18;
      const n = Math.max(1, Math.round(h / 18));
      for (let i = 0; i < n; i++) {
        const y0 = py - (i + 1) * (h / n);
        R(x, px - w / 2, y0, w, h / n, '#8a6236');
        R(x, px - w / 2, y0, w, 1, '#aa8050');
        R(x, px - w / 2, y0 + h / n - 1, w, 1, '#4a2e16');
        R(x, px - w / 2, y0, 1, h / n, '#4a2e16');
        R(x, px + w / 2 - 1, y0, 1, h / n, '#4a2e16');
        G.linea(x, px - w / 2 + 1, y0 + 1, px + w / 2 - 2, y0 + h / n - 2, '#6a4826');
      }
    },
  };
  PROPS.toldoPlat = {
    w: 50, h: 40, capa: -1,
    dibujar(x, o, px, py) {
      // py = altura del toldo (la plataforma); los postes bajan hasta el suelo de la zona
      const w = o.w || 50, suelo = o.suelo || 300;
      R(x, px - w / 2 + 2, py, 2, suelo - py, '#5a3a22');
      R(x, px + w / 2 - 4, py, 2, suelo - py, '#5a3a22');
      IH.Fondos.toldo(x, px - w / 2, py - 1, w, o.color || '#b8402a');
      R(x, px - w / 2, py - 2, w, 2, '#6a4428');
    },
  };
  PROPS.balcon = {
    w: 60, h: 30, capa: -1,
    dibujar(x, o, px, py) {
      const w = o.w || 60;
      R(x, px - w / 2, py, w, 3, '#5a3a22');
      R(x, px - w / 2, py, w, 1, '#8a6236');
      for (let i = 4; i < w - 2; i += 10) {
        G.linea(x, px - w / 2 + i, py + 3, px - w / 2 + i + 4, py + 10, '#4a2e16');
      }
      G.celosia(x, px - w / 2, py - 12, w, 10, '#5a3a22', '#2a1a10');
      R(x, px - w / 2, py - 13, w, 2, '#6a4428');
    },
  };
  PROPS.tejado = {
    w: 90, h: 80, capa: -1,
    dibujar(x, o, px, py) {
      // cobertizo cercano con azotea transitable (py = altura de la azotea)
      const w = o.w || 90, suelo = o.suelo || 300;
      const c = o.color || '#c9a982';
      R(x, px - w / 2, py, w, suelo - py, c);
      R(x, px + w / 2 - 4, py, 4, suelo - py, U.tono(c, -0.2));
      R(x, px - w / 2, py, w, 2, U.tono(c, 0.15));
      R(x, px - w / 2, py + 2, w, 1, U.tono(c, -0.2));
      for (let ax = px - w / 2; ax < px + w / 2 - 3; ax += 6) {
        R(x, ax, py - 3, 4, 3, c);
        R(x, ax + 1, py - 5, 2, 2, c);
      }
      // puerta y ventanuco
      G.arco(x, px - w / 4, suelo, 12, 20, '#2a1a10');
      G.celosia(x, px + w / 8, py + 12, 10, 10, '#5a3a22', '#2a1a10');
      for (let i = 0; i < 20; i++) R(x, px - w / 2 + ((i * 37) % w), py + 6 + ((i * 53) % (suelo - py - 8)), 1, 1, U.tono(c, -0.1));
    },
  };
  PROPS.tambores = {
    w: 30, h: 16, capa: 1,
    dibujar(x, o, px, py, t) {
      for (const [dx, r] of [[-8, 7], [8, 6]]) {
        R(x, px + dx - r, py - 10, r * 2, 10, '#8a5a2a');
        R(x, px + dx - r, py - 11, r * 2, 2, '#e8dcc0');
        R(x, px + dx - r, py - 5, r * 2, 1, '#5a3a1a');
        R(x, px + dx - r + 1, py - 9, 2, 8, '#a8743a');
      }
    },
  };
  PROPS.tiendaCampa = {
    w: 50, h: 34, capa: -1,
    dibujar(x, o, px, py) {
      if (!o.cache) {
        o.cache = IH.lienzo(70, 50);
        IH.Fondos.tienda(o.cache.x, 35, 46, o.ancho || 48, o.alto || 32, o.color || '#5a5a6a', o.color2 || '#6a3a3a', new IH.Azar(3), { interior: '#2a1a12', bandera: o.bandera });
      }
      x.drawImage(o.cache.c, Math.round(px - 35), Math.round(py - 46));
    },
  };
  PROPS.taburete = {
    w: 10, h: 8, capa: 1,
    dibujar(x, o, px, py) {
      R(x, px - 5, py - 8, 10, 2, '#6a4428');
      R(x, px - 4, py - 6, 1, 6, '#4a2e16');
      R(x, px + 3, py - 6, 1, 6, '#4a2e16');
    },
  };
  PROPS.fuegoGrande = {
    w: 40, h: 30, capa: 4,
    luz: { dy: -16, r: 120, color: '#ff7a2a', i: 1, parpadeo: 0.25 },
    dibujar(x, o, px, py, t) {
      R(x, px - 18, py - 4, 36, 4, '#2a1a10');
      for (let i = 0; i < 14; i++) {
        const fh = 4 + Math.round(U.ruido(t * 7 + i * 1.1, 4) * 18);
        R(x, px - 16 + i * 2.4, py - 4 - fh, 2, fh, i % 3 === 0 ? '#ffe08a' : i % 2 ? '#ff9a3a' : '#e85a1a');
      }
    },
    actualizar(o, dt, z) {
      if (Math.random() < dt * 12) z.particulas.emitir('brasa', o.x + U.lerp(-14, 14, Math.random()), o.y - 14, 1, { fuerza: 1.5 });
      if (Math.random() < dt * 5) z.particulas.emitir('humo', o.x + U.lerp(-10, 10, Math.random()), o.y - 30, 1, { color: '#2a2220', viento: 6 });
    },
  };
  PROPS.cuerpo = {
    w: 30, h: 10, capa: -1,
    dibujar(x, o, px, py) {
      if (!o.spr) o.spr = IH.sprite(o.traje || 'sargento');
      IH.Esq.dibujarMarco(x, o.spr, 'yacer', 0, px, py + 1, o.dir || 1);
    },
  };

  // ------------------------------------------------------------------ clase Objeto
  class Objeto extends IH.Entidad {
    constructor(zona, opc) {
      super(zona, opc);
      this.tipo = opc.tipo;
      this.def = PROPS[opc.tipo];
      if (!this.def) throw new Error('Objeto desconocido ' + opc.tipo);
      Object.assign(this, opc);
      this.w = opc.w || this.def.w;
      this.h = opc.h || this.def.h;
      this.capa = opc.capa != null ? opc.capa : this.def.capa || 0;
      this.sombra = false;
      this.t = Math.random() * 10;
      if (this.def.luz && opc.luz !== false) {
        this.luz = Object.assign({}, this.def.luz, opc.luzOpc || {});
        this.luz.ent = this;
        this.luz.x = this.x;
        this.luz.y = this.y + (this.luz.dy || 0);
        zona.luces.push(this.luz);
      }
      if (this.def.iniciar) this.def.iniciar(this);
    }
    interactuable() {
      return !!this.alInteractuar && !this.recogido && this.visible && !this.desactivado;
    }
    actualizar(dt) {
      this.t += dt;
      if (this.def.actualizar) this.def.actualizar(this, dt, this.zona);
      if (this.luz) {
        this.luz.x = this.x;
        this.luz.y = this.y + (this.luz.dy || 0);
      }
      if (this.def.recogible && !this.recogido && this.zona.jugador) {
        const J = this.zona.jugador;
        if (Math.abs(J.x - this.x) < 12 && J.y > this.y - 30 && J.y - J.h < this.y) this.recoger();
      }
    }
    recoger() {
      this.recogido = true;
      this.borrar = true;
      if (this.tipo === 'moneda') {
        IH.audio.sfx('moneda', { x: this.x });
        if (IH.partida) IH.partida.monedas = (IH.partida.monedas || 0) + (this.valor || 1);
      } else if (this.tipo === 'cronica') {
        IH.desbloquearCronica && IH.desbloquearCronica(this.cronica);
      }
      if (this.alRecoger) this.alRecoger(this);
    }
    dibujar(ctx, cx, cy) {
      if (!this.visible) return;
      this.def.dibujar(ctx, this, this.x - cx, this.y - cy, this.t, cx, cy);
    }
  }
  IH.Objeto = Objeto;
})();
