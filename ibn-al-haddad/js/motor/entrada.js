/* Entrada: teclado, ratón y mando (API Gamepad, compatible con Steam Deck / Xbox / PlayStation).
 * Se trabaja con ACCIONES, no con teclas: el resto del juego pregunta
 *   IH.entrada.pulsado('atacar')   → se mantiene pulsado
 *   IH.entrada.presionado('saltar')→ se pulsó en este paso de lógica
 */
'use strict';
(function () {
  const IH = window.IH;

  const ACCIONES = [
    'izq', 'der', 'arriba', 'abajo', 'saltar', 'atacar', 'fuerte', 'bloquear',
    'esquivar', 'interactuar', 'curar', 'pausa', 'aceptar', 'cancelar', 'saltarEscena',
  ];

  const TECLAS_POR_DEFECTO = {
    izq: ['KeyA', 'ArrowLeft'],
    der: ['KeyD', 'ArrowRight'],
    arriba: ['KeyW', 'ArrowUp'],
    abajo: ['KeyS', 'ArrowDown'],
    saltar: ['Space'],
    atacar: ['KeyJ', 'Raton0'],
    fuerte: ['KeyK', 'Raton2'],
    bloquear: ['KeyL', 'ShiftRight'],
    esquivar: ['ShiftLeft', 'KeyI'],
    interactuar: ['KeyE', 'KeyW', 'ArrowUp'],
    curar: ['KeyQ', 'KeyR'],
    pausa: ['Escape', 'KeyP'],
    aceptar: ['Enter', 'Space', 'KeyE', 'KeyJ', 'Raton0', 'NumpadEnter'],
    cancelar: ['Escape', 'Backspace'],
    saltarEscena: ['Escape', 'Enter', 'Space'],
  };

  // Mapeo estándar de mando
  const BOTONES = {
    saltar: [0],
    aceptar: [0],
    esquivar: [1, 7],
    cancelar: [1],
    atacar: [2],
    fuerte: [3],
    bloquear: [4, 5, 6],
    curar: [8],
    pausa: [9],
    saltarEscena: [9, 0],
    arriba: [12],
    abajo: [13],
    izq: [14],
    der: [15],
    interactuar: [12],
  };

  const NOMBRES_TECLA = {
    Space: 'Espacio', ShiftLeft: 'Mayús', ShiftRight: 'Mayús Dcha', Enter: 'Intro', Escape: 'Esc',
    ArrowLeft: '←', ArrowRight: '→', ArrowUp: '↑', ArrowDown: '↓', Backspace: 'Retroceso',
    Raton0: 'Clic izq.', Raton2: 'Clic dcho.', NumpadEnter: 'Intro',
  };
  const NOMBRES_MANDO = {
    saltar: 'Ⓐ', aceptar: 'Ⓐ', esquivar: 'Ⓑ', cancelar: 'Ⓑ', atacar: 'Ⓧ', fuerte: 'Ⓨ',
    bloquear: 'LB / RB', curar: 'Select', pausa: 'Start', interactuar: '↑', saltarEscena: 'Start',
    izq: '←', der: '→', arriba: '↑', abajo: '↓',
  };

  const teclas = new Set(); // teclas físicas pulsadas
  const pendientes = new Set(); // pulsaciones registradas desde el último paso
  const estado = {};
  const previo = {};
  const bufferPulsacion = {}; // tiempo restante del búfer de pulsación por acción
  ACCIONES.forEach((a) => {
    estado[a] = false;
    previo[a] = false;
    bufferPulsacion[a] = 0;
  });

  const E = (IH.entrada = {
    teclas: JSON.parse(JSON.stringify(TECLAS_POR_DEFECTO)),
    ultimoDispositivo: 'teclado',
    ejes: { x: 0, y: 0 },
    bloqueada: false,
    cualquierTecla: false,
    raton: { x: 0, y: 0, movido: false },

    actualizar() {
      for (const a of ACCIONES) previo[a] = estado[a];
      const activos = {};
      for (const a of ACCIONES) {
        let on = false;
        for (const t of this.teclas[a]) {
          if (teclas.has(t) || pendientes.has(t)) {
            on = true;
            break;
          }
        }
        activos[a] = on;
      }
      // Mando
      this.ejes.x = 0;
      this.ejes.y = 0;
      const pads = navigator.getGamepads ? navigator.getGamepads() : [];
      for (const p of pads) {
        if (!p || !p.connected) continue;
        const ax = p.axes[0] || 0, ay = p.axes[1] || 0;
        if (Math.abs(ax) > 0.35) this.ejes.x = ax;
        if (Math.abs(ay) > 0.35) this.ejes.y = ay;
        let algo = Math.abs(ax) > 0.35 || Math.abs(ay) > 0.35;
        for (const a in BOTONES) {
          for (const b of BOTONES[a]) {
            const bt = p.buttons[b];
            if (bt && (bt.pressed || bt.value > 0.5)) {
              activos[a] = true;
              algo = true;
            }
          }
        }
        if (ax < -0.35) activos.izq = true;
        if (ax > 0.35) activos.der = true;
        if (ay < -0.6) {
          activos.arriba = true;
          activos.interactuar = true;
        }
        if (ay > 0.6) activos.abajo = true;
        if (algo) this.ultimoDispositivo = 'mando';
      }
      for (const a of ACCIONES) {
        estado[a] = this.bloqueada ? false : activos[a];
        if (estado[a] && !previo[a]) bufferPulsacion[a] = 0.12;
        else bufferPulsacion[a] = Math.max(0, bufferPulsacion[a] - IH.PASO);
      }
      this.cualquierTecla = pendientes.size > 0;
      pendientes.clear();
    },

    pulsado(a) {
      return estado[a];
    },
    presionado(a) {
      return estado[a] && !previo[a];
    },
    soltado(a) {
      return !estado[a] && previo[a];
    },
    // Pulsación con búfer: perdona pulsar un poco antes de tiempo (salto, ataque…)
    enBufer(a) {
      return bufferPulsacion[a] > 0;
    },
    consumir(a) {
      bufferPulsacion[a] = 0;
      previo[a] = estado[a];
    },
    consumirTodo() {
      for (const a of ACCIONES) {
        bufferPulsacion[a] = 0;
        previo[a] = estado[a];
      }
    },
    horizontal() {
      if (Math.abs(this.ejes.x) > 0.35) return Math.sign(this.ejes.x);
      return (estado.der ? 1 : 0) - (estado.izq ? 1 : 0);
    },
    vertical() {
      return (estado.abajo ? 1 : 0) - (estado.arriba ? 1 : 0);
    },
    // Texto que se muestra en los avisos ("Pulsa J para atacar")
    etiqueta(a) {
      if (this.ultimoDispositivo === 'mando') return NOMBRES_MANDO[a] || a;
      const t = this.teclas[a] && this.teclas[a][0];
      if (!t) return a;
      if (NOMBRES_TECLA[t]) return NOMBRES_TECLA[t];
      return t.replace('Key', '').replace('Digit', '');
    },
    vibrar(intensidad = 0.5, ms = 120) {
      if (IH.ajustes && IH.ajustes.vibracion === false) return;
      const pads = navigator.getGamepads ? navigator.getGamepads() : [];
      for (const p of pads) {
        if (p && p.vibrationActuator && p.vibrationActuator.playEffect) {
          p.vibrationActuator
            .playEffect('dual-rumble', {
              duration: ms,
              strongMagnitude: intensidad,
              weakMagnitude: intensidad * 0.6,
            })
            .catch(() => {});
        }
      }
    },
  });

  const BLOQUEAR_DEFECTO = new Set([
    'Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab', 'Backspace',
  ]);

  window.addEventListener('keydown', (e) => {
    if (e.repeat) {
      if (BLOQUEAR_DEFECTO.has(e.code)) e.preventDefault();
      return;
    }
    if (e.code === 'F11' || (e.code === 'Enter' && e.altKey)) {
      e.preventDefault();
      IH.alternarPantallaCompleta && IH.alternarPantallaCompleta();
      return;
    }
    teclas.add(e.code);
    pendientes.add(e.code);
    E.ultimoDispositivo = 'teclado';
    if (BLOQUEAR_DEFECTO.has(e.code)) e.preventDefault();
    if (IH.audio) IH.audio.desbloquear();
  });
  window.addEventListener('keyup', (e) => {
    teclas.delete(e.code);
  });
  window.addEventListener('blur', () => teclas.clear());

  const pant = () => IH.pantalla;
  window.addEventListener('mousedown', (e) => {
    const c = 'Raton' + e.button;
    teclas.add(c);
    pendientes.add(c);
    E.ultimoDispositivo = 'teclado';
    if (IH.audio) IH.audio.desbloquear();
  });
  window.addEventListener('mouseup', (e) => teclas.delete('Raton' + e.button));
  window.addEventListener('contextmenu', (e) => e.preventDefault());
  window.addEventListener('mousemove', (e) => {
    const v = IH.vista;
    if (!v || !pant()) return;
    const r = pant().getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * pant().width;
    const py = ((e.clientY - r.top) / r.height) * pant().height;
    E.raton.x = (px - v.x) / v.uiEsc;
    E.raton.y = (py - v.y) / v.uiEsc;
    E.raton.movido = true;
  });
  window.addEventListener('gamepadconnected', () => {
    E.ultimoDispositivo = 'mando';
    if (IH.notificar) IH.notificar('Mando conectado');
  });
})();
