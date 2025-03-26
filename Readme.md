# A project for Learning Backend

## To-Do List
- [ ] Replace the code examples with my examples in the basic structre.
- [ ] Give the arcitectures link of their own.
- [x] Set up the project structure

## Table of Contents

1. [Target](#target)
2. [Learning from](#learning-from)
3. [What is Backend](#what-is-backend)
4. [Key Components of a Backend](#key-components-of-a-backend)
5. [Basic Structure of a Backend Code](#basic-structure-of-a-backend-code)
6. [Different Types of Backend Architecture](#different-types-of-backend-architecture)
7. [Study Resources](#study-resources)

## Target
- I should be able to review and understand the concepts I learned while making of this project, whenever I/Anyone comes to this repo in future.
- A way to keep track of my progress.

## Learning from

### Chai aur Code

-[Youtube](https://www.youtube.com/playlist?list=PLu71SKxNbfoBGh_8p_NS-ZAh6v7HhYqHW)

-[Git Repo](https://github.com/hiteshchoudhary/chai-backend)

-[Modeling for this repo](https://app.eraser.io/workspace/YtPqZ1VogxGy1jzIDkzj)

## What is Backend
- The backend is the part of a software application that runs on a server and handles the logic, database interactions, authentication, and other core functions. It is responsible for processing requests from the frontend (what users see and interact with) and sending back the required data.
- ![image](https://github.com/user-attachments/assets/4f285d7d-b562-433f-8a35-0ed88c1f9198)

[⬆ Back to Top](#table-of-contents)

  
## Key Components of A Backend

- **Server** - The machine/cloud service where the backend code runs. (This can be also your computer)

- **Databases** - Stores and manages data (e.g., MySQL, PostgreSQL, MongoDB). (I used mongoDB in this project)

- **APIs (Application Programming Interfaces)** - Define how the frontend communicates with the backend. (Just like a **waiter** in a restaraunt where **frontend** is the ***menu*** and the **backend** is the ***kitchen***)

  - An **API endpoint** is a URL that allows communication between a client (frontend) and a server (backend).
  - For example, if you want to get weather data, you might call this API URL:
  - ```javaScript
    fetch("https://api.openweathermap.org/data/2.5/weather?q=London&appid=YOUR_API_KEY")
    .then(response => response.json())
    .then(data => console.log(data));
  - #### Here
    - `https://api.openweathermap.org` → The base URL (server address).
    - `/data/2.5/weather` → The specific API endpoint for weather data.
    - `?q=London&appid=YOUR_API_KEY` → Query parameters (input) to specify the city and API key.
  
- **Authentication & Authorization** – Manages user logins and permissions using tokens and cookies(e.g., JWT, OAuth). (JWT is used in this project)
  
- **Business Logic** – Handles how the app processes data (e.g., calculating prices in an e-commerce site).

[⬆ Back to Top](#table-of-contents)


## Basic Structure of a Backend Code 

![image](https://github.com/user-attachments/assets/b0671121-dcb9-4334-9b94-a8c52985de08)

Your backend project is like a **restaurant**, where each folder plays a specific role. Let's break it down!  

### **1️⃣ `controllers/` → The Chef 👨‍🍳**  
This folder contains functions that handle requests, just like a chef prepares food based on an order.  

#### 💡 Example:  
- You (customer) order a pizza.  
- The **chef (controller)** prepares the pizza and gives it to the waiter.  
- The waiter then serves the pizza to you.  

🗘️ **Code Example (`orderController.js`)**  
```js
exports.getPizza = (req, res) => {
  res.send("Here is your pizza 🍕");
};
```

### **2️⃣ `db/` → The Restaurant’s Storage Room 🛄**  
This folder manages the database, like a storage room where ingredients (data) are kept.  

#### 💡 Example:  
- The kitchen (backend) needs cheese, dough, and sauce.  
- It fetches these from the **storage room (database)**.  

🗘️ **Code Example (`dbConnect.js`)**  
```js
const mongoose = require("mongoose");
mongoose.connect(process.env.MONGO_URI);
```

### **3️⃣ `middlewares/` → The Security Guard 🚔**  
Middleware acts like a restaurant’s security, checking customers before they enter.  

#### 💡 Example:  
- A guard at the restaurant **checks if you have a reservation** before letting you in.  
- Similarly, authentication middleware **checks if a user is logged in** before accessing certain data.  

🗘️ **Code Example (`authMiddleware.js`)**  
```js
module.exports = (req, res, next) => {
  if (!req.headers.authorization) return res.status(401).json({ error: "Unauthorized" });
  next();
};
```

### **4️⃣ `models/` → The Menu 📜**  
This folder defines how data is structured, just like a restaurant’s menu defines available dishes.  

#### 💡 Example:  
- The menu lists **what items are available** (Pizza, Burger, Pasta).  
- The database model defines **what data is stored** (User, Product, Order).  

🗘️ **Code Example (`userModel.js`)**  
```js
const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({ name: String, email: String });
module.exports = mongoose.model("User", userSchema);
```

### **5️⃣ `routes/` → The Waiter 🧍‍🍽️**  
Routes act like a waiter who takes orders and delivers them to the kitchen.  

#### 💡 Example:  
- You tell the **waiter (route)** you want a pizza.  
- The waiter goes to the **chef (controller)** and returns with the food.  

🗘️ **Code Example (`userRoutes.js`)**  
```js
const express = require("express");
const router = express.Router();
const { getPizza } = require("../controllers/orderController");

router.get("/pizza", getPizza);
module.exports = router;
```

### **6️⃣ `utils/` → Kitchen Gadgets 🍽️**  
This folder contains helper functions, like kitchen tools (knives, ovens) that assist in cooking.  

#### 💡 Example:  
- A **blender** helps make a smoothie.  
- A **utility function** helps in hashing passwords.  

🗘️ **Code Example (`hashPassword.js`)**  
```js
const bcrypt = require("bcryptjs");
module.exports = (password) => bcrypt.hashSync(password, 10);
```

### **7️⃣ `app.js` → The Restaurant’s Kitchen 🎩**  
This file initializes the backend, just like a kitchen starts preparing meals when the restaurant opens.  

🗘️ **Code Example (`app.js`)**  
```js
const express = require("express");
const app = express();

app.use(express.json()); // Allows serving food (data) in a proper format
module.exports = app;
```

### **8️⃣ `index.js` → The Restaurant’s Front Door 🚪**  
This file starts the backend, just like unlocking the restaurant doors when it’s ready to serve customers.  

💡 **Example:**  
- The restaurant **opens at 10 AM** → The backend starts on `port 5000`.  

🗘️ **Code Example (`index.js`)**  
```js
const app = require("./app");
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
```

[⬆ Back to Top](#table-of-contents)

## Different types of backend architecture

- This project uses a well-structured MVC (Model-View-Controller) architecture.
- While making this project I also didn't know that there are other ways to write a backend.
- I'll provide basic overview of the other models but if you want to know about other types of models. Explore the links below...
  
- **PS -> Ignore these sturctures for now if you are new to backend.**

### **1️⃣ Monolithic Architecture 🏠**
Everything (frontend, backend, database) is part of a **single codebase**.

**💡 Example:** A traditional restaurant where everything is handled in one kitchen.


### **2️⃣ Microservices Architecture ⚙️**
The application is divided into **small, independent services**, each handling a specific function.

**💡 Example:** A restaurant chain where each kitchen specializes in a dish (e.g., one for pizza, one for sushi).


### **3️⃣ Serverless Architecture ☁️**
Applications run on **cloud-based functions**, eliminating the need for managing servers.

**💡 Example:** A food delivery app that **outsources** cooking to various cloud kitchens.


### **4️⃣ Event-Driven Architecture 🔄**
The system reacts to **events** instead of making direct requests.

**💡 Example:** A self-service buffet where customers **pick food when available** instead of ordering.


### **5️⃣ Layered Architecture 🏗️**
The application is divided into layers:  
- **Presentation Layer** (UI)  
- **Business Logic Layer** (Processing)  
- **Data Access Layer** (Database)  

**💡 Example:** A corporate office where tasks are **delegated in layers** (Reception → Manager → Worker).

### ** 6️⃣ MVC Architecture (Model-View-Controller) 🏛️**
Represents data and business logic.
- Handles database interactions.
- It is used in this project.
- 
**Example:** A restaurant's kitchen preparing food based on orders

[⬆ Back to Top](#table-of-contents)

## Study Resources
Here are some great links to study these architectures in detail:  
- [Microservices - GeekForGeeks](https://www.geeksforgeeks.org/microservices/)
- [Serverless Architecture - GeekForGeeks](https://www.geeksforgeeks.org/serverless-architectures/)  
- [Event-Driven Systems - IBM](https://www.ibm.com/cloud/learn/event-driven-architecture)  
- [Layered Architecture - Waterloo pdf](https://cs.uwaterloo.ca/~m2nagapp/courses/CS446/1195/Arch_Design_Activity/Layered.pdf)
- [Monolithic Architecture - GeekForGeeks](https://www.geeksforgeeks.org/monolithic-architecture-system-design/)
- [Model-View-Controller - Tutorial Point](https://www.tutorialspoint.com/mvc_framework/mvc_framework_introduction.htm)

[⬆ Back to Top](#table-of-contents)









  
    


