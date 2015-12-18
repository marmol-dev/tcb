(function($){
  function Herramientas(){}

  Herramientas.esUrl = function esUrl(url){
    var urlregex = /^(https?|ftp):\/\/([a-zA-Z0-9.-]+(:[a-zA-Z0-9.&%$-]+)*@)*((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}|([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(:[0-9]+)*(\/($|[a-zA-Z0-9.,?'\\+&%$#=~_-]+))*$/;
    return typeof url === 'string' && urlregex.test(url);
  };

  Herramientas.esPath = function(path){
    return typeof path === 'string';//Implement
  };

  function Resultado(url, metodo, argumentosPeticion, esperado, obtenido){
    this.url = url;
    this.metodo = metodo;
    this.argumentosPeticion = argumentosPeticion;

    this.esperado = !!esperado;
    this.obtenido = !!obtenido;
    this.correcto = esperado === obtenido;
  }


  function TCB(definicionPruebas){
    if (!Array.isArray(definicionPruebas)){
      throw new Error('Definicion de pruebas inválida');
    }
    var testsPaginas = [], i, resultados = [];

    for (i = definicionPruebas.length - 1; i >= 0; i--){
      testsPaginas.push(new TestPagina(definicionPruebas[i]));
    }

    this.testsPaginas = testsPaginas;
    this.resultados = [];
  }

  TCB.crearViaJSON = function(urlJson, callback){
    if (!Herramientas.esUrl(urlJson) && !Herramientas.esPath(urlJson)){
      throw new Error('URL del json inválida');
    }

    if (typeof callback !== 'function'){
      throw new Error('Callback inválido');
    }

    $.getJSON(urlJson)
      .then(function(datos){
        try {
          var t = new TCB(datos);
          callback(null, t);
          return;
        } catch (e){
          callback(e);
        }
      }, function(error){
        callback(new Error('JSON de las pruebas incorrecto'));
      });
  };

  TCB.prototype.validar = function(callback){
    if (typeof callback !== 'function') callback = function(){};
    var i = this.testsPaginas.length - 1, self = this;
    function recursivo(i){
      if (i < 0){
        callback(null, self.resultados);
        return;
      }

      self.testsPaginas[i].validar(function(err, resultado){
        if (err) {
          callback(err);
          return;
        } else {
          self.resultados.push(resultado);
          recursivo(i-1);
        }
      });
    }
    recursivo(i);
  };

  function TestPagina(opts){
    if (opts instanceof Object === false){
      throw new Error('Opciones del test inválidas');
    }

    var tipoValidacion = opts.tipoValidacion,
      script = opts.script,
      argumentosValidacion = opts.argumentosValidacion,
      url = opts.url,
      metodo = opts.metodo,
      argumentosPeticion = opts.argumentosPeticion,
      resultadoEsperado = opts.resultadoEsperado;

    if (!Herramientas.esUrl(url) && !Herramientas.esPath(url)){
      throw new Error('URL "'+ url + '" inválida al validar la página');
    }

    if (typeof metodo !== 'string' || ['POST', 'GET'].lastIndexOf(metodo.toUpperCase()) === -1){
      throw new Error('Método HTTP inválido');
    }
    metodo = metodo.toUpperCase();

    if (argumentosPeticion instanceof Object === false){
      argumentosPeticion = {};
    }

    if (argumentosValidacion instanceof Object === false){
      argumentosValidacion = {};
    }

    var errorTipoValidacion = 'Tipo de validación incorrecta para la página "' + url + '"';
    if (typeof tipoValidacion !== 'string'){
      throw new Error(errorTipoValidacion);
    } else {
      switch(tipoValidacion){
        case 'javascript':
          if (typeof script !== 'string'){
            throw new Error('Las pruebas para la página "' + url + '" no son del tipo "javascript"');
          }
          break;
        default:
          throw new Error(errorTipoValidacion);
      }
    }

    if (typeof resultadoEsperado !== 'boolean'){
      throw new Error('El valor "resultadoEsperado" es inválido para la página "' + resultadoEsperado + '"');
    }

    this.url = url;
    this.metodo = metodo;
    this.argumentosPeticion = argumentosPeticion;
    this.tipoValidacion = tipoValidacion;
    this.argumentosValidacion = argumentosValidacion;
    this.script = script;

    this.datosPagina = null;

    this.resultadoEsperado = resultadoEsperado;
    this.resultado = null;
  }

  TestPagina.funcionPruebaActual = null;

  TestPagina.prototype.validarUsandoScript = function (callback){
    var self = this,
      resultadoObtenido,
      resultado;
    $.getScript(this.script)
      .then(function(contenidoScript){
        //Ejecutamos el script
        TestPagina.pruebaActual = null;

        if (TestPagina.funcionPruebaActual === null){
          callback(new Error('El script "' + self.script + '" no ha definido una función de prueba.'));
        } else {
          try {
            resultadoObtenido = TestPagina.funcionPruebaActual.call(undefined, self.datosPagina, self.argumentosValidacion, self);
          } catch (err){
            callback(new Error('La función de validación en el script "' + self.script +'" ha lanzado un error'));
            return;
          }

          if (typeof resultadoObtenido === 'boolean'){
            resultado = new Resultado(self.url, self.metodo, self.argumentosPeticion, self.resultadoEsperado, resultadoObtenido);
            self.resultado = resultado;
            callback(null, resultado);
          } else {
            callback(new Error('La función de validación del script "'+self.script+'" ha devuelto un valor inválido'));
          }
        }
      },
      function(err){
        var error = new Error('Se ha producido un error al obtener el script "'+self.script+'"');
      });
  };

  TestPagina.prototype.validar = function validar(callback){
    if (typeof callback !== 'function') callback = function(){};
    var self = this;
    //obtenemos la página
    $.ajax({
      method: self.metodo,
      url: self.url,
      data: self.argumentosPeticion
    }).then(function(datosPagina){
      self.datosPagina = datosPagina;

      switch(self.tipoValidacion){
        case 'javascript':
          self.validarUsandoScript(callback);
          break;
      }
    }, function(error){
      callback(new Error('Se ha producido un error obteniendo la página "' + self.url + '"'));
    });
  };

  window.TestPagina = TestPagina;
  window.TCB = TCB;

  window.definirPruebaTCB = function(fn){
    if (typeof fn !== 'function'){
      throw new Error('Función inválida al definir prueba');
    }

    TestPagina.funcionPruebaActual = fn;
  };

})(window.jQuery);
