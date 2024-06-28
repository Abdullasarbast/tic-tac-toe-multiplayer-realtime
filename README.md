# Online Multiplayer Tic-Tac-Toe

Welcome to the Online Multiplayer Tic-Tac-Toe game! This game allows users to play Tic-Tac-Toe with others in real-time, ensuring persistent sessions using socket.io.

## Features

- **Real-time Multiplayer**: Play Tic-Tac-Toe online with players.
- **Game History**: Track your game history including wins, draws, and losses.
- **Time Tracker**: Each player must make a move within a specific time period or they lose the game.
- **Join or Leave Games**: Users can join ongoing games or leave at any time.

## Server-Side Handling

All core functionalities are managed on the server to ensure smooth gameplay and data persistence.

- **User Authentication**:

  - Managed by the server to ensure secure sign-up and sign-in processes.

- **Real-time Game Management**:

  - The server handles the creation, joining, and leaving of game sessions.
  - Game states are stored on the server to allow for real-time updates and synchronization between players.

- **Game History Tracking**:

  - Each player's game history (wins, draws, losses) is stored on the server.
  - The server provides endpoints to retrieve and display this information to the user.

- **Time Tracker**:
  - The server enforces the move time limit. timer handle it in server for persistent.
  - If a player does not make a move within the period time, the server automatically declares the other player as the winner.

## Installation

### Prerequisites

- Node.js and npm installed.
- MySQL database set up.

### Steps

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/noteapp.git
   cd TicTacToeMultiplayerRealTime
   ```

2. **Install backend dependencies**

   ```bash
   cd backend
   yarn install
   ```

3. **Set up the database**

   - Create a MySQL database schema name it (ticktacktoe) and update the Knex configuration in `knexfile.js`.
   - use username and password your database
   - Run migrations to set up tables:

   ```bash
   npx knex migrate:latest
   ```

4. **Start the backend server**

   ```bash
   npm run dev
   ```

5. **Install frontend dependencies**

   ```bash
   cd ../frontend
   yarn install
   ```

6. **Start the frontend development server**
   ```bash
   npm run dev
   ```

# Here sample video for my project:

[Watch the video](https://drive.google.com/file/d/1wqQ_YeRi_4txxLB470hielZ7nI9blb3j/view?usp=sharing)

# Here are some images from my project:

# Login page

![Image 1](https://github.com/roodyridar2/TicTacToeMultiplayerRealTime/raw/main/images/1.png)

# Search for player

![Image 2](https://github.com/roodyridar2/TicTacToeMultiplayerRealTime/raw/main/images/2.png)

# if user leave the game

![Image 3](https://github.com/roodyridar2/TicTacToeMultiplayerRealTime/raw/main/images/3.png)
![Image 4](https://github.com/roodyridar2/TicTacToeMultiplayerRealTime/raw/main/images/4.png)

# if run out of time

![Image 5](https://github.com/roodyridar2/TicTacToeMultiplayerRealTime/raw/main/images/5.png)
