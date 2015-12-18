(function(TestPagina){
  var opts = {
    tipoValidacion: 'javascript',
    script: 'ejemplos/scripts/ejemplo1.js',
    argumentosValidacion: {
      json: true
    },
    url: 'ejemplos/paginas/ejemplo1.php',
    metodo: 'POST',
    argumentosPeticion: {
      'contrasenha': '1234'
    },
    resultadoEsperado: true
  };
  var miTest = new TestPagina(opts);
  miTest.validar(function(err, res){
    console.log(err, res);
  });
})(window.TestPagina);
