(function(TestPagina, TCB){
  function gup( name, url ) {
    if (!url) url = location.href;
    name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
    var regexS = "[\\?&]"+name+"=([^&#]*)";
    var regex = new RegExp( regexS );
    var results = regex.exec( url );
    return results === null ? null : decodeURIComponent(results[1]);
  }

  var plantillas = {};
  function definirPlantillas(nombres){
    for (var i = nombres.length - 1; i >= 0; i--){
      plantillas[nombres[i]] = twig({data: $('#plantilla-' + nombres[i]).text()});
    }
  }

  function renderizar(id, datos){
    $('#' + id).show().html(plantillas[id].render(datos));
  }

  function cargar(){
    definirPlantillas(['cabecera', 'error', 'resultados']);

    var urlJson = gup('urlJson');
    if (urlJson){
      renderizar('cabecera', {urlJson: urlJson});
    } else {
      renderizar('error', {error: new Error('No se ha especificado una url para el json de pruebas. Se debe pasar la url del json de las pruebas en el parámetro "urlJson".')});
      return;
    }

    TCB.crearViaJSON(urlJson,function(err, miTCB){
      if (err){
        renderizar('error', {error: err});
        console.error(err);
      } else {
        miTCB.validar(function(err, resultados){
          if (err){
            console.trace(err.stack);
            renderizar('error', {error: err});
          } else {
            console.log(resultados);
            renderizar('resultados', {resultados: resultados});
          }
        });
      }
    });
  }

  $(document).ready(cargar);
})(window.TestPagina, window.TCB);
