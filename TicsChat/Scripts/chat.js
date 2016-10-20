var ultimoMensaje = 0;
var usuario = "";
var sala1 = "";


function mensaje() {
    var data = new FormData();
    data.append("accion", "mensaje");
    data.append("mensaje", $("#mensaje").val());
    data.append("sala", sala1);
    $("#mensaje").val([]);

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
    sala1 = $("#sala").val();

    usuario = $("#mensaje").val();
    data.append("accion", "join");
    data.append("usuario", usuario);
    data.append("sala", sala1);

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

            $("body").html('<input type="text" id="mensaje"/><button onclick="mensaje()">Enviar</button><div id="mensajes"></div><div id="online"></div>');
            startEmotes();

            for (i = 0; i < lista.length - 1; i++) {
                $("#online").append("<div id='" + lista[i].nombre + "'>" + lista[i].nombre + "<br></div>");
            }

            log_out_listener();

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
    data.append("sala", sala1);

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
                            $("#" + elemento.info).hide()
                            break;
                    }
                }

                $("#mensajes").append("<br>" + elemento.mensaje);
                emojify.run();
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

function startEmotes() {
    emojify.setConfig({
        emojify_tag_type: 'div',           // Only run emojify.js on this element
        only_crawl_id: null,            // Use to restrict where emojify.js applies
        img_dir: 'images/basic',  // Directory for emoji images
        ignored_tags: {                // Ignore the following tags
            'SCRIPT': 1,
            'TEXTAREA': 1,
            'A': 1,
            'PRE': 1,
            'CODE': 1
        }
    });
}
function log_out_listener() {
    //window.addEventListener('beforeunload', function () {
    //    var wait = true;
    //    setTimeout(function () {
    //        wait = false;
    //    }, 1000);

    //    var data = new FormData();
    //    data.append("accion", "offline");
    //    data.append("usuario", usuario);
    //    data.append("sala", sala1);

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
}