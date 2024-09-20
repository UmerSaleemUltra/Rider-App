import { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore'; // Firestore methods
import { db } from '../Confing/firebase'; // Adjust the import path as needed
import MapView, { Marker } from 'react-native-maps';

export default function RiderPage() {
  const [loading, setLoading] = useState(true);
  const [carSelections, setCarSelections] = useState([]);
  const [selectedCar, setSelectedCar] = useState(null); // To store the selected car details
  const [error, setError] = useState(null);


  useEffect(() => {
    const fetchCarSelections = async () => {
      try {
        console.log('Fetching car selections...');
        const q = query(collection(db, 'carSelection'), where('status', '==', 'pending'));
        const querySnapshot = await getDocs(q);

        console.log('Query Snapshot:', querySnapshot);

        if (querySnapshot.empty) {
          console.log('No matching documents.');
        } else {
          const selections = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          console.log('Fetched selections: ', selections);
          setCarSelections(selections);
        }
      } catch (error) {
        console.error('Error fetching car selections: ', error);
        setError('Failed to fetch car selections. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchCarSelections();
  }, []);

  // Function to update the status of a car selection
  const updateStatus = async (id, status) => {
    try {
      const carRef = doc(db, 'carSelection', id);
      await updateDoc(carRef, { status });
      setCarSelections(prevSelections =>
        prevSelections.map(item =>
          item.id === id ? { ...item, status } : item
        )
      );
      if (status === 'accepted') {
        const selected = carSelections.find(item => item.id === id);
        setSelectedCar(selected);
      }
      Alert.alert('Success', `Car selection ${status}`);
    } catch (error) {
      console.error('Error updating car selection: ', error);
      Alert.alert('Error', 'Failed to update car selection. Please try again.');
    }
  };

  // Function to handle accept button press
  const handleAccept = (id) => {
    Alert.alert('Confirm', 'Are you sure you want to accept this car selection?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'OK', onPress: () => updateStatus(id, 'accepted') },
    ]);
  };

  // Function to handle decline button press
  const handleDecline = (id) => {
    Alert.alert('Confirm', 'Are you sure you want to decline this car selection?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'OK', onPress: () => updateStatus(id, 'declined') },
    ]);
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : carSelections.length === 0 ? (
        <Text style={styles.noDataText}>No car selections available</Text>
      ) : (
        <>
          <FlatList
            data={carSelections}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.itemContainer}>
                <Text style={styles.itemText}>Pickup: {item.pickupName}</Text>
                <Text style={styles.itemText}>Dropoff: {item.dropoffName}</Text>
                <Text style={styles.itemText}>Car Type: {item.carType}</Text>
                <Text style={styles.itemText}>Total Price: PKR {item.totalPrice}</Text>
                <Text style={styles.itemText}>Distance: {item.distance} km</Text>
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={[styles.button, styles.acceptButton]}
                    onPress={() => handleAccept(item.id)}
                  >
                    <Text style={styles.buttonText}>Accept</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.button, styles.declineButton]}
                    onPress={() => handleDecline(item.id)}
                  >
                    <Text style={styles.buttonText}>Decline</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />

          {/* MapView Component */}
          {selectedCar && (
            <View style={styles.mapContainer}>
              <MapView
                style={StyleSheet.absoluteFillObject}
                initialRegion={{
                  latitude: selectedCar.pickupLatitude || 0,
                  longitude: selectedCar.pickupLongitude || 0,
                  latitudeDelta: 0.0922,
                  longitudeDelta: 0.0421,
                }}
              >
                <Marker coordinate={{ latitude: selectedCar.pickupLatitude, longitude: selectedCar.pickupLongitude }} title="Pickup" />
                <Marker coordinate={{ latitude: selectedCar.dropoffLatitude, longitude: selectedCar.dropoffLongitude }} title="Dropoff" />
              </MapView>
            </View>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  itemContainer: {
    padding: 15,
    marginBottom: 10,
    borderRadius: 5,
    backgroundColor: '#f9f9f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  itemText: {
    fontSize: 16,
    marginBottom: 5,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
  },
  noDataText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  button: {
    flex: 1,
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 5,
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: 'green',
  },
  declineButton: {
    backgroundColor: 'red',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  mapContainer: {
    height: 300, // Adjust height as needed
    marginTop: 20,
  },
});
