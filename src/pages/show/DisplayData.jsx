import React, { useState, useEffect } from 'react';
import { db } from '../../Firebase/firebaseConfig';
import { collection, getDocs, updateDoc, doc, getDoc } from 'firebase/firestore';
import './DisplayData.css';

function DisplayData() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedAnimals, setSelectedAnimals] = useState({});
  const [modalAnimal, setModalAnimal] = useState(null);
  const [newVaccination, setNewVaccination] = useState({
    name: '',
    date: '',
    frequency: ''
  });
  const [newAnimal, setNewAnimal] = useState({});

  // Helper function to check if a date is today
  const isToday = (dateStr) => {
    const today = new Date();
    const date = new Date(dateStr);
    return (
      today.getFullYear() === date.getFullYear() &&
      today.getMonth() === date.getMonth() &&
      today.getDate() === date.getDate()
    );
  };

  // Fetch data from Firestore
  const fetchData = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "owners"));
      const fetchedData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Filter data to only include today's data
      const todayData = fetchedData.filter(item =>
        item.animals.some(animal =>
          animal.vaccinations.some(vaccination => isToday(vaccination.date))
        )
      );

      // Save the filtered data in the state
      setData(todayData);
      setFilteredData(todayData);
    } catch (e) {
      console.error("Error fetching documents: ", e);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchData();
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
  
    loadData();
  }, []);
  
  useEffect(() => {
    // Update filtered data whenever the original data changes
    setFilteredData(data);
  }, [data]);

  // Handle search input change
  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    const filtered = data.filter(item => {
      return (
        item.personName.toLowerCase().includes(query) ||
        item.animals.some(animal => animal.name.toLowerCase().includes(query))
      );
    });
    setFilteredData(filtered);
  };

  // Handle animal selection change
  const handleAnimalChange = (personIndex, e) => {
    const animalName = e.target.value;
    const updatedSelectedAnimals = { ...selectedAnimals, [personIndex]: animalName };
    setSelectedAnimals(updatedSelectedAnimals);

    const selectedAnimal = data[personIndex]?.animals.find(animal => animal.name === animalName);
    
    if (selectedAnimal) {
      setModalAnimal({
        ...selectedAnimal,
        ownerId: data[personIndex].id // تعيين `ownerId` هنا
      });
    } else {
      setModalAnimal(null);
    }
  };

  // Handle closing of the modal
  const handleCloseModal = () => {
    setModalAnimal(null);
  };

  const handleAddVaccination = async () => {
    if (!newVaccination.name || !newVaccination.date || !newVaccination.frequency) return;
    
    try {
      // ... (rest of the code remains the same)
      
      // Update local state and modalAnimal directly
      setModalAnimal(prev => ({
        ...prev,
        vaccinations: [...prev.vaccinations, newVaccination]
      }));
      
      // Reset input fields
      setNewVaccination({ name: '', date: '', frequency: '' });
    } catch (e) {
      console.error("Error adding vaccination: ", e);
    }
  };
  
  
  
  

  const handleAddAnimal = async (ownerId, value) => {
    if (!value) return;

    try {
      const ownerRef = doc(db, "owners", ownerId);
      const ownerDoc = await getDoc(ownerRef);
      const ownerData = ownerDoc.data();

      const newAnimalObject = { name: value, vaccinations: [] };
      const updatedAnimals = [...ownerData.animals, newAnimalObject];

      await updateDoc(ownerRef, { animals: updatedAnimals });

      // Update data directly after addition
      await fetchData(); // Fetch updated data

      setNewAnimal(prev => ({ ...prev, [ownerId]: '' }));
    } catch (e) {
      console.error("Error adding animal: ", e);
    }
  };

  // Handle new animal input change
  const handleAnimalInputChange = (ownerId, value) => {
    setNewAnimal(prev => ({ ...prev, [ownerId]: value }));
  };

  return (
    <div className="display-container">
      <h2>Data Display</h2>

      <div className="search-container">
        <input
          type="text"
          placeholder="Search..."
          onChange={handleSearch}
        />
      </div>

      {filteredData.length === 0 ? (
        <p>No data available</p>
      ) : (
        filteredData.map((item, personIndex) => (
          <div key={personIndex} className="data-card">
            <h3>File Number: {item.fileNumber || 'Not available'}</h3>
            <h4>Owner: {item.personName}</h4>
            <p>Phone Number: {item.phoneNumber || 'Not available'}</p>

            <div className="animal-selector">
              <label htmlFor={`animal-select-${personIndex}`}>Select Animal:</label>
              <select
                id={`animal-select-${personIndex}`}
                onChange={(e) => handleAnimalChange(personIndex, e)}
                value={selectedAnimals[personIndex] || ''}
              >
                <option value="">Select an animal</option>
                {item.animals.map((animal, animalIndex) => (
                  <option key={animalIndex} value={animal.name}>
                    {animal.name}
                  </option>
                ))}
                {item.animals.length === 0 && (
                  <option value="">No animals available</option>
                )}
              </select>
            </div>

            {/* Add new animal */}
            <div className="add-animal">
              <input
                type="text"
                placeholder="Add New Animal"
                value={newAnimal[item.id] || ''}
                onChange={(e) => handleAnimalInputChange(item.id, e.target.value)}
              />
              <button onClick={() => handleAddAnimal(item.id, newAnimal[item.id])}>Add Animal</button>
            </div>
          </div>
        ))
      )}

      {modalAnimal && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={handleCloseModal}>&times;</span>
            <h3>Animal Details</h3>
            <p>Animal Name: {modalAnimal.name}</p>
            <p>Vaccinations:</p>
            {modalAnimal.vaccinations.map((vaccination, index) => (
              <div key={index} className="vaccination-info">
                <p>Vaccination Name: {vaccination.name}</p>
                <p>Date: {vaccination.date}</p>
                <p>Frequency: {vaccination.frequency}</p>
              </div>
            ))}

            <div className="add-vaccination">
              <h4>Add New Vaccination</h4>
              <input
                type="text"
                placeholder="Vaccination Name"
                value={newVaccination.name}
                onChange={(e) => setNewVaccination({ ...newVaccination, name: e.target.value })}
              />
              <input
                type="date"
                value={newVaccination.date}
                onChange={(e) => setNewVaccination({ ...newVaccination, date: e.target.value })}
              />
              <select
                value={newVaccination.frequency}
                onChange={(e) => setNewVaccination({ ...newVaccination, frequency: e.target.value })}
              >
                <option value="">Select Frequency</option>
                <option value="Monthly">Monthly</option>
                <option value="Bimonthly">Every 2 months</option>
                <option value="Quarterly">Every 3 months</option>
                <option value="Semi-annually">Every 6 months</option>
                <option value="Annually">Every year</option>
              </select>
              <button onClick={handleAddVaccination}>Add Vaccination</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DisplayData;
