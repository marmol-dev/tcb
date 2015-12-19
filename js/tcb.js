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

    for (i = 0; i < definicionPruebas.length; i++){
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
    var self = this;
    function recursivo(i){
      if (i === self.testsPaginas.length){
        callback(null, self.resultados);
        return;
      }

      self.testsPaginas[i].validar(function(err, resultadosPagina){
        if (err) {
          callback(err);
          return;
        } else {
          self.resultados = self.resultados.concat(resultadosPagina);
          recursivo(i+1);
        }
      });
    }
    recursivo(0);
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
      resultadoEsperado = opts.resultadoEsperado,
      tests = opts.tests;

    if (!Herramientas.esUrl(url) && !Herramientas.esPath(url)){
      throw new Error('URL "'+ url + '" inválida al validar la página');
    }

    if (typeof metodo !== 'string' || ['POST', 'GET'].lastIndexOf(metodo.toUpperCase()) === -1){
      throw new Error('Método HTTP inválido');
    }
    metodo = metodo.toUpperCase();

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

    if (typeof resultadoEsperado === 'boolean'){
      if (argumentosPeticion instanceof Object === false){
        argumentosPeticion = {};
      }

      if (tests){
        throw new Error('Formato incorrecto para la url "'+url+'": solo se puede definir un "valorEsperado" o el campo "tests" no las dos opciones');
      }

      tests = [];
      tests.push({
        resultadoEsperado: resultadoEsperado,
        argumentosPeticion: argumentosPeticion
      });
    } else {
      if (!Array.isArray(tests)){
        throw new Error('Formato incorrecto para la url "'+url+'": el campo "tests" y "resultadoEsperado" no es válido. Define uno de ellos.');
      } else if(tests.length === 0) {
        throw new Error('Formato incorrecto para la url "' + url + '": el campo "tests" no tiene elementos.');
      } else {
        var i = 0, correcto = true;
        while(i < tests.length && correcto){
          correcto = tests[i] instanceof Object && typeof tests[i].resultadoEsperado === 'boolean';
          if (correcto && tests[i].argumentosPeticion instanceof Object === false){
            tests[i].argumentosPeticion = {};
          }
          i++;
        }
        if (!correcto){
          throw new Error('Formato incorrecto para la url "' + url + '": El test número "' + (i+1) + '" es incorrecto, campo "resultadoEsperado" inválido');
        }
      }
    }

    this.url = url;
    this.metodo = metodo;
    this.tipoValidacion = tipoValidacion;
    this.argumentosValidacion = argumentosValidacion;
    this.script = script;
    this.tests = tests;

    this.resultados = [];

    console.log(this);
  }

  TestPagina.funcionPruebaActual = null;

  TestPagina.prototype.validarUsandoScript = function (test, datosPagina, callback){
    var self = this,
      resultadoObtenido;

    $.getScript(self.script)
      .then(function(contenidoScript){
        //Ejecutamos el script
        TestPagina.pruebaActual = null;

        if (TestPagina.funcionPruebaActual === null){
          callback(new Error('El script "' + self.script + '" no ha definido una función de prueba.'));
        } else {
          try {
            resultadoObtenido = TestPagina.funcionPruebaActual.call(undefined, datosPagina, self.argumentosValidacion, self, test);
          } catch (err){
            callback(new Error('La función de validación en el script "' + self.script +'" ha lanzado un error'));
            return;
          }

          if (typeof resultadoObtenido === 'boolean'){
            callback(null, resultadoObtenido);
          } else {
            callback(new Error('La función de validación del script "'+self.script+'" ha devuelto un valor inválido'));
          }
        }
      },
      function(err){
        var error = new Error('Se ha producido un error al obtener el script "' + self.script + '"');
      });
  };

  TestPagina.prototype.validar = function validar(callback){
    if (typeof callback !== 'function') callback = function(){};
    var self = this;

    function callbackValidacionPagina(error, resultadoObtenido){
      var i = this.i;

      if (error){
        callback(error);
        return;
      }

      self.resultados.push(new Resultado(self.url, self.metodo, self.tests[i].argumentosPeticion, self.tests[i].resultadoEsperado, resultadoObtenido));
      recursivo(i+1);
    }

    function recursivo(i){
      if (i === self.tests.length){
        callback(null, self.resultados);
        return;
      }

      console.log('i', i, self.tests[i]);

      $.ajax({
        method: self.metodo,
        url: self.url,
        data: self.tests[i].argumentosPeticion
      }).then(function(datosPagina){
        switch(self.tipoValidacion){
          case 'javascript':
            console.log('tests', i, self.tests);
            self.validarUsandoScript.call(self, self.tests[i], datosPagina, callbackValidacionPagina.bind({i:i}));
            break;
        }
      }, function(error){
        callback(new Error('Se ha producido un error obteniendo la página "' + self.url + '" en el test número "' + i + '"'));
      });
    }

    recursivo(0);

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
