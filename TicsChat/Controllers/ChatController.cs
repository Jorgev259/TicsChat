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
            var collection = db.GetCollection<BsonDocument>("mensajes");

            switch (Request["accion"])
            {
                case "mensaje":
                    var filter = new BsonDocument();
                    var cursor = collection.Find(filter).ToList();

                    var num = cursor.Count() + 1;

                    var documento = new BsonDocument
                    {
                        { "mensaje", Request["mensaje"] },
                        {"numero", num },
                    };

                    collection.InsertOne(documento);
                    break;

                case "refresh":
                    var mensajes = collection.Find(new BsonDocument()).ToList();

                    BsonDocument mensaje = new BsonDocument();
                    List <string> lista = new List<string>();

                    foreach (var mensajeLista in mensajes)
                    {
                        mensaje = new BsonDocument();
                        var numero = mensajeLista["numero"].ToString();
                        if (numero != Request["ultimoMensaje"])
                        {
                            mensaje.Add("mensaje", (mensajeLista["mensaje"].ToString()));
                            mensaje.Add("id", (mensajeLista["numero"].ToString()));
                        }
 
                        lista.Add(mensaje.ToJson());
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
