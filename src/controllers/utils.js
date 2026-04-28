
/*
    Print log info: to get in the console what is happening in the backend
    - boolean param: when true show all parameters passed by the url
    - boolean cookie: when true shows all cookies of the view
*/
function printLog(req, param, cookie){
    console.log("\n-------");
    console.log("Method: ", req.method);
    console.log("From: ", req.originalUrl);
    if(param){
        console.log("Parameters: ");
        console.log("\t"+JSON.stringify(req.params));
    }
    if(cookie){
        console.log("Cookies: ");
        console.log("\t"+JSON.stringify(req.cookies));
    }
    console.log("Info received: ", JSON.stringify(req.body));
    console.log("-------\n");
}

function info(msg){
    console.log("[INFO] -> ", msg);
}

// Para escapar caracteres especiales
function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

module.exports = {
    printLog,
    info,
    escapeRegExp
}