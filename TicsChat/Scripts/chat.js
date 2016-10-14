numero = 0;
var ultimoMensaje = 0;
function timer() {
    numero++
    $("#counter").text(numero);
    
}

function mensaje() {
    var data = new FormData();
    data.append("accion", "mensaje");
    data.append("mensaje", $("#mensaje").val());

    $.ajax({
        url: '/Api/Chat',
        processData: false,
        contentType: false,
        data: data,
        type: 'POST'
    }).done(function (result) {
        $("body").append("<br>" + $("#mensaje").val());
        ultimoMensaje++;
    }).fail(function (a, b, c) {

    });
}

function check() {
    var data = new FormData();
    data.append("accion", "refresh");
    data.append("ultimoMensaje", ultimoMensaje);

    $.ajax({
        url: '/Api/Chat',
        processData: false,
        contentType: false,
        data: data,
        type: 'POST'
    }).done(function (result) {
        console.log("refresh");
        var lista = JSON.parse(result);
        for (i = 0; i < lista.length ; i++) {
            var elemento = JSON.parse(lista[i]);
            console.log(parseInt(elemento.id));
            if (parseInt(elemento.id) > ultimoMensaje) {
                $("body").append("<br>" + elemento.mensaje);
                ultimoMensaje++;
            }
        }

        setTimeout(function () {
            check();
        }, 1000);
    }).fail(function (a, b, c) {

    });

    
}

$("document").ready(function(){
    check();
})