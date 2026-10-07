/* Arranque: espera a las fuentes, prepara el audio y abre la pantalla de título.
 * Atajos de desarrollo en la URL:  #zona=forja   #zona=calles&entrada=desdeForja
 *                                  #cine=intro   #depurar
 */
'use strict';
(function () {
  const IH = window.IH;

  async function cargarFuentes() {
    const fam = ['400 40px Alegreya', 'italic 400 40px Alegreya', '600 40px Alegreya', '400 40px "Reem Kufi"', '600 40px "Reem Kufi"', '700 40px "Aref Ruqaa"', '400 40px Amiri'];
    try {
      await Promise.race([Promise.all(fam.map((f) => document.fonts.load(f, 'Aá ابن'))), new Promise((r) => setTimeout(r, 4000))]);
    } catch (e) {
      /* se usarán fuentes del sistema */
    }
  }

  function parametros() {
    const h = location.hash.replace('#', '');
    const p = {};
    for (const par of h.split('&')) {
      const [k, v] = par.split('=');
      if (k) p[k] = v === undefined ? true : decodeURIComponent(v);
    }
    return p;
  }

  async function iniciar() {
    await cargarFuentes();
    IH.audio.iniciar();
    const p = parametros();
    IH.redimensionar();
    if (p.zona) {
      IH.nuevaPartida(p.dificultad || 'normal');
      if (p.banderas) for (const b of p.banderas.split(',')) IH.partida.banderas[b] = true;
      if (p.traje) IH.partida.traje = p.traje;
      if (p.agua) IH.partida.agua = IH.partida.aguaMax = +p.agua;
      IH.cambiarEscena('zona', { zona: p.zona, entrada: p.entrada || 'inicio', traje: p.traje }, { fundido: 0 });
    } else if (p.cine) {
      IH.nuevaPartida();
      IH.cambiarEscena('cinematica', { id: p.cine }, { fundido: 0 });
    } else {
      IH.cambiarEscena('titulo', {}, { fundido: 0 });
    }
    IH.arrancar();
    const carga = document.getElementById('carga');
    carga.classList.add('oculto');
    setTimeout(() => carga.remove(), 900);
    window.__listo = true;
  }

  // Oculta el cursor si no se mueve el ratón
  let tCursor = 0;
  window.addEventListener('mousemove', () => {
    document.body.classList.remove('sin-cursor');
    clearTimeout(tCursor);
    tCursor = setTimeout(() => document.body.classList.add('sin-cursor'), 2500);
  });
  // Pausa automática al perder el foco
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && IH.escena && IH.escena.nombre === 'zona' && !IH.escena.pausa && IH.MenuPausa) IH.escena.pausa = new IH.MenuPausa(IH.escena);
  });

  iniciar();
})();
