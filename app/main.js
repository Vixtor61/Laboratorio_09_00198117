const http = require('http'),
    fs = require('fs'),
    url = require('url'),
    {
        parse
    } = require('querystring');

mimeTypes = {
    "html": "text/html",
    "jpeg": "image/jpeg",
    "jpg": "image/jpeg",
    "png": "image/png",
    "js": "text/javascript",
    "css": "text/css"
};

http.createServer((req, res) => {
    //Control code.
    var pathname = url.parse(req.url).pathname;
    if (pathname == "/") {
        pathname = "../index.html";
    }
    if (pathname == "../index.html") {
        fs.readFile(pathname, (err, data) => {

            if (err) {
                console.log(err);
                // HTTP Status: 404 : NOT FOUND
                // En caso no haberse encontrado el archivo
                res.writeHead(404, {
                    'Content-Type': 'text/html'
                }); return res.end("404 Not Found");
            }
            // Pagina encontrada
            // HTTP Status: 200 : OK

            res.writeHead(200, {
                'Content-Type': mimeTypes[pathname.split('.').pop()] || 'text/html'
            });

            // Escribe el contenido de data en el body de la respuesta.
            res.write(data.toString());


            // Envia la respuesta
            return res.end();
        });
    }
    if (pathname.split(".")[1] == "css") {
        fs.readFile(".." + pathname, (err, data) => {

            if (err) {
                console.log(err);
                res.writeHead(404, {
                    'Content-Type': 'text/html'
                }); return res.end("404 Not Found");
            }

            res.writeHead(200, {
                'Content-Type': mimeTypes[pathname.split('.').pop()] || 'text/css'
            });

            // Escribe el contenido de data en el body de la respuesta.
            res.write(data.toString());


            // Envia la respuesta
            return res.end();
        });
    }

    if (req.method === 'POST' && pathname == "/cv") {
        collectRequestData(req, (err, result) => {

            if (err) {
                res.writeHead(400, {
                    'content-type': 'text/html'
                });
                return res.end('Bad Request');
            }

            fs.readFile("../templates/plantilla.html", function (err, data) {
                if (err) {
                    console.log(err);
                    // HTTP Status: 404 : NOT FOUND
                    // Content Type: text/plain
                    res.writeHead(404, {
                        'Content-Type': 'text/html'
                    });
                    return res.end("404 Not Found");
                }

                res.writeHead(200, {
                    'Content-Type': mimeTypes[pathname.split('.').pop()] || 'text/html'
                });

                //Variables de control.

                let parsedData = data.toString().replace('${dui}', result.dui)
                    .replace("${lastname}", result.lastname)
                    .replace("${firstname}", result.firstname)
                    .replace("${gender}", result.gender)
                    .replace("${civilStatus}", result.civilStatus)
                    .replace("${birth}", result.birth)
                    .replace("${exp}", result.exp)
                    .replace("${tel}", result.tel)
                    .replace("${std}", result.std);

                res.write(parsedData);
                return res.end();
            });

        });
    }


}).listen(8081);


function collectRequestData(request, callback) {

    const FORM_URLENCODED = 'application/x-www-form-urlencoded';
    if (request.headers['content-type'] === FORM_URLENCODED) {
        let body = '';
        // Evento de acumulacion de data.
        request.on('data', chunk => {
            body += chunk.toString();
        });
        // Data completamente recibida
        request.on('end', () => {
            callback(null, parse(body));
        });
    } else {
        callback({
            msg: `The content-type don't is equals to ${FORM_URLENCODED}`
        });
    }

}

/*
Preguntas

¿Cuál es la principal función del módulo HTTP?
    maneja las peticiones por el protocolo http
¿Cuál es la principal función del módulo FileSystem?
    se prepara para trabajar con el sistema de archivos de la computadora
¿Qué es un MIME type?
    es un sistema para indicar el comportamiento de una extension de archivo
¿Qué contienen las variables "req" y "res" en la creación del servidor?
    las peticiones y respuestas que procesa el servidor
¿La instrucción .listen(number) puede fallar? Justifique.
    si el puerto esta ocupado esta fallara
¿Por qué es útil la función "collectRequestData(...)"?
    para recolectar los pedacitos de datos :)
¿Para qué, además de conocer la dirección de la petición, es útil la variable "pathname"?
    para manejar las peticiones
¿Qué contine el parametro "data"?
    la informacion que le mandan al server
¿Cuál es la diferencia entre brindar una respuesta HTML y brindar una CSS?
    en como la intrepetara el browser
¿Qué contiene la variable "result"?
    la data que se extrajo de la peticion
¿Por qué con la variable "data" se debe aplicarse el metodo toString()? Justifique.
    para poderla mandar como string al resultado
¿Hay diferencia al quitar el control de peticiones para hojas CSS? Si sucedió algo distinto justifique por qué.
    se muestras mal la pagina
¿Se puede inciar el servidor (node main.js) en cualquier sitio del proyecto? Cualquier respuesta justifique.
    se puede gracias al pathname
Con sus palabras, ¿Por qué es importante aprender Node.js sin el uso de frameworks a pesar que estos facilitan el manejo de API's?
    para obtener el entendimiento de como funciona el backend
    y asi tener mayor facilidad para trabajar en frameworks

*/
