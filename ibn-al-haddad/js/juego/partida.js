/* Partida guardada, ajustes y crónicas (enciclopedia histórica desbloqueable).
 * Todo se guarda en localStorage (en Electron/Steam persiste en la carpeta del usuario).
 */
'use strict';
(function () {
  const IH = window.IH;
  const CLAVE_PARTIDA = 'ibn-al-haddad.partida.v1';
  const CLAVE_AJUSTES = 'ibn-al-haddad.ajustes.v1';
  const CLAVE_CRONICAS = 'ibn-al-haddad.cronicas.v1';

  const AJUSTES_DEFECTO = {
    volGeneral: 0.8,
    volMusica: 0.7,
    volEfectos: 0.85,
    volAmbiente: 0.7,
    velTexto: 1,
    narracionAuto: true,
    sacudida: true,
    sangre: true,
    vibracion: true,
    pixelPerfecto: false,
    sonidoTexto: false,
    pantallaCompleta: false,
  };

  function leer(clave) {
    try {
      const v = localStorage.getItem(clave);
      return v ? JSON.parse(v) : null;
    } catch (e) {
      return null;
    }
  }
  function escribir(clave, v) {
    try {
      localStorage.setItem(clave, JSON.stringify(v));
      return true;
    } catch (e) {
      return false;
    }
  }

  IH.ajustes = Object.assign({}, AJUSTES_DEFECTO, leer(CLAVE_AJUSTES) || {});
  IH.guardarAjustes = function () {
    escribir(CLAVE_AJUSTES, IH.ajustes);
    if (IH.audio) IH.audio.aplicarVolumenes();
    if (IH.redimensionar) IH.redimensionar();
  };

  IH.nuevaPartida = function (dificultad = 'normal') {
    IH.partida = {
      version: 1,
      capitulo: 1,
      zona: null,
      entrada: null,
      traje: 'yusufForja',
      vida: null,
      vidaMax: 100,
      agua: 0,
      aguaMax: 0,
      banderas: {},
      cronicas: [],
      objetivo: null,
      dificultad,
      puntoControl: null,
      titulosVistos: [],
      estadisticas: { derrotados: 0, paradas: 0, muertes: 0, tiempo: 0 },
      creada: Date.now(),
      guardada: Date.now(),
    };
    return IH.partida;
  };
  IH.nuevaPartida();

  IH.guardar = function () {
    const P = IH.partida;
    if (!P || !P.zona) return;
    P.guardada = Date.now();
    escribir(CLAVE_PARTIDA, P);
    IH.guardando = 1.5;
  };
  IH.hayPartida = function () {
    const p = leer(CLAVE_PARTIDA);
    return p && p.zona ? p : null;
  };
  IH.continuar = function () {
    const p = IH.hayPartida();
    if (!p) return false;
    IH.partida = Object.assign(IH.nuevaPartida(), p);
    const pc = p.puntoControl || { zona: p.zona, entrada: p.entrada };
    IH.cambiarEscena('zona', { zona: pc.zona, entrada: pc.entrada, curar: true, sinTitulo: false }, { fundido: 1 });
    return true;
  };
  IH.borrarPartida = function () {
    try {
      localStorage.removeItem(CLAVE_PARTIDA);
    } catch (e) {
      /* nada */
    }
  };

  // ------------------------------------------------------------------ crónicas
  IH.CRONICAS = IH.CRONICAS || {};
  IH.cronicasDesbloqueadas = function () {
    return new Set(leer(CLAVE_CRONICAS) || []);
  };
  IH.desbloquearCronica = function (id) {
    const c = IH.CRONICAS[id];
    if (!c) return;
    const P = IH.partida;
    if (!P.cronicas.includes(id)) P.cronicas.push(id);
    const todas = IH.cronicasDesbloqueadas();
    const nueva = !todas.has(id);
    todas.add(id);
    escribir(CLAVE_CRONICAS, [...todas]);
    IH.audio.sfx('pergamino');
    IH.audio.estribillo('cronica');
    IH.notificar('Crónica: ' + c.titulo + (nueva ? '  ·  léela en el menú' : ''), { vida: 4.5 });
    if (Object.keys(IH.CRONICAS).every((k) => todas.has(k))) IH.logro('CRONISTA');
  };

  // ------------------------------------------------------------------ logros (Steam si está disponible)
  IH.LOGROS = {
    FORJA_MAESTRA: 'Maestro herrero: forja una hoja perfecta',
    PRIMERA_PARADA: 'Paciencia: consigue tu primera parada',
    VECINO_CURIOSO: 'Vecino curioso: escucha al cuentacuentos',
    PIEDAD: 'Piedad: perdona la vida al templario',
    PROLOGO: 'El hijo del herrero: termina el Prólogo',
    CRONISTA: 'Cronista: descubre todas las crónicas del Prólogo',
  };
  const CLAVE_LOGROS = 'ibn-al-haddad.logros.v1';
  IH.logro = function (id) {
    const hechos = new Set(leer(CLAVE_LOGROS) || []);
    if (hechos.has(id)) return;
    hechos.add(id);
    escribir(CLAVE_LOGROS, [...hechos]);
    if (window.electronAPI && window.electronAPI.logro) window.electronAPI.logro(id);
    if (IH.LOGROS[id]) IH.notificar('Logro · ' + IH.LOGROS[id], { vida: 5 });
  };

  // Pantalla completa (navegador o Electron)
  IH.alternarPantallaCompleta = function () {
    if (window.electronAPI && window.electronAPI.pantallaCompleta) {
      IH.ajustes.pantallaCompleta = !IH.ajustes.pantallaCompleta;
      window.electronAPI.pantallaCompleta(IH.ajustes.pantallaCompleta);
      IH.guardarAjustes();
      return;
    }
    try {
      if (!document.fullscreenElement) document.documentElement.requestFullscreen();
      else document.exitFullscreen();
    } catch (e) {
      /* nada */
    }
  };
})();
