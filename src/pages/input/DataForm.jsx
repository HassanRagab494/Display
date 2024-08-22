import React, { useState } from 'react';
import { db } from '../../Firebase/firebaseConfig'; // استيراد إعدادات فايربيز
import { collection, addDoc } from 'firebase/firestore';
import './DataForm.css'; // استيراد ملف CSS

function DataForm() {
  const [personName, setPersonName] = useState('');
  const [fileName, setFileName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [animals, setAnimals] = useState([{
    name: '',
    vaccinations: [{ name: '', date: '', frequency: '' }]
  }]);

  // تحديث بيانات الحيوان
  const handleAnimalChange = (index, field, value) => {
    const newAnimals = [...animals];
    newAnimals[index][field] = value;
    setAnimals(newAnimals);
  };

  // تحديث بيانات التطعيم
  const handleVaccinationChange = (animalIndex, vacIndex, field, value) => {
    const newAnimals = [...animals];
    newAnimals[animalIndex].vaccinations[vacIndex][field] = value;
    setAnimals(newAnimals);
  };

  // إضافة تطعيم جديد
  const handleAddVaccination = (animalIndex) => {
    const newAnimals = [...animals];
    newAnimals[animalIndex].vaccinations.push({ name: '', date: '', frequency: '' });
    setAnimals(newAnimals);
  };

  // إضافة حيوان جديد
  const handleAddAnimal = () => {
    const newAnimals = [...animals];
    const lastAnimal = newAnimals[newAnimals.length - 1];

    if (lastAnimal.vaccinations.length > 0) {
      const updatedVaccinations = lastAnimal.vaccinations.map(vaccination => {
        if (vaccination.frequency) {
          const newDate = new Date(vaccination.date);
          switch (vaccination.frequency) {
            case '1month':
              newDate.setMonth(newDate.getMonth() + 1);
              break;
            case '2months':
              newDate.setMonth(newDate.getMonth() + 2);
              break;
            case '3months':
              newDate.setMonth(newDate.getMonth() + 3);
              break;
            case '6months':
              newDate.setMonth(newDate.getMonth() + 6);
              break;
            case '12months':
              newDate.setFullYear(newDate.getFullYear() + 1);
              break;
            default:
              break;
          }
          return { ...vaccination, date: newDate.toISOString().split('T')[0] };
        }
        return vaccination;
      });

      newAnimals.push({
        name: '',
        vaccinations: updatedVaccinations
      });
    } else {
      newAnimals.push({
        name: '',
        vaccinations: [{ name: '', date: '', frequency: '' }]
      });
    }
    setAnimals(newAnimals);
  };

  // إرسال البيانات إلى Firebase
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // تحقق من البيانات قبل الإرسال
      console.log('Submitting data:', { personName, fileName, phoneNumber, animals });

      // استخدم addDoc لإضافة البيانات إلى Firebase
      await addDoc(collection(db, "owners"), {
        personName,
        fileNumber: fileName, // تأكد من استخدام الحقل المناسب هنا
        phoneNumber,
        animals
      });

      // مسح الحقول بعد نجاح الإرسال
      setPersonName('');
      setFileName('');
      setPhoneNumber('');
      setAnimals([{
        name: '',
        vaccinations: [{ name: '', date: '', frequency: '' }]
      }]);

      alert("Data saved successfully!");
    } catch (e) {
      console.error("Error adding document: ", e);
      alert("Failed to save data. Check the console for more details.");
    }
  };

  return (
    <div className="form-container">
      <h2>Data Entry Form</h2>
      <form onSubmit={handleSubmit} className="data-form">
        {/* قسم بيانات العميل */}
        <div className="basic-info-section">
          <h3>Client Information</h3>
          <div className="form-group">
            <label htmlFor="personName">Person's Name</label>
            <input
              type="text"
              id="personName"
              value={personName}
              onChange={(e) => setPersonName(e.target.value)}
              placeholder="Enter person's name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="fileName">File Name</label>
            <input
              type="text"
              id="fileName"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="Enter file name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="phoneNumber">Phone Number</label>
            <input
              type="text"
              id="phoneNumber"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Enter phone number"
              required
            />
          </div>
        </div>

        {/* قسم بيانات الحيوان */}
        <div className="animals-section">
          <h3>Animals</h3>
          {animals.map((animal, animalIndex) => (
            <div key={animalIndex} className="animal-section">
              <h4>Animal {animalIndex + 1}</h4>
              <div className="form-group">
                <label htmlFor={`animalName${animalIndex}`}>Animal's Name</label>
                <input
                  type="text"
                  id={`animalName${animalIndex}`}
                  value={animal.name}
                  onChange={(e) => handleAnimalChange(animalIndex, 'name', e.target.value)}
                  placeholder="Enter animal's name"
                  required
                />
              </div>

              {animal.vaccinations.map((vaccination, vacIndex) => (
                <div key={vacIndex} className="vaccination-section">
                  <div className="form-group">
                    <label htmlFor={`vaccinationName${animalIndex}${vacIndex}`}>Vaccination Name</label>
                    <input
                      type="text"
                      id={`vaccinationName${animalIndex}${vacIndex}`}
                      value={vaccination.name}
                      onChange={(e) => handleVaccinationChange(animalIndex, vacIndex, 'name', e.target.value)}
                      placeholder="Enter vaccination name"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor={`vaccinationDate${animalIndex}${vacIndex}`}>Date</label>
                    <input
                      type="date"
                      id={`vaccinationDate${animalIndex}${vacIndex}`}
                      value={vaccination.date}
                      onChange={(e) => handleVaccinationChange(animalIndex, vacIndex, 'date', e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor={`vaccinationFrequency${animalIndex}${vacIndex}`}>Frequency</label>
                    <select
                      id={`vaccinationFrequency${animalIndex}${vacIndex}`}
                      value={vaccination.frequency}
                      onChange={(e) => handleVaccinationChange(animalIndex, vacIndex, 'frequency', e.target.value)}
                      required
                    >
                      <option value="">Select frequency</option>
                      <option value="1month">Every month</option>
                      <option value="2months">Every 2 months</option>
                      <option value="3months">Every 3 months</option>
                      <option value="6months">Every 6 months</option>
                      <option value="12months">Every year</option>
                    </select>
                  </div>
                </div>
              ))}
              <button type="button" className="add-button" onClick={() => handleAddVaccination(animalIndex)}>Add Vaccination</button>
            </div>
          ))}

          <button type="button" className="add-button" onClick={handleAddAnimal}>Add Animal</button>
        </div>

        <button type="submit" className="submit-button">Save Data</button>
      </form>
    </div>
  );
}

export default DataForm;
