# ReFI (Resource Finder)

ReFI is a search platform designed to help developers discover creative resources including frameworks, libraries, engines, tools, and programming languages. It leverages OpenAI's API to process natural language queries to find a match in its (relational) database. Developed in plain Node.js (without Express), the backend is designed with RESTful microservices that are stateless, follow clear naming conventions, and support pagination for data retrieval. Each microservice is structured into routing, controllers, and models, ensuring modularity and maintainability while enforcing CORS to enable secure cross-service communication.

## **Main Features**  
- **Guest and Personalized Searches**: Supports **guest searches**, limited by a shared API key, while also allowing users to use their **own OpenAI API key** for personalized requests.  
- **Security-Focused**: Implements **SQL injection protection, XSS mitigation, and encrypted cookie-based authentication & verification** to ensure user data remains safe. Authentication is verified through secure encrypted tokens  
- **Hashed Passwords**: All user passwords are securely **hashed** before being stored in the database.  
- **Pagination & Consistent Naming**: Supports **pagination** for efficient data retrieval and follows clear **RESTful conventions** for API endpoints.  
- **Cross-Origin Communication**: Uses **CORS** to enable secure interactions between microservices.  

## Architecture  
See C4 diagrams in [Project Architecture](arhitectura%20proiect%20(diag.%20C4)/).

### **Microservices**
- **admin-management Microservice**: Manages the entire database (both stored resources and users).  
- **queryHandler Microservice**: Provides database searches based on with OpenAI NLP.  
- **userProfileHandler Microservice**: Handles user profile preference updates.
- **user-auth Microservice**: Handles authentication, logout, signup and user verification. 

### **Databases**
- **ReFI Database**: Stores information about resources.  
- **ReFI Users Database**: Stores users credentials.  

## **Pages Preview**  

### **Homepage**
![Homepage Screenshot](Image%20sample%201.jpg)

### **Admin Panel Page**
![AdminPanel Screenshot](Image%20sample%202.jpg)

### **User Preferences**
![UserPreferences Screenshot](Image%20sample%203.jpg)
