import $wBmGR$http from "http";


const $6a767cd48bfac32e$var$PORT = process.env.PORT || 3000;
const $6a767cd48bfac32e$var$server = (0, $wBmGR$http).createServer((req, res)=>{
    res.writeHead(200);
    res.end("Server is running!");
});
$6a767cd48bfac32e$var$server.listen($6a767cd48bfac32e$var$PORT, ()=>{
    console.log("Listening on port", $6a767cd48bfac32e$var$PORT);
});


//# sourceMappingURL=index.js.map
