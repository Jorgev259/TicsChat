var ultimoMensaje = 0;
var usuario = "";
var sala1 = "";

function inicio() {
    var data = new FormData();
    data.append("accion", "inicio");

    $.ajax({
        url: '/Api/Chat',
        processData: false,
        contentType: false,
        data: data,
        type: 'POST'
    }).done(function (result) {
        var lista = JSON.parse(result);

        for (i = 0; i < lista.length; i++) {
            $("#salas").append("<div>Sala " + JSON.parse(lista[i]).nombre + " con " + JSON.parse(lista[i]).usuarios + " usuarios Online</div>");
        }
    }).fail(function (a, b, c) {
        console.log(a);
        console.log(b);
        console.log(c);
    });
}

function check() {
    var data = new FormData();
    sala1 = $("#sala").val();

    usuario = $("#usuario2").val();
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

            $("body").html('<input type="text" id="mensaje"/><input type="file" id="imagen"/><button onclick="mensaje()">Enviar</button><div id="mensajes"></div><div id="online"></div>');
            startEmotes();
            startImages();

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

function subirImagen(base64) {
        var data = new FormData();
        data.append("accion", "imagen");
        data.append("imagen", base64);
        data.append("sala", sala1);

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
        var lista = JSON.parse(result);
        if (lista.length > 0) {
            for (i = 0; i < lista.length ; i++) {
                var elemento = JSON.parse(lista[i]);

                switch(elemento.tipo) {
                    case "sistema":
                        switch (elemento.modo) {
                            case "online":
                                $("#online").append("<div id='" + elemento.info + "'>" + elemento.info + "</div><br>");
                                break;
                            case "offline":
                                $("#" + elemento.info).hide()
                                break;
                        }
                        break;

                    case "imagen":
                        elemento.mensaje = "<img class='mensaje' src='temp/" + sala1 + elemento.numero + ".jpg'>";
                        console.log(elemento.mensaje);
                        break;
                }

                $("#mensajes").append(elemento.mensaje + "<br>");
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
    window.addEventListener('beforeunload', function () {
        var data = new FormData();
        data.append("accion", "offline");
        data.append("usuario", usuario);
        data.append("sala", sala1);

        $.ajax({
            url: '/Api/Chat',
            processData: false,
            contentType: false,
            data: data,
            async: false,
            type: 'POST'
        }).done(function (result) {
            wait = false;
        }).fail(function (a, b, c) {
            console.log(a);
            console.log(b);
            console.log(c);
        });
    })
}

$(document).ready(function () {
    inicio();
})

function startImages(){
    File.prototype.convertToBase64 = function (callback) {
        var reader = new FileReader();
        reader.onload = function (e) {
            callback(e.target.result)
        };
        reader.onerror = function (e) {
            callback(null);
        };
        reader.readAsDataURL(this);
    };

    $("#imagen").on('change', function () {
        var selectedFile = this.files[0];
        selectedFile.convertToBase64(function (base64) {
            subirImagen(base64);
        })
    });
}