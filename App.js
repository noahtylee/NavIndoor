import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Accelerometer, Gyroscope, DeviceMotion } from 'expo-sensors';

export default function App() {

  //const accelX = (acceleration.x * kFilteringFactor) + (accelX * (1.0 - kFilteringFactor));
  const [acceleration, setAcceleration] = useState({ x: 0, y: 0, z: 0 });
  const [max, setMax] = useState(0);
  const [min, setMin] = useState(0);
  const [step, setStep] = useState(0);
  const [accelSub, setAccelSub] = useState(null);

  const [{ x, y, z }, setData] = useState({
    x: 0,
    y: 0,
    z: 0,
  });

  const _slow = () => Accelerometer.setUpdateInterval(1000);
  const _fast = () => Accelerometer.setUpdateInterval(16);

  const accelSubscribe = () => {
    setAccelSub(Accelerometer.addListener(({ x, y, z }) => {
      setAcceleration({ x, y, z });
      let accel = 0;
      accel = ((Math.sqrt(x ** 2 + y ** 2)) * 0.1 + accel * (1 - 0.1)) * 10;
      if(accel > max) {
        setMax(accel);
      }
      if(accel < min) {
        setMin(accel);
      }
      setStep(0.41 * Math.pow(max - min, 1/4));
    }));
  };

  const accelUnsubscribe = () => {
    accelSub && accelSub.remove();
    setAccelSub(null);
  };

  const [gyroSub, setGyroSub] = useState(null);
  const [angles, setAngles] = useState({ pitch: 0, yaw: 0, roll: 0 });
  const [lastGyroscopeData, setLastGyroscopeData] = useState({ x: 0, y: 0, z: 0 });
  Gyroscope.setUpdateInterval(100);

  const gyroSubscribe = () => {
    setGyroSub(
      Gyroscope.addListener(({ x, y, z }) => {
        setData({ x, y, z });
        const pitch = (angles.pitch + (angles.pitch + y)) * (0.1 / 2);
        const yaw = (angles.yaw + (angles.yaw + z)) * (0.1 / 2);
        const roll = (angles.roll + (angles.roll + x)) * (0.1 / 2);

        // Update state with the new angles
        setAngles({ pitch, yaw, roll });
        setLastGyroscopeData({ x, y, z });
      })
    );
  };

  const gyroUnsubscribe = () => {
    gyroSub && gyroSub.remove();
    setGyroSub(null);
  };

  useEffect(() => {
    accelSubscribe();
    gyroSubscribe();
    return () => accelUnsubscribe();
  }, [acceleration, angles.pitch]);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Accelerometer: (in gs where 1g = 9.81 m/s^2)</Text>
      <Text style={styles.text}>step: {step}</Text>
      <Text style={styles.text}>accelMax: {max}</Text>
      <Text style={styles.text}>x: {angles.pitch}</Text>
      <Text style={styles.text}>y: {angles.yaw}</Text>
      <Text style={styles.text}>z: {angles.roll}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
