# Calendar Application

## Overview

This is a calendar application that allows users to manage their events and tasks. Users can register, log in, and view their personal, partner, and shared calendars. The application is built using React and communicates with a backend server to fetch and manage data.

## Features

- User Authentication (Login/Register)
- View and manage personal calendar
- View and manage partner calendar
- View and manage shared calendar
- Add, accept, and delete tasks
- Add and view events

## Technologies Used

- React
- Axios
- React Router
- Tailwind CSS
- FontAwesome
- Lucide React

## Getting Started

### Prerequisites

- Node.js
- npm or yarn

### Installation

1. Clone the repository:
   
    ```bash
    git clone https://github.com/easysimho/calendar.git
    cd calendar-app
2. Install dependencies

    ```bash
    npm install
    # or
    yarn install
3. Start the development server:
   ```bash
    npm start
    # or
    yarn start
    
4. Open your browser and navigate to http://localhost:3000.

### Project Structure

    src/
        components/: Reusable UI components
        pages/: Different pages of the application
        App.js: Main application component
        index.js: Entry point of the application

### Available Scripts

- npm start: Starts the development server
- npm build: Builds the app for production
- npm test: Runs the test suite
- npm eject: Ejects the app from Create React App configuration

### API Endpoints

- POST /login: User login
- POST /register: User registration
- GET /events: Fetch events
- POST /events: Add event
- GET /tasks: Fetch tasks
- POST /tasks: Add task
- PUT /tasks/:id/accept: Accept task
- DELETE /tasks/:id: Delete task
