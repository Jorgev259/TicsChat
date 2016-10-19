var ultimoMensaje = 0;
var usuario = "";

function mensaje() {
    var data = new FormData();
    data.append("accion", "mensaje");
    data.append("mensaje", $("#mensaje").val());
    data.append("sala", "sala0");

    $.ajax({
        url: '/Api/Chat',
        processData: false,
        contentType: false,
        data: data,
        type: 'POST'
    }).done(function (result) {
      
    }).fail(function (a, b, c) {
        console.log(a);
        console.log(b);
        console.log(c);
    });
}
//<input type="text" id="mensaje"/><button onclick="mensaje()"></button>
function check() {
    var data = new FormData();
    usuario = $("#mensaje").val();
    data.append("accion", "join");
    data.append("usuario", usuario);
    data.append("sala", "sala0");

    $.ajax({
        url: '/Api/Chat',
        processData: false,
        contentType: false,
        data: data,
        type: 'POST'
    }).done(function (result) {
        var lista = JSON.parse(result);
        console.log(lista);
        ultimoMensaje = parseInt(lista[lista.length - 1].numero);
        console.log(ultimoMensaje);
        $("body").html('<input type="text" id="mensaje"/><button onclick="mensaje()"></button><div id="online"></div>')

        setTimeout(function () {
            refresh();
        }, 1000);
    }).fail(function (a, b, c) {
        console.log(a);
        console.log(b);
        console.log(c);
        check();
    });
}

function refresh() {
    var data = new FormData();
    data.append("accion", "refresh");
    data.append("ultimoMensaje", ultimoMensaje);
    data.append("sala", "sala0");

    $.ajax({
        url: '/Api/Chat',
        processData: false,
        contentType: false,
        data: data,
        type: 'POST'
    }).done(function (result)
    {
        console.log(result);
        var lista = JSON.parse(result);
        console.log("refresh");
        console.log(lista.length);
        if (lista.length > 0) {
            for (i = 0; i < lista.length ; i++) {
                var elemento = JSON.parse(lista[i]);
                console.log(elemento);
                if (elemento.tipo == "sistema") {

                }

                $("body").append("<br>" + elemento.mensaje);
                ultimoMensaje++;
            }
        }
        setTimeout(function () {
            refresh();
        }, 1000);
    }).fail(function (a, b, c) {
        console.log(a);
        console.log(b);
        console.log(c);
        check();
    });

    
}

//window.addEventListener('beforeunload', function () {
//    var wait = true;

//    var data = new FormData();
//    data.append("accion", "offline");
//    data.append("usuario", usuario);
//    data.append("sala", "sala0");

//    $.ajax({
//        url: '/Api/Chat',
//        processData: false,
//        contentType: false,
//        data: data,
//        type: 'POST'
//    }).done(function (result) {
//        wait = false;
//    }).fail(function (a, b, c) {
//        console.log(a);
//        console.log(b);
//        console.log(c);
//    });

//    while (wait == true) { }
//})