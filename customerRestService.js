var http = require("http");
var port = require("./serverConfig");
var customerService = require("./customerService");
const customer = new customerService();
const server = http.createServer((req,res) =>{      
   
    let method = req.method;
    let url = req.url;
    if(method == "POST" && url == "/customers/v0")
    {
        customer.createCustomer(req, res);
    }
    else if(method == "GET" && url == "/customers/v0")
    {
        customer.findAllCustomers(req, res);
    }
    else if(method == "GET" && url.includes("/customers/v0?id="))
    {
        customer.findCustomerById(req, res);
    }
    else if(method == "PUT" && url.includes("/customers/v0?id="))
    {
        customer.updateCustomerById(req, res);
    }
    else if(method == "DELETE" && url.includes("/customers/v0?id="))
    {
        customer.deleteCustomerById(req, res);
    }
    else
    {
        customer.invalidURL(res);
    }
});

server.listen(port, ()=>{
    console.log(`listening on port ${port}...`);
});