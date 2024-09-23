import React, { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import axios from 'axios';
import 'react-calendar/dist/Calendar.css';
import './CustomCalendar.css';
import Login from './Login';
import Register from './Register';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faCheck, faPlus } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';

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
      fetchTasks();
      Swal.fire({
        title: 'Successo!',
        text: 'Attività aggiunta con successo',
        icon: 'success',
        confirmButtonText: 'OK'
      });
    } catch (error) {
      console.error('Errore durante l\'aggiunta dell\'attività:', error);
      Swal.fire({
        title: 'Errore!',
        text: 'Impossible aggiungere l\'attività. Riprova.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  };

  const acceptTask = async (taskId) => {
    try {
      await axios.put(`http://localhost:5000/tasks/${taskId}/accept`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTasks();
      Swal.fire({
        title: 'Successo!',
        text: 'Task accettato con successo',
        icon: 'success',
        confirmButtonText: 'OK'
      });
    } catch (error) {
      console.error('Errore durante l\'accettazione della task:', error);
      Swal.fire({
        title: 'Errore!',
        text: 'Impossible accettare la task. Riprova.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await axios.delete(`http://localhost:5000/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTasks();
      Swal.fire({
        title: 'Successo!',
        text: 'Task cancellato con successo',
        icon: 'success',
        confirmButtonText: 'OK'
      });
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
      <div className="bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
          <Login setToken={(token) => {
            localStorage.setItem('token', token);
            setToken(token);
          }} />
          <h2 className="text-2xl font-bold my-6 text-center">Register</h2>
          <Register />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen pb-24 p-8">
      <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">Calendario Condiviso</h2>
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/2">
          <Calendar
            onChange={handleDateChange}
            value={selectedDate}
            tileClassName={tileClassName}
            className="w-full bg-white rounded-lg shadow-md p-4"
          />
        </div>
        <div className="w-full md:w-1/2 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">
            {selectedDate.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'short' })
              .charAt(0).toUpperCase() +
              selectedDate.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'short' }).slice(1)}
          </h3>
          <h4 className="text-lg font-semibold mt-6 mb-3 text-gray-600">Eventi</h4>
          <ul className="space-y-2">
            {events
              .filter(event => event.date === selectedDate.toISOString().split('T')[0])
              .map(event => (
                <li key={event.id} className="bg-blue-100 p-2 rounded">{event.title}</li>
              ))}
          </ul>
          <h4 className="text-lg font-semibold mt-6 mb-3 text-gray-600">Attività in sospeso</h4>
          <ul className="space-y-2">
            {pendingTasks
              .filter(task => task.date === selectedDate.toISOString().split('T')[0])
              .map(task => (
                <li key={task.id} className="flex items-center justify-between bg-yellow-100 p-2 rounded">
                  <span>{task.title} (In sospeso)</span>
                  <div>
                    <button onClick={() => acceptTask(task.id)} className="text-green-600 hover:text-green-800 mr-2">
                      <FontAwesomeIcon icon={faCheck} />
                    </button>
                    <button onClick={() => deleteTask(task.id)} className="text-red-600 hover:text-red-800">
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </li>
              ))}
          </ul>
          <h4 className="text-lg font-semibold mt-6 mb-3 text-gray-600">Attività accettate</h4>
          <ul className="space-y-2">
            {acceptedTasks
              .filter(task => task.date === selectedDate.toISOString().split('T')[0])
              .map(task => (
                <li key={task.id} className="flex items-center justify-between bg-green-100 p-2 rounded">
                  <span>{task.title}</span>
                  <button onClick={() => deleteTask(task.id)} className="text-red-600 hover:text-red-800">
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </li>
              ))}
          </ul>
          <div className="mt-6 flex space-x-2">
            <input
              type="text"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              placeholder="Titolo attività"
              className="flex-grow px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button 
              onClick={handleTaskSubmit}
              className="px-4 py-3 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <FontAwesomeIcon icon={faPlus}/>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CalendarView;