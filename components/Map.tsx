import React, { useEffect } from 'react';
import { View, StyleSheet, PermissionsAndroid } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

const Map = () => {
  useEffect(() => {
    const requestPermission = async () => {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        console.warn('Location permission not granted');
      }
    };
    requestPermission();
  }, []);

  const initialRegion = {
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation={true}
        mapType="mutedStandard"
        tintColor="black"
        showsPointsOfInterest={false}
        userInterfaceStyle="light">
        <Marker coordinate={{ latitude: 37.78825, longitude: -122.4324 }} />
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
});

export default Map;
