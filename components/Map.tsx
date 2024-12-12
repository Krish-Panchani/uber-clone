import React, { useRef, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Text,
  View,
  StyleSheet,
  PermissionsAndroid,
  Platform,
  Alert,
} from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT, Region } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';

import { icons } from '@/constants';
import { useFetch } from '@/lib/fetch';
import { calculateDriverTimes, generateMarkersFromData } from '@/lib/map';
import { useDriverStore, useLocationStore } from '@/store';
import { Driver, MarkerData } from '@/types/type';

const directionsAPI = process.env.EXPO_PUBLIC_GOOGLE_API_KEY;

const Map = () => {
  const { userLongitude, userLatitude, destinationLatitude, destinationLongitude } =
    useLocationStore();
  const { selectedDriver, setDrivers } = useDriverStore();

  const { data: drivers, loading: driversLoading, error } = useFetch<Driver[]>('/(api)/driver');
  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const [locationLoading, setLocationLoading] = useState(true); // Track location loading
  const mapRef = useRef<MapView | null>(null);

  // Request permissions and fetch user location
  useEffect(() => {
    const requestPermissions = async () => {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          console.error('Location permission denied');
        }
      }
      setLocationLoading(false); // Stop loading after permissions
    };

    requestPermissions();
  }, []);

  // Generate markers from drivers' data
  useEffect(() => {
    if (Array.isArray(drivers) && userLatitude && userLongitude) {
      const newMarkers = generateMarkersFromData({
        data: drivers,
        userLatitude,
        userLongitude,
      });

      setMarkers(newMarkers);
    }
  }, [drivers, userLatitude, userLongitude]);

  // Calculate driver times and set drivers
  useEffect(() => {
    if (markers.length > 0 && destinationLatitude && destinationLongitude) {
      calculateDriverTimes({
        markers,
        userLatitude,
        userLongitude,
        destinationLatitude,
        destinationLongitude,
      }).then((drivers) => {
        setDrivers(drivers as MarkerData[]);
      });
    }
  }, [markers, destinationLatitude, destinationLongitude]);

  // Automatically zoom to user location
  useEffect(() => {
    if (mapRef.current && userLatitude && userLongitude) {
      mapRef.current.animateToRegion(
        {
          latitude: userLatitude,
          longitude: userLongitude,
          latitudeDelta: 0.01, // Controls the zoom level (smaller delta = closer zoom)
          longitudeDelta: 0.01,
        },
        1000, // Animation duration in milliseconds
      );
    }
  }, [userLatitude, userLongitude]);

  const isLoading = locationLoading || driversLoading;

  if (isLoading)
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0286FF" />
        <Text>Loading map data...</Text>
      </View>
    );

  if (error) {
    Alert.alert('Error', error.toString());
    return (
      <View style={styles.centered}>
        <Text>Error: {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        showsPointsOfInterest={false}
        showsUserLocation={true}
        userInterfaceStyle="light"
        provider={PROVIDER_DEFAULT}
        onMapReady={() => {
          // Ensure zoom when the map is ready
          if (userLatitude && userLongitude) {
            mapRef.current?.animateToRegion(
              {
                latitude: userLatitude,
                longitude: userLongitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              },
              1000,
            );
          }
        }}>
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            coordinate={{
              latitude: marker.latitude,
              longitude: marker.longitude,
            }}
            title={marker.title}
            image={selectedDriver === +marker.id ? icons.selectedMarker : icons.marker}
          />
        ))}

        {destinationLatitude && destinationLongitude && (
          <>
            <Marker
              key="destination"
              coordinate={{
                latitude: destinationLatitude,
                longitude: destinationLongitude,
              }}
              title="Destination"
              image={icons.pin}
            />
            <MapViewDirections
              origin={{
                latitude: userLatitude!,
                longitude: userLongitude!,
              }}
              destination={{
                latitude: destinationLatitude,
                longitude: destinationLongitude,
              }}
              apikey={directionsAPI!}
              strokeColor="#0286FF"
              strokeWidth={2}
            />
          </>
        )}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Map;
