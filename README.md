# tcb (TestsCajaBlanca)
Tests de caja blanca para la web. Implementado en Javascript usando AJAX.

## 1 Uso
### 1.1 Creación script
Crea un script en Javascript con una función que devuelva si es una página es válida o no. Ejemplo:
```javascript
window.definirPruebaTCB(function miFuncionDeValidacion(datosPagina, argumentosValidacion, testPagina){
  try {
    var jsonRespuesta = JSON.parse(datosPagina);
    return !jsonRespuesta.error;
  } catch (e){
    return false;
  }
});
```

Este script únicamente comprueba que la página devuelve un texto que está en formato json y que no contiene un atributo llamado `error`.

La función `definirPruebaTCB` siempre se debe invocar pasando una función. Esta función se va a llamar cuando se esté realizando el test en la página. Se llamará con tres argumentos que son los que permitirán comprobar la validez de la página. La función `miFuncionDeValidacion` debe devolver un valor booleano indicando si el resultado obtenido es correcto o no.

Argumentos de la función:

- `datosPagina`: Es el contenido de la página que se está evaluando.
- `argumentosValidacion`: Es un objeto que puede contener argumentos personalizados para cada prueba (por ejemplo, un mismo script podría realizar comprobaciones diferentes en función del objeto `argumentosValidacion`).
- `testPagina`: Es un objeto del tipo `TestPagina` y contiene todas las propiedades del test que se está realizando. Ver objeto `TestPagina` para más información.

### 1.2 Creación de la definición de la pruebas
Se debe crear la definición de la pruebas en formato JSON. Ejemplo:
```json
[{
  "url": "ejemplos/paginas/ejemplo1.php",
  "metodo": "POST",
  "argumentosPeticion": {
    "contrasenha": "1234"
  },
  "tipoValidacion": "javascript",
  "script": "ejemplos/scripts/ejemplo1.js",
  "argumentosValidacion": {},
  "resultadoEsperado": true
}]
```

NOTA: Todas los enlaces son relativos a la ruta donde está el `test.html`

Explicación de cada propiedad:

- `url`: Obligatorio. Url que se va analizar.
- `metodo`: Obligatorio. Método HTTP POST o GET. No es sensible a mayúsculas.
- `argumentosPeticion`: Opcional. Los argumentos que se pasarán a la hora de llamar a la página (en el caso de POST serían los valores del formulario, en el caso de GET serían los parámetros de la url).
- `tipoValidacion`: Obligatorio. Actualmente solo disponible la validación usando javascript.
- `script`: URL del script de pruebas (el creado en el punto 1.1).
- `argumentosValidacion`: Opcional. Objeto que permite definir argumentos personalizados y que se pueden leer desde el script.
- `resultadoEsperado`: Obligatorio. Valor booleano indicando si se espera que el test devuelva un resultado correcto o incorrecto.

### 1.3 Realización de los tests
Dos modos de utilización:
#### 1.3.1 Interfaz gráfica
Se puede utilizar la interfaz gráfica de la página `test.html` pasando en el argumento de la página `urlJson` la url del json que definimos el punto 1.2.

NOTA: La url del json es relativa a `test.html`

### 1.3.2 Utilización de `tcn.js`
Se puede implementar una aplicación con la librería `tcb.js` (requiere jQuery).

## 2. Licencia
Copyright 2015 Martín Molina Álvarez

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
