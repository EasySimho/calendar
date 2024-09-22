import React, { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import axios from 'axios';
import 'react-calendar/dist/Calendar.css';
import './CustomCalendar.css';
import Login from './Login';
import Register from './Register';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faCheck} from '@fortawesome/free-solid-svg-icons';

function CalendarView() {
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [taskTitle, setTaskTitle] = useState('');
  const [pendingTasks, setPendingTasks] = useState([]);
  const [acceptedTasks, setAcceptedTasks] = useState([]);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (!token) return;

    const fetchEvents = async () => {
      try {
        const response = await axios.get('http://localhost:5000/events', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setEvents(response.data);
      } catch (error) {
        console.error('Errore durante il recupero degli eventi:', error);
      }
    };

    fetchEvents();
    fetchTasks();
  }, [token]);

  const fetchTasks = async () => {
    try {
      const response = await axios.get('http://localhost:5000/tasks', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const pending = response.data.filter(task => task.status === 'pending');
      const accepted = response.data.filter(task => task.status === 'accepted');
      setPendingTasks(pending);
      setAcceptedTasks(accepted);
    } catch (error) {
      console.error('Errore durante il recupero delle attività pendenti:', error);
    }
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const handleTaskSubmit = async () => {
    const formattedDate = selectedDate.toISOString().split('T')[0];

    if (!token) {
      console.error('Token non disponibile');
      return;
    }

    try {
      await axios.post('http://localhost:5000/tasks', {
        date: formattedDate,
        title: taskTitle,
        status: 'pending'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTaskTitle('');
      fetchTasks(); // Ricarica le tasks dopo l'aggiunta
      alert('Attività aggiunta con successo');
    } catch (error) {
      console.error('Errore durante l\'aggiunta dell\'attività:', error);
    }
  };

  const acceptTask = async (taskId) => {
    try {
      await axios.put(`http://localhost:5000/tasks/${taskId}/accept`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTasks(); // Ricarica le tasks dopo l'accettazione
      alert('Task accettato con successo');
    } catch (error) {
      console.error('Errore durante l\'accettazione della task:', error);
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await axios.delete(`http://localhost:5000/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTasks(); // Ricarica le tasks dopo la cancellazione
      alert('Task cancellato con successo');
    } catch (error) {
      console.error('Errore durante la cancellazione della task:', error);
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
      <div className="calendar-container">
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
    <div className="calendar-container">
      <h2 className='calendar-title'>Calendario Condiviso</h2>
      <br />
      <Calendar
        onChange={handleDateChange}
        value={selectedDate}
        tileClassName={tileClassName}
      />
      <div className="calendar-details">
        <h3 className='date-title'>{selectedDate.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'short' })
          .charAt(0).toUpperCase() +
          selectedDate.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'short' }).slice(1)}</h3>
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
              <li key={task.id} className="task-item">
                {task.title} (Pending)
                <button className='pending-buttons' onClick={() => acceptTask(task.id)}><FontAwesomeIcon icon={faCheck} /></button>
                <button className='pending-buttons' onClick={() => deleteTask(task.id)}><FontAwesomeIcon icon={faTrash} /></button>
              </li>
            ))}
        </ul>
        <h3>Accepted Tasks</h3>
        <ul>
          {acceptedTasks
            .filter(task => task.date === selectedDate.toISOString().split('T')[0])
            .map(task => (
              <li key={task.id} className="task-item">
                {task.title}
                <button className="task-buttons" onClick={() => deleteTask(task.id)}>X</button>
              </li>
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