import { db } from '../Firebase/firebaseConfig';
import { collection, getDocs, updateDoc } from 'firebase/firestore';

const updateOwnerIdForAnimals = async () => {
  const querySnapshot = await getDocs(collection(db, "owners"));
  querySnapshot.forEach(async (doc) => {
    const ownerId = doc.id;
    const ownerData = doc.data();

    const updatedAnimals = ownerData.animals.map(animal => {
      if (!animal.ownerId) {
        return { ...animal, ownerId };
      }
      return animal;
    });

    await updateDoc(doc.ref, { animals: updatedAnimals });
  });
};

export default updateOwnerIdForAnimals;
