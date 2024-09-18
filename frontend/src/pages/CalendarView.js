import React, { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import axios from 'axios';
import 'react-calendar/dist/Calendar.css';
import './CustomCalendar.css';
import Login from './Login';
import Register from './Register';


function CalendarView() {
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [taskTitle, setTaskTitle] = useState('');
  const [pendingTasks, setPendingTasks] = useState([]);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (!token) return;

    const fetchEvents = async () => {
      try {
        const response = await axios.get('http://localhost:5000/events', {
          headers: { Authorization: token }
        });
        setEvents(response.data);
      } catch (error) {
        console.error('Errore durante il recupero degli eventi:', error);
      }
    };

    const fetchPendingTasks = async () => {
      try {
        const response = await axios.get('http://localhost:5000/tasks', {
          headers: { Authorization: token }
        });
        setPendingTasks(response.data);
      } catch (error) {
        console.error('Errore durante il recupero delle attività pendenti:', error);
      }
    };

    fetchEvents();
    fetchPendingTasks();
  }, [token]);

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const handleTaskSubmit = async () => {
    const formattedDate = selectedDate.toISOString().split('T')[0];

    try {
      const checkResponse = await axios.post('http://localhost:5000/check-date', {
        date: formattedDate
      }, {
        headers: { Authorization: token }
      });

      if (!checkResponse.data.available) {
        alert('This day is already booked.');
        return;
      }

      const response = await axios.post('http://localhost:5000/tasks', {
        date: formattedDate,
        title: taskTitle,
        status: 'pending'
      }, {
        headers: { Authorization: token }
      });
      setPendingTasks([...pendingTasks, response.data]);
      setTaskTitle('');
    } catch (error) {
      console.error('Errore durante l\'aggiunta dell\'attività:', error);
    }
  };

  const tileClassName = ({ date, view }) => {
    if (view === 'month') {
      const formattedDate = date.toISOString().split('T')[0];
      if (events.find(event => event.date === formattedDate)) {
        return 'highlight';
      }
    }
    return null;
  };

  if (!token) {
    return (
      <div>
        <h2>Login</h2>
        <Login setToken={(token) => {
          localStorage.setItem('token', token);
          setToken(token);
        }} />
        <h2>Register</h2>
        <Register />
      </div>
    );
  }

  return (
    <div>
      <h2>Calendario Condiviso</h2>
      
      <Calendar
        onChange={handleDateChange}
        value={selectedDate}
        tileClassName={tileClassName}
      />
      <div className="calendar-details">
        <h3>{selectedDate.toDateString()}</h3>
        <ul>
          {events
            .filter(event => event.date === selectedDate.toISOString().split('T')[0])
            .map(event => (
              <li key={event.id}>{event.title}</li>
            ))}
        </ul>
        <h3>Pending Tasks</h3>
        <ul>
          {pendingTasks
            .filter(task => task.date === selectedDate.toISOString().split('T')[0])
            .map(task => (
              <li key={task.id}>{task.title} (Pending)</li>
            ))}
        </ul>
        <input
          type="text"
          value={taskTitle}
          onChange={(e) => setTaskTitle(e.target.value)}
          placeholder="Task Title"
        />
        <button onClick={handleTaskSubmit}>Aggiungi Attività</button>
      </div>
    </div>
  );
}

export default CalendarView;