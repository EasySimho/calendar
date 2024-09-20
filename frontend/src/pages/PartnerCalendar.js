import React, { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import axios from 'axios';
import "./CustomCalendar.css";

function PersonalCalendar() {
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
        setEvents(response.data); // Update the state with fetched events
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };
      
    fetchEvents(); // Richiama la funzione ogni volta che il componente viene montato
  }, []); // Esegui useEffect solo una volta all'inizio
  

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
          'Authorization': `Bearer ${token}` // Corrected line
        }
      });
  
      console.log('Event added successfully:', response.data);
      setEvents([...events, response.data]); // Update the state with the new event
    } catch (error) {
      console.error('Error adding event:', error);
    }
  };

  return (
    <div>
      <h2 className='calendar-title'>Calendario Tatina</h2>
      <br />
      <Calendar onClickDay={handleDateClick} />
      <div className='inserimento-attivita'>
        <h3 className='date-title'>{selectedDate.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'short' })
          .charAt(0).toUpperCase() +
          selectedDate.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'short' }).slice(1)}
        </h3>
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
          .filter(event => event.date === selectedDate.toISOString().split('T')[0])  // Filtra gli eventi in base alla data selezionata
          .map(event => (
            <li key={event.id}>{event.title} - {event.user}</li> // Display event title and username
          ))}
      </ul>
    </div>
  );
}

export default PersonalCalendar;