# Multiplayer Crypto Bingo Game 🎲  

A real-time multiplayer Bingo game built with React, TypeScript, and Socket.io, along with smart contracts driven by the Solana blockchain. featuring responsive design, single-player mode, and dynamic room management.  Smart Contract to managed payment and winner prizes.

## Features  

- **Multiplayer realtime**: Play with friends in real-time.
- **Dynamic Room Management**: Create or join rooms with unique room IDs.  
- **Responsive Design**: Fully optimized for mobile and desktop devices.  
- **Auto-play Functionality**: Automatically call Bingo numbers for a seamless experience.  
- **Real-Time Updates**: Instant updates for all players in a room.  
- **Winner Celebration**: Confetti for the winner and a message for other players.  
- **Solana program to manage prize pool**: curently available on Solana Devnet,

---

## Prerequisites

- **Solana testnet tokens to mint and play with**: inlcuding mint button for testnet USDC.
- **requires testnet SOL to launch smart contract and game**: host requies testnet SOL to launch a game.
Ensure you have the following installed:  
- [Node.js](https://nodejs.org/)
- [npm](https://www.npmjs.com/)  

---

## Getting Started  

### 1. Clone the Repository

```bash  
git clone https://github.com/your-username/bingo-game.git  
cd bingo-game
```  

### 2. Install Dependencies

Using `npm`:  

```bash  
npm install  
```  

### 3. Set Up Environment Variables

Create a `.env` file in the root directory and add the following:  

```bash  
VITE_SOCKET_URL=http://localhost:3001
VITE_SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/your-api-key
VITE_PROJECT_ID=reown-api-key
```  

---

## Running the App  

### Start app

```bash  
npm run dev  
```  

By default, the app will run at `http://localhost:5173`.

---

## Scripts  

- `npm run server`: Starts the Socket.io server.  
- `npm run dev`: Starts the development server for the client.  
- `npm run build`: Builds the React app for production.  

---

## Tech Stack  

- **Frontend**: React, TypeScript, CSS Modules  
- **Backend**: Node.js, Express, Socket.io  
- **Styling**: Tailwind CSS  
- **Reown appkit**: wallet connections and functionality
- **Blockchain**: Solana Devnet


---

## Roadmap  

## License  

This project is licensed under the [MIT License](LICENSE).  

---

## Contributing  

Contributions are welcome! Please open an issue or create a pull request for any suggestions or improvements.

---

## Contact
