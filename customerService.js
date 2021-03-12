const dbConfig = require("./dbconfig");
const errorHandler = require("./errorHandler");

class Customer
{
  dbConnection() {
    
    if (dbConfig && dbConfig.state === "authenticated") {
        console.log("Connection already exists");
        return;
    }
    dbConfig.connect(function(err) {
        if (err) {
            errorHandler(response, 500, "Error while creating the connection to database");
            return;
        }
        console.log("Connection established successfully with MySQL");
        return;
    });
  }
  async parseRequest(req, res)
  {
    return new Promise((resolve, reject) => {
    let reqData = '';
      req.on("error", err => {
        console.error(err);
        reject();
      })
      .on("data", chunk => {
        reqData += chunk
      })
      .on("end", () => {
        req.body = JSON.parse(reqData);
        resolve();
      })
    })
  }
  async createCustomer(req, res)
  {
    this.dbConnection();
      try{
        await this.parseRequest(req, res);
        let firstName = req.body.first_name;
        let lastName = req.body.last_name;
        dbConfig.query("INSERT into customer(firstName, lastName) VALUES(?, ?)", [firstName,lastName],function (error, results, fields) {
          if (error)
          {
            errorHandler(res, 400, "Error in creating customer");
          }
          res.writeHead(201, {"Content-Type": "text/plain"});
          res.write("New customer inserted");
          res.end();
        });
        
      }catch(err)
      {
        console.error(err);
        errorHandler(res, 400, "Error parsing the request Body");
        
      }
  };

  findAllCustomers(req, res)
  {
    this.dbConnection();
    try{
      
      dbConfig.query("SELECT * from customer", function(error, results, fields){
        if(error)
        {
          errorHandler(res, 400, "Error in reading from database");
        }
        res.writeHead(200, {"Content-Type": "application/json"});
        res.write(JSON.stringify(results));
        res.end();
      });
    }
    catch(err)
    {
      console.error(err);
      errorHandler(res, 400, "Error in fetching the customers");
      
    }      
  };

  invalidURL(res)
  {
    var response = "404 Not Found";
    res.writeHead(404, {"Content-Type": "text/plain"});
    res.write(response);
    res.end();
  }

  findCustomerById(req, res)
  {
    var x = req.url.split('?')[1];
    var value = x.split('=')[1];
    dbConfig.query("SELECT * from customer WHERE id = ?", value, function(error, results, fields){
      if(error)
      {
        errorHandler(res, 500, `Internal Server Error`);
      }
      if(results.length)
      {
        res.writeHead(200, {"Content-Type": "application/json"});
        res.write(JSON.stringify(results));
        res.end();
        return;
      }
      else  
        errorHandler(res, 400, `Customer with ID ${value} doesnot exist` );
    });
  };

  async updateCustomerById(req, res)
  {
    var x = req.url.split('?')[1];
    var value = x.split('=')[1];
    this.dbConnection();
    try{
      await this.parseRequest(req, res);
     
       dbConfig.query("SELECT * from customer where id= ?", value, function(error, results, fields){
        if(error)
        {
          errorHandler(res, 400, "Error in reading from database");
        }
        else if(results.length == 0)
        {
          errorHandler(res, 400, `No Customer with ID ${value} exist`);
          return;
        }
        const targetCustomer = results[0];
        targetCustomer.firstName = req.body.first_name || targetCustomer.firstName;
        targetCustomer.lastName = req.body.last_name || targetCustomer.lastName;
        dbConfig.query("UPDATE customer SET firstName = ? , lastName= ? WHERE id= ?", [targetCustomer.firstName, targetCustomer.lastName, value], function(errorInside, resultInside, fields){ 
          if(errorInside)
          {
            console.log("Here");
            errorHandler(res, 400, "Error updating database");
          }
          res.writeHead(200, {"Content-Type": "application/json"});
          res.write(JSON.stringify(targetCustomer));
          res.end();
        });

      });

    }catch(err)
    {
      console.error(err);
      errorHandler(res, 400, "Error in updating customer information");
      
    }  
  };

  deleteCustomerById(req, res)
  {
    var x = req.url.split('?')[1];
    var value = x.split('=')[1];
    this.dbConnection();
    dbConfig.query("SELECT * from customer where id= ?", value, function(error, results, fields){
      if(error)
      {
        errorHandler(res, 400, "Error in reading from database");
        return;
      }
      else if(results.length == 0)
      {
        errorHandler(res, 400, `Customer with ID ${value} not found`);
        return;
      }
      else
      {
        dbConfig.query("DELETE from customer where id= ?", value, function(errorInside, resultInside, fields)
        {
          if(errorInside)
          {
            errorHandler(res, 400, "Error in deleting the customer");
            return;
          }
          res.writeHead(200, {"Content-Type": "text/plain"});
          res.write(`Customer with ID ${value} deleted`);
          res.end();
        });

      }
    });
  };
}

module.exports = Customer