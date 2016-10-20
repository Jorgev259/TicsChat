using MongoDB.Bson;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Http;
using System.IO;
using System.Drawing;

namespace TicsChat.Controllers
{
    public class ChatController : ApiController
    {
       [HttpPost]
       public string Post()
        {
            string response = "";
            var Request = HttpContext.Current.Request;
            var client = new MongoClient("mongodb://localhost:27017");
            var db = client.GetDatabase("Chat");
            var collection = db.GetCollection<BsonDocument>("default"); ;
            var collectionUsuarios = db.GetCollection<BsonDocument>("default");

            if (Request["accion"] != "inicio")
            {                
                collection = db.GetCollection<BsonDocument>(Request["sala"]);
                collectionUsuarios = db.GetCollection<BsonDocument>(Request["sala"] + "Usuarios");
            }

            switch (Request["accion"])
            {
                case "inicio":
                    var listaColecciones = db.ListCollectionsAsync().Result.ToListAsync<BsonDocument>().Result;
                    List<String> listaC = new List<string>();

                    foreach(var item in listaColecciones)
                    {

                        if (item["name"].ToString().Contains("Usuarios") == false)
                        {
                            var Count = db.GetCollection<BsonDocument>(item["name"].ToString()).Find(new BsonDocument()).ToList().Count();

                            var documentoC = new BsonDocument
                            {
                                { "nombre", item["name"].ToString() },
                                { "usuarios", Count},
                            };

                            listaC.Add(documentoC.ToJson());
                        }
                    }
                    return listaC.ToJson();
                    break;

                case "mensaje":
                    var filter = new BsonDocument();
                    var cursor = collection.Find(filter).ToList();
                    var num = 0;

                    if (cursor.Count() > 0)
                    {
                        num = Convert.ToInt32(cursor[cursor.Count() - 1]["numero"].ToString());
                    }

                    var documento = new BsonDocument
                    {
                        { "mensaje", Request["mensaje"] },
                        { "numero", num + 1},
                        {"tipo", "usuario" }
                    };

                    collection.InsertOneAsync(documento);
                    break;

                case "imagen":
                    byte[] imageBytes = Convert.FromBase64String(base64String);
                    // Convert byte[] to Image
                    using (var ms = new MemoryStream(imageBytes, 0, imageBytes.Length))
                    {
                        Image image = Image.FromStream(ms, true);
                        return image;
                    }
                    break;

                case "join":                   
                    var mensajes = collection.Find(new BsonDocument()).ToList();
                    var usuarios = collectionUsuarios.Find(new BsonDocument()).ToList();

                    var existe = false;
                    foreach(var usuario in usuarios)
                    {
                        if(usuario["nombre"] == Request["usuario"])
                        {
                            existe = true;
                        }
                        usuario.Remove("_id");
                    }

                    if (existe == false)
                    {
                        var numero = "0";
                        if (mensajes.Count() > 0)
                        {
                            numero = mensajes[mensajes.Count() - 1]["numero"].ToString();
                        }

                        usuarios.Add(new BsonDocument { { "numero", numero } });

                        filter = new BsonDocument();
                        cursor = collection.Find(filter).ToList();
                        num = 0;

                        if (cursor.Count() > 0)
                        {
                            num = Convert.ToInt32(cursor[cursor.Count() - 1]["numero"].ToString());
                        }

                        documento = new BsonDocument
                        {
                            { "mensaje", "El usuario " + Request["usuario"] + " se ha unido a la sala" },
                            { "numero", num + 1},
                            {"tipo", "sistema" },
                            {"modo", "online" },
                            {"info", Request["usuario"] }
                        };

                        collection.InsertOneAsync(documento);
                        collectionUsuarios.InsertOneAsync(new BsonDocument { { "nombre", Request["usuario"] } });

                        return usuarios.ToJson();
                    }else
                    {
                        return "Login ya existe en esta sala";
                    }
                    break;

                case "offline":
                    var filtroOffline = Builders<BsonDocument>.Filter.Eq("nombre", Request["usuario"]);
                    collectionUsuarios.DeleteMany(filtroOffline);


                    filter = new BsonDocument();
                    cursor = collection.Find(filter).ToList();                    
                    num = 0;

                    if (cursor.Count() > 0)
                    {
                        num = Convert.ToInt32(cursor[cursor.Count() - 1]["numero"].ToString());
                    }

                    var cursorUsuarios = collectionUsuarios.Find(filter).ToList();
                    if (cursorUsuarios.Count() == 0)
                    {
                        db.DropCollectionAsync(Request["sala"]);
                        db.DropCollectionAsync(Request["sala"]+"Usuarios");
                    }
                    else
                    {

                        documento = new BsonDocument
                        {
                            { "mensaje", "El usuario " + Request["usuario"] + " se ha desconectado" },
                            { "numero", num + 1},
                            {"tipo", "sistema" },
                            {"modo", "offline" },
                            {"info", Request["usuario"] }
                        };

                        collection.InsertOneAsync(documento);
                    }

                    break;

                case "refresh":
                    mensajes = collection.Find(new BsonDocument()).ToList();

                    BsonDocument mensaje = new BsonDocument();
                    List <string> lista = new List<string>();

                    foreach (var mensajeLista in mensajes)
                    {
                        mensaje = new BsonDocument();
                        var numero = mensajeLista["numero"].ToString();
                        if (Convert.ToInt32(numero.ToString()) > Convert.ToInt32(Request["ultimoMensaje"].ToString()))
                        {
                            mensajeLista.Remove("_id");
                            lista.Add(mensajeLista.ToJson());
                        }
                     
                    }

                    return lista.ToJson();
                    break;
                default:
                    break;
            }
            return response;
        }
    }
}
