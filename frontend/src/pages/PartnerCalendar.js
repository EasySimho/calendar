import React, { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import axios from 'axios';
import 'react-calendar/dist/Calendar.css';

function PartnerCalendar() {
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [title, setTitle] = useState('');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/events', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        console.log('Events fetched successfully:', response.data);
        setEvents(response.data);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };
      
    fetchEvents();
  }, []);

  const handleDateClick = (date) => {
    setSelectedDate(date);
  };

  const handleAddEvent = async () => {
    try {
      const token = localStorage.getItem('token');
      const username = localStorage.getItem('username');
  
      if (!username) {
        console.error('Username is not available');
        return;
      }
  
      if (!title || !selectedDate) {
        console.error('Title or selected date is missing');
        return;
      }
  
      const response = await axios.post('http://localhost:5000/events', {
        user: username,
        title: title,
        date: selectedDate.toISOString().split('T')[0],
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
  
      console.log('Event added successfully:', response.data);
      setEvents([...events, response.data]);
      setTitle('');
    } catch (error) {
      console.error('Error adding event:', error);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen pb-20 p-4 md:p-8 overflow-scroll">
      <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">Calendario Tatina</h2>
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-2/3">
          <div className="bg-white rounded-lg shadow-md p-4">
            <Calendar 
              onChange={handleDateClick} 
              value={selectedDate}
              className="w-full"
              tileClassName={({ date, view }) => {
                if (view === 'month' && events.find(event => event.date === date.toISOString().split('T')[0])) {
                  return 'bg-pink-200 text-pink-800 rounded-full';
                }
              }}
              formatShortWeekday={(locale, date) => ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'][date.getDay()]}
              formatMonthYear={(locale, date) => {
                const months = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
                return `${months[date.getMonth()]} ${date.getFullYear()}`;
              }}
            />
          </div>
        </div>
        <div className="w-full lg:w-1/3">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-700">
              {selectedDate.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })
                .charAt(0).toUpperCase() +
                selectedDate.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' }).slice(1)}
            </h3>
            <div className="mb-4">
              <input 
                type="text" 
                placeholder="Inserisci attività Sofia" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
              <button 
                onClick={handleAddEvent}
                className="mt-2 w-full px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
              >
                Aggiungi Attività
              </button>
            </div>
            <h4 className="text-lg font-semibold mb-2 text-gray-600">Attività del giorno</h4>
            <ul className="space-y-2">
              {events
                .filter(event => event.date === selectedDate.toISOString().split('T')[0])
                .map(event => (
                  <li key={event.id} className="bg-gray-100 p-2 rounded flex justify-between items-center">
                    <span>{event.title}</span>
                    <span className="text-sm text-gray-500">{event.user}</span>
                  </li>
                ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PartnerCalendar;