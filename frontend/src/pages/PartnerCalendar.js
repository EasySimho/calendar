import React, { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import axios from 'axios';

function PartnerCalendar() {
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [title, setTitle] = useState('');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = localStorage.getItem('token'); // Assicurati che il token sia memorizzato nel localStorage
        const response = await axios.get('http://localhost:5000/events', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        console.log('Events fetched successfully:', response.data);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };
      
    fetchEvents(); // Richiama la funzione ogni volta che il componente viene montato
  }, []); // Esegui useEffect solo una volta all'inizio
  

  const handleDateClick = (date) => {
    setSelectedDate(date);
  };

  const handleAddEvent = async (event) => {
    try {
      const token = localStorage.getItem('token'); // Assicurati che il token sia memorizzato nel localStorage
      const response = await axios.post('http://localhost:5000/events', {
        user: event.user,
        title: event.title,
        date: event.date,
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('Event added successfully:', response.data);
    } catch (error) {
      console.error('Error adding event:', error);
    }
  };

  return (
    <div>
      <h2>Calendario Tatina</h2>
      <Calendar onClickDay={handleDateClick} />
      <div className='inserimento-attivita'>
      <h3>{selectedDate.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'short' })
    .charAt(0).toUpperCase() + 
    selectedDate.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'short' }).slice(1)}</h3>

        <input 
          type="text" 
          placeholder="Inserisci attività Sofia" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
        />
        <button onClick={handleAddEvent}>Aggiungi Attività</button>
      </div>
      <ul>
       {events
            .filter(event => event.date === selectedDate.toISOString().split('T')[0])
            .map(event => (
              <li key={event.id}>{event.title}</li>
            ))}
        </ul>
      </div>
    );
  }
  
  export default PartnerCalendar;