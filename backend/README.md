# Node.js Backend

## Overview

Skygeni backend

## Project Structure

```
node-backend-boilerplate
├── src
│   ├── app.js
│   ├── routes
│   │   └── index.js
├── package.json
├── .env
├── .gitignore
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm (Node package manager)

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```
   cd node-backend-boilerplate
   ```
3. Install the dependencies:
   ```
   npm install
   ```

### Configuration

- Create a `.env` file in the root directory and add your environment variables. Example:
  ```
  PORT=4000
  ```

### Running the Application

To start the application, run:

```
npm start
```

The server will start on the port specified in the `.env` file (default is 3000).

### API Endpoints

- The application has various endpoints defined in the `src/routes/index.js` file. You can modify or add new routes as needed.

### Contributing

Feel free to fork the repository and submit pull requests for any improvements or features.

### License

This project is licensed under the MIT License.
