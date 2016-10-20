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
        if (result == "Login ya existe en esta sala") {
            alert(result);
        } else {
            var lista = JSON.parse(result);

            ultimoMensaje = parseInt(lista[lista.length - 1].numero);

            $("body").html('<input type="text" id="mensaje"/><button onclick="mensaje()"></button><div id="online"></div>')

            for (i = 0; i < lista.length - 1; i++) {
                $("#online").append("<div id='" + lista[i].nombre + "'>" + lista[i].nombre + "<br></div>");
            }

            setTimeout(function () {
                refresh();
            }, 1000);

        }

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
        if (lista.length > 0) {
            for (i = 0; i < lista.length ; i++) {
                var elemento = JSON.parse(lista[i]);

                if (elemento.tipo == "sistema") {
                    switch (elemento.modo) {
                        case "online":
                            $("#online").append("<div id='" + elemento.info + "'>" + elemento.info + "<br></div>");
                            break;
                        case "offline":
                            break;
                    }
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

window.addEventListener('beforeunload', function () {
    var wait = true;
    setTimeout(function () {
        wait = false;
    },1000);

    var data = new FormData();
    data.append("accion", "offline");
    data.append("usuario", usuario);
    data.append("sala", "sala0");

    $.ajax({
        url: '/Api/Chat',
        processData: false,
        contentType: false,
        data: data,
        type: 'POST'
    }).done(function (result) {
        wait = false;
    }).fail(function (a, b, c) {
        console.log(a);
        console.log(b);
        console.log(c);
    });

    while (wait == true) { }
})