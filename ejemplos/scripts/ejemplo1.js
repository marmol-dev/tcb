window.definirPruebaTCB(function(datosPagina, argumentosValidacion, testPagina){
  try {
    var jsonRespuesta = JSON.parse(datosPagina);
    return !jsonRespuesta.error;
  } catch (e){
    return false;
  }
});
