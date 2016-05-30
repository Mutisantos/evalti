       var app = {
           // Application Constructor
           initialize: function() {
               this.bindEvents();
           },
           // Bind Event Listeners
           //
           // Bind any events that are required on startup. Common events are:
           // 'load', 'deviceready', 'offline', and 'online'.
           bindEvents: function() {
               document.addEventListener('deviceready', this.onDeviceReady, false);
           },
           // deviceready Event Handler
           //
           // The scope of 'this' is the event. In order to call the 'receivedEvent'
           // function, we must explicitly call 'app.receivedEvent(...);'
           onDeviceReady: function() {
               app.receivedEvent('deviceready');
           },
           // Update DOM on a Received Event
           receivedEvent: function(id) {
               var parentElement = document.getElementById(id);
               var listeningElement = parentElement.querySelector('.listening');
               var receivedElement = parentElement.querySelector('.received');

               listeningElement.setAttribute('style', 'display:none;');
               receivedElement.setAttribute('style', 'display:block;');

               console.log('Received Event: ' + id);
           }
       };

       app.initialize();


       //Se guardan todas las preguntas de un examen
       var Preguntas = [];
       var cantPreguntas = 0;
       var numExam = 0;
       var calificacion = 0;

       //Dejo listo la lista de selección y oculto el archivo de texto de json
       $(document).ready(function() {
           $('select').material_select();
           $('#selexamenes').material_select();
           $('#iframe').hide(1000);


       });

       //Se crea un "objeto" de pregunta para meterlo en la lista de preguntas a evaluar
       function question(numero, enunciado, respuesta, valor, explicacion) {
           this.numero = numero;
           this.enunciado = enunciado;
           this.respuesta = respuesta;
           this.valor = valor;
           this.explicacion = explicacion;
       }

       //Cargar todos los exámenes que existen en el localStorage
       function cargarExamen() {
           for (var i in localStorage) {
               //i es la llave, localStorage[i] es el valor de esa llave
               var llave = "\"" + i + "\"";
               var valor = localStorage[i];
               var exam = llave.indexOf("exa_");
               var pregu = llave.indexOf("preg_");
               if (exam != -1 && pregu == -1) {
                   console.log(exam + " " + pregu);
                   alert("encontre el examen" + valor);
               }
           }

       }



       //metodo de AJAX para asignar la carga de todos los exámenes guardados y armar el listado
       $(document).ready(function() {
           //$("#btn_cargar").click(function() {
           $("#btn_preguntas").show(1000);
           document.getElementById('btn_preguntas').style.visibility = "visible";

           //document.getElementById('selexamenes').innerHTML = '';
           //Leo todo lo que esta almacenado en el localStorage de examenes que he ido creando
           for (var i in localStorage) {
               //i es la llave, localStorage[i] es el valor de esa llave
               var llave = "\"" + i + "\"";
               var valor = localStorage[i];
               var exam = llave.indexOf("exa_");
               var pregu = llave.indexOf("preg_");
               if (exam != -1 && pregu == -1) { //Es un examen y no una pregunta
                   console.log(exam + " " + pregu);
                   var value = JSON.parse(valor);
                   var nomenclatura = value.exa_numero + ". " + value.exa_materia + " por el profesor " + value.exa_autor + " ";
                   document.getElementById('selexamenes').innerHTML += "<option value=\"" + value.exa_numero + "\">" + nomenclatura + "</option>";
                   numExam = value.exa_numero;
               }
           }

       });


       //Leo el archivo donde se encuentra el json de los dos examenes base
       function leerarchivo() {
           var fields = document.getElementById('iframe').contentDocument.body.firstChild.innerHTML;
           var json = JSON.parse(fields);
           $.each(json, function(key, data) {
               var ex = key.indexOf("exa_");
               var preg = key.indexOf("preg_");
               if (ex != -1 && preg == -1) { //Leo los exámenes almacenados en el archivo de texto
                   var nomenclatura = [];
                   $.each(data, function(index, data) {
                       if (index.indexOf("exa_numero") > -1) {
                           nomenclatura[0] = data;
                       }
                       if (index.indexOf("exa_materia") > -1) {
                           nomenclatura[1] = data;
                       }
                       if (index.indexOf("exa_autor") > -1) {
                           nomenclatura[2] = data;
                       }
                   })
                   var nombre = nomenclatura[0] + ". " + nomenclatura[1] + " por " + nomenclatura[2];
                   //El valor de la opción se toma negativo con el fin de distinguir entre el archivo y el localstorage
                   document.getElementById('selexamenes').innerHTML += "<option value=\"" + (-nomenclatura[0]) + "\">" + nombre + "</option>";
                   console.log(nomenclatura);
               }
           })
           $(document).ready(function() {
               $('select').material_select();
           });
       }

       //Evaluo si ya el usuario ha presentado un examen, asi sea a modo de prueba o absoluto
       function existeResultado(idexam) {
           var usuario = window.localStorage.getItem("loggedUser");
           var llave = usuario + idexam;
           var boolean = false;
           for (var i in localStorage) {
               var contiene = i.indexOf(llave); //la persona ya presentó ese examen
               if (contiene > -1) {
                   boolean = true;
               }
           }
           return boolean;
       }

       //metodo AJAX para asignar la carga de todas las preguntas pertenecientes a un examen, tomando el examen seleccionado
       $(document).ready(function() {
           $("#btn_preguntas").click(function() {
               document.getElementById('preguntas').innerHTML = '';
               Preguntas = [];
               var idexam = "exa_num_prueba" + numExam;
               //Miro que tipo de examen toca revisar
               if (numExam > 0) { //Está en el local Storage
                   for (var i in localStorage) {
                       //i es la llave, localStorage[i] es el valor de esa llave
                       var llave = "\"" + i + "\"";
                       var valor = localStorage[i];
                       console.log("--" + llave + ":" + valor);
                       var exam = llave.indexOf("exa_num" + numExam + "preg_num");

                       if (exam != -1) { //Es una pregunta del examen seleccionado

                           var field = JSON.parse(valor);

                           var preg = new question(field.preg_numero, field.preg_enunciado, field.preg_answer, field.preg_valor, field.preg_explicacion);
                           Preguntas.push(preg); //Meto cada pregunta para luego poder evaluar en la aplicación web
                           cantPreguntas += 1;
                           var pregunta = field.preg_numero + "." + field.preg_enunciado + "               Valor:" + field.preg_valor + " Punto(s)";
                           pregunta += "<br>";
                           pregunta += "<form action=\"#\" id = \"pregunta" + field.preg_numero + "\">" +
                               "<p>" +
                               "<input class=\"special\" name=\"group" + field.preg_numero + "\"type=\"radio\" name=\"Opcion1\" value=\"1\" id =\"opcion1Pregunta" + field.preg_numero + "\"/>" + field.preg_opcion1 + "<br>" +
                               "</p>" + "<p>" +
                               "<input class=\"special\" name=\"group" + field.preg_numero + "\"type=\"radio\" name=\"Opcion2\" value=\"2\" id =\"opcion2Pregunta" + field.preg_numero + "\"/>" + field.preg_opcion2 + "<br>" +
                               "</p>" + "<p>" +
                               "<input class=\"special\" name=\"group" + field.preg_numero + "\"type=\"radio\" name=\"Opcion3\" value=\"3\" id =\"opcion3Pregunta" + field.preg_numero + "\"/>" + field.preg_opcion3 + "<br>" +
                               "</p>" + "<p>" +
                               "<input class=\"special\" name=\"group" + field.preg_numero + "\"type=\"radio\" name=\"Opcion4\" value=\"4\" id =\"opcion4Pregunta" + field.preg_numero + "\"/>" + field.preg_opcion4 + "<br>" +
                               "</p>" + "<p id = \"explicacion" + field.preg_numero + "\">" +
                               "</form>";
                           $(document).ready(function() {
                               $('preguntas').material_select();
                           });
                           document.getElementById('preguntas').innerHTML += pregunta + "<br>";
                           document.getElementById('btn_calificar').style.visibility = "visible";
                           document.getElementById('btn_prueba').style.visibility = "visible";
                           $("#btn_calificar").show(1000);
                           $("#btn_prueba").show(1000);
                       }
                   }
               }
               else { //Esta en el archivo de texto
                   var fields = document.getElementById('iframe').contentDocument.body.firstChild.innerHTML;
                   var json = JSON.parse(fields);
                   $.each(json, function(key, data) {
                       var ex = key.indexOf("exa_num" + (-numExam) + "preg_num");
                       if (ex != -1) { //Leo los exámenes almacenados en el archivo de texto
                           var nomenclatura = [];
                           $.each(data, function(index, data) {
                               if (index.indexOf("preg_explicacion") > -1) {
                                   nomenclatura[0] = data;
                               }
                               if (index.indexOf("preg_valor") > -1) {
                                   nomenclatura[1] = data;
                               }
                               if (index.indexOf("preg_numero") > -1) {
                                   nomenclatura[2] = data;
                               }
                               if (index.indexOf("preg_value") > -1) {
                                   nomenclatura[3] = data;
                               }
                               if (index.indexOf("preg_enunciado") > -1) {
                                   nomenclatura[4] = data;
                               }
                               if (index.indexOf("preg_opcion1") > -1) {
                                   nomenclatura[5] = data;
                               }
                               if (index.indexOf("preg_opcion2") > -1) {
                                   nomenclatura[6] = data;
                               }
                               if (index.indexOf("preg_opcion3") > -1) {
                                   nomenclatura[7] = data;
                               }
                               if (index.indexOf("preg_opcion4") > -1) {
                                   nomenclatura[8] = data;
                               }
                           })
                           var preg = new question(nomenclatura[2], nomenclatura[4], nomenclatura[3], nomenclatura[1], nomenclatura[0]);
                           Preguntas.push(preg); //Meto cada pregunta para luego poder evaluar en la aplicación web
                           cantPreguntas += 1;
                           var pregunta = nomenclatura[2] + "." + nomenclatura[4] + "               Valor:" + nomenclatura[1] + " Punto(s)";
                           pregunta += "<br>";
                           pregunta += "<form action=\"#\" id = \"pregunta" + nomenclatura[2] + "\">" +
                               "<p>" +
                               "<input class=\"special\" name=\"group" + nomenclatura[2] + "\"type=\"radio\" name=\"Opcion1\" value=\"1\" id =\"opcion1Pregunta" + nomenclatura[2] + "\"/>" + nomenclatura[5] + "<br>" +
                               "</p>" + "<p>" +
                               "<input class=\"special\" name=\"group" + nomenclatura[2] + "\"type=\"radio\" name=\"Opcion2\" value=\"2\" id =\"opcion2Pregunta" + nomenclatura[2] + "\"/>" + nomenclatura[6] + "<br>" +
                               "</p>" + "<p>" +
                               "<input class=\"special\" name=\"group" + nomenclatura[2] + "\"type=\"radio\" name=\"Opcion3\" value=\"3\" id =\"opcion3Pregunta" + nomenclatura[2] + "\"/>" + nomenclatura[7] + "<br>" +
                               "</p>" + "<p>" +
                               "<input class=\"special\" name=\"group" + nomenclatura[2] + "\"type=\"radio\" name=\"Opcion4\" value=\"4\" id =\"opcion4Pregunta" + nomenclatura[2] + "\"/>" + nomenclatura[8] + "<br>" +
                               "</p>" + "<p id = \"explicacion" + nomenclatura[2] + "\">" +
                               "</form>";
                           document.getElementById('preguntas').innerHTML += pregunta + "<br>";
                           document.getElementById('btn_calificar').style.visibility = "visible";
                           document.getElementById('btn_prueba').style.visibility = "visible";
                           $("#btn_calificar").show(1000);
                           $("#btn_prueba").show(1000);
                       }
                   })
                   $(document).ready(function() {
                       $('preguntas').material_select();
                   });
               }
           });
       });

       function guardarResultado(idexam, nota) {
           var usuario = window.localStorage.getItem("loggedUser");
           var llave = usuario + idexam;
           window.localStorage.setItem(llave, nota);
       }




       function setNumExam() {

           numExam = '';
           var e = document.getElementById("selexamenes");
           numExam = e.options[e.selectedIndex].value; //document.getElementById('numExam').value;

       }

       function takephoto() {
           navigator.camera.getPicture(onSuccess, onFail, {
               quality: 50,
               destinationType: Camera.DestinationType.DATA_URL,
               sourceType: Camera.PictureSourceType.CAMERA
           });
       }

       function onSuccess(imageData) {
           var usuario = window.localStorage.getItem("loggedUser");
           var llavefoto = "foto_exa_num_prueba" + numExam + "_" + usuario;
           window.localStorage.setItem(llavefoto, imageData);
           
       }

       function onFail(message) {
           alert('Fallo : ' + message);
       }

       function mostrarFoto() {
           var usuario = window.localStorage.getItem("loggedUser");
           var llavefoto = "foto_exa_num_prueba" + numExam + "_" + usuario;
           var foto = window.localStorage.getItem(llavefoto);
           var image = document.getElementById('myImage');
           image.src = "data:image/jpeg;base64," + foto;
           document.getElementById("text1").innerHTML = foto;

       }

       function evaluarlocal() {
           var puntajeFinal = 0.0;
           var puntajeTotal = 0.0;
           var i;
           for (i = 0; i < cantPreguntas; i++) {
               var ans = Preguntas[i].respuesta;
               var op1 = document.getElementById("opcion" + ans + "Pregunta" + (i + 1)).checked;
               puntajeTotal += Preguntas[i].valor;
               var cadenaExp = "explicacion" + (i + 1);
               document.getElementById(cadenaExp).innerHTML = Preguntas[i].explicacion;
               document.getElementById(cadenaExp).className = "indigo center white-text";

               if (op1) {
                   alert("correcto");
                   puntajeFinal += Preguntas[i].valor;
               }
               else {
                   alert("incorrecto");
               }
           }
           var examId = "exa_num_prueba" + numExam;
           alert("Obtuviste " + puntajeFinal + " puntos sobre " + puntajeTotal + " de puntos posibles");
           guardarResultado(examId, puntajeFinal);
       }

       function evaluarAbsoluto() {
           var puntajeFinal = 0.0;
           var puntajeTotal = 0.0;
           var i;
           for (i = 0; i < cantPreguntas; i++) {
               var ans = Preguntas[i].respuesta;
               var op1 = document.getElementById("opcion" + ans + "Pregunta" + (i + 1)).checked;
               puntajeTotal += Preguntas[i].valor;
               var cadenaExp = "explicacion" + (i + 1);
               document.getElementById(cadenaExp).innerHTML = Preguntas[i].explicacion;
               document.getElementById(cadenaExp).className = "indigo center white-text";

               if (op1) {
                   alert("correcto");
                   puntajeFinal += Preguntas[i].valor;
               }
               else {
                   alert("incorrecto");
               }
           }
           var examId = "exa_num_prueba" + numExam;
           alert("Obtuviste " + puntajeFinal + " puntos sobre " + puntajeTotal + " de puntos posibles");
           if (!existeResultado(examId)) {
               var examId = "exa_num_abs" + numExam;
               if (!existeResultado(examId)) {
                   takephoto();
                   alert("La foto ha sido guardada con tu calificacion");
                   guardarResultado(examId, puntajeFinal);
                   
               }
               else {
                   var usuario = window.localStorage.getItem("loggedUser");
                   var nota = window.localStorage.getItem(usuario + "exa_num_abs" + numExam);
                   alert("Ya has respondido este examen definitivamente, usuario: " + usuario + " y sacaste " + nota + " puntos correctos y te tomaste esta selfie:");
                   mostrarFoto();
               }
           }
           else {
               var usuario = window.localStorage.getItem("loggedUser");
               var nota = window.localStorage.getItem(usuario + "exa_num_prueba" + numExam);
               alert("Ya has respondido este examen a modo de prueba, usuario: " + usuario + " y sacaste " + nota + " puntos correctos");
           }
       }