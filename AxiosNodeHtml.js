const express = require('express');
const axios = require('axios');
const app = express();
const multer = require("multer");
const path = require("path");
var bodyParser = require('body-parser');
const { clearConfigCache } = require("prettier");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/uploaded_img");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });
const base_url = "http://localhost:3000";
//const base_url = "http://  Ruk-Com";

app.set("views", path.join(__dirname, "/public/views"));
app.set("view engine", "ejs");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(__dirname + "/public"));



const authenticateUser = (req, res, next) => {
    if (req.cookies && req.cookies.userSession) {
      next();
    } else {
      res.redirect("/");
    }
  };

app.get("/", (req, res) => {
    res.render("home"); 
});

app.get("/home", (req, res) => {
    res.render("home"); 
});

//------------------------------------------------------------------------------------------

//register

app.get("/register", (req, res) => {
    try {
      res.render("Register");
    } catch (err) {
      console.error(err);
      res.status(500).send("error");
      res.redirect("/");
    }
  });
  
  app.post("/register", async (req, res) => {
    try {
      const data = {
        customer_username: req.body.customer_username,
        customer_password: req.body.customer_password,
        Address: req.body.Address,
        email: req.body.email,
      };
      console.log(data);
      await axios.post(base_url+"/register", data);
  
      res.redirect("/login");
    } catch (err) {
      console.error(err);
      res.status(500).send("error in /register");
    }
  });
//------------------------------------------------------------------------------------------

  //login
app.get("/login", (req, res) => {
    try {
      res.render("login");
    } catch (err) {
      console.error(err);
      res.status(500).send("error");
    }
  });

  app.post("/login", async (req, res) => {
    try {
      // รับค่าจาก req.body
      const username = req.body.username;
      const password = req.body.password;

      // สร้างข้อมูลสำหรับการตรวจสอบ
      const data_customer = {
        customer_username: username,
        customer_password: password,
      };

      const data_employee = {
        employee_username: username,
        employee_password: password,
      };

      // ตรวจสอบข้อมูลจาก Customer
      const customerResponse = await axios.post(base_url + "/menu_customer", data_customer);
      
      if (customerResponse.data.message === true) {
        res.cookie("userSession", customerResponse.data.Customer.customer_username, {
          httpOnly: true,
        });
        console.log(customerResponse.data.Customer.customer_username, "Login Successful (Customer)");

        req.session.user = {
          customer_id: customerResponse.data.Customer.customer_id,
          customer_username: customerResponse.data.Customer.customer_username,
        };

        return res.redirect("menu_customer");
      }

//---------------------------------------------------------------------------------------


      // ตรวจสอบข้อมูลจาก Employee
      const employeeResponse = await axios.post(base_url + "/menu_employee", data_employee);

      if (employeeResponse.data.message === true) {
        res.cookie("userSession", employeeResponse.data.Employee.employee_username, {
          httpOnly: true,
        });
        console.log(employeeResponse.data.Employee.employee_username, "Login Successful (Employee)");

        req.session.user = {
          employee_id: employeeResponse.data.Employee.employee_id,
          employee_username: employeeResponse.data.Employee.employee_username,
        };

        return res.redirect("menu_employee");
      }

      // ถ้าไม่มีในทั้งสอง table
      console.log("User Not Found");
      res.redirect("login");

    } catch (err) {
      console.error(err);
      res.status(500).send("Error");
    }
  });




//---------------------------------------------------------------------------------------

  //menu for customer
  app.get("/menu_customer",  async (req, res) => {
    try {
      const response = await axios.get(base_url + "/cake");
      console.log(response.data); // ตรวจสอบข้อมูลที่ได้
      res.render("menu_customer", { cakes: response.data});
    } catch (err) {
      console.error("Error fetching cakes:", err.message); // แสดงข้อความข้อผิดพลาด
      res.status(500).send("Error fetching cakes");
    }
  });


//------------------------------------------------------------------------------------------

app.get("/menu_employee",  async (req, res) => {
  try {
    const response = await axios.get(base_url + "/cake");
    console.log(response.data); // ตรวจสอบข้อมูลที่ได้
    res.render("menu_employee", { cakes: response.data});
  } catch (err) {
    console.error("Error fetching cakes:", err.message); // แสดงข้อความข้อผิดพลาด
    res.status(500).send("Error fetching cakes");
  }
});




//------------------------------------------------------------------------------------------

// Add menu
app.get("/Add_menu", async (req, res) => {
  try {
    res.render("Add_menu");
  } catch (err) {
    console.error(err);
    res.status(500).send("error");
  }
});

app.post("/Add_menu",upload.single("img"),async (req, res) => {
  try {
    const data = {
      cake_name: req.body.cake_name,
      cake_price: req.body.cake_price,
      cake_size: req.body.cake_size,
      img: req.file.filename,
    };
    await axios.post(base_url + "/Cakes", data);
    res.redirect("/menu_employee");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error");
  }
}
);

app.get("/delete/:id", async (req, res) => {
  try {
    await axios.delete(base_url + "/Cake/" + req.params.id);
    res.redirect("/menu_employee");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error");
  }
});

//------------------------------------------------------------------------------------------

//edit_menu
app.get("/edit_menu", async (req, res) => {
  try {
    res.render("edit_menu");
  } catch (err) {
    console.error(err);
    res.status(500).send("error");
  }
});

app.get("/edit_menu/:id", async (req, res) => {
  try {
    const response = await axios.get(base_url + "/Cake/" + req.params.id);
    res.render("edit_menu", { Cake: response.data });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error");
  }
});

app.post("/edit_menu/:id",upload.single("img"),async (req, res) => {
  try {
    const data = {
      cake_name: req.body.cake_name,
      cake_price: req.body.cake_price,
      cake_size: req.body.cake_size,
      img: req.file.filename,
    };
    await axios.put(base_url + "/Cake/" + req.params.id, data);
    return res.redirect("/menu_employee"); // เมื่ออัปเดตเสร็จแล้วให้ redirect ไปยังหน้า "/item"
  } catch (err) {
    console.error(err);
    res.status(500).send("Error");
  }
}
);

//------------------------------------------------------------------------------------------

// Add_employee

app.get("/Add_employee", async (req, res) => {
  try {
    res.render("Add_employee");
  } catch (err) {
    console.error(err);
    res.status(500).send("error");
  }
});

app.post("/Add_employee",upload.single("img"),async (req, res) => {
  try {
    const data = {
      employee_username: req.body.employee_username,
      employee_password: req.body.employee_password,
      phone: req.body.phone,
    };
    await axios.post(base_url + "/Employees", data);
    res.redirect("/manage_employee");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error");
  }
}
);

//------------------------------------------------------------------------------------------

// manage_employee

app.get("/manage_employee",  async (req, res) => {
  try {
    const response = await axios.get(base_url + "/Employee");
    console.log(response.data); // ตรวจสอบข้อมูลที่ได้
    res.render("manage_employee", { Employee: response.data});
  } catch (err) {
    console.error("Error fetching employee:", err.message); // แสดงข้อความข้อผิดพลาด
    res.status(500).send("Error fetching employee");
  }
});


app.get("/delete_employee/:id", async (req, res) => {
  try {
    await axios.delete(base_url + "/Employee/" + req.params.id);
    res.redirect("/manage_employee");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error");
  }
});


//------------------------------------------------------------------------------------------

// manage_customer

app.get("/manage_customer", async (req, res) => {
  try {
    const response = await axios.get(base_url + "/Customer");
    console.log(response.data);  // ตรวจสอบข้อมูลที่ได้
    res.render("manage_customer", { Customer: response.data });
  } catch (err) {
    console.error("Error fetching customer:", err.message);
    res.status(500).send("Error fetching customer");
  }
});

app.get("/delete_customer/:id", async (req, res) => {
  try {
    await axios.delete(base_url + "/Customer/" + req.params.id);
    res.redirect("/manage_customer");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error");
  }
});
//------------------------------------------------------------------------------------------

// edit_employee
app.get("/edit_employee", async (req, res) => {
  try {
    res.render("edit_employee");
  } catch (err) {
    console.error(err);
    res.status(500).send("error");
  }
});

app.get("/edit_employee/:id", async (req, res) => {
  try {
    const response = await axios.get(base_url + "/Employee/" + req.params.id);
    res.render("edit_employee", { Employee: response.data });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error");
  }
});

app.post("/edit_employee/:id",async (req, res) => {
  try {
    const dataEmployee = {
      employee_username: req.body.employee_username,
      employee_password: req.body.employee_password,
      phone: req.body.phone,
    };
    console.log(dataEmployee )
    await axios.put(base_url+"/Employee/"+req.params.id,dataEmployee);
    
    return res.redirect("/manage_employee");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error");
  }
}
);


//------------------------------------------------------------------------------------------

// edit_customer
app.get("/edit_customer", async (req, res) => {
  try {
    res.render("edit_customer");
  } catch (err) {
    console.error(err);
    res.status(500).send("error");
  }
});

app.get("/edit_customer/:id", async (req, res) => {
  try {
    const response = await axios.get(base_url + "/Customer/" + req.params.id);
    res.render("edit_customer", { Customer: response.data});
  } catch (err) {
    console.error(err);
    res.status(500).send("Error");
  }
});

app.post("/edit_customer/:id",async (req, res) => {
  try {
    const data = {
      customer_username: req.body.customer_username,
      customer_password: req.body.customer_password,
      Address: req.body.Address,
      email: req.body.email,
    };
    console.log(data)
    await axios.put(base_url+"/Customer/"+req.params.id,data);
    
    return res.redirect("/manage_customer");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error");
  }
}
);

//------------------------------------------------------------------------------------------

// about
app.get("/about", async (req, res) => {
  try {
    const response = await axios.get(base_url + "/Employee/");
    res.render("about", { Employee: response.data });
  } catch (err) {
    console.error(err);
    res.status(500).send("error");
  }
});

app.listen(5500, () => {
    console.log("server started on port 5500");
});

  


