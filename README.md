# React ChatGPT Clone using Fullmetal

The ChatGPT clone uses Fullmetal and express.js to run a server requesting client-side requests.

## Installation

Clone the repository to your local machine, then create the `.env` file in the root directory of the project and create the `FULLMETAL_API_KEY` variable in it, and pass your private FULLMETAL key from your account at https://app.fullmetal.ai/

Install dependencies.
```bash
  npm i
```
Start frontend server with vite.
```bash
  npm run dev:frontend
```
Start backend server with nodemon.
```bash
  npm run dev:backend
```

To use the app with https server, you need to configure the key in vite.config.js file and use following command
```bash
  npm run dev:secure:backend
```

For this chat app, we have used [socket.io](https://www.npmjs.com/package/socket.io) in backend and [socket.io-client](https://www.npmjs.com/package/socket.io-client) on frontend. You need to configure the /socket.io/ proxy in vite.config.js file.

# Credits
The original [React-chatGPT-Clone](https://github.com/kas1qqqq/react-chatgpt-clone) was created by [kas1qqqq](https://github.com/kas1qqqq)
