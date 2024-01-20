import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Accelerometer, Gyroscope, DeviceMotion } from 'expo-sensors';

export default function App() {

  //const accelX = (acceleration.x * kFilteringFactor) + (accelX * (1.0 - kFilteringFactor));
  const [acceleration, setAcceleration] = useState({ x: 0, y: 0, z: 0 });
  const [velocity, setVelocity] = useState({ x: 0, y: 0, z: 0 });
  const [position, setPosition] = useState({ x: 0, y: 0, z: 0 });
  const [moving, setMoving] = useState({x: 0, y: 0, z: 0});
  const [max, setMax] = useState(0);
  const [min, setMin] = useState(0);
  const [step, setStep] = useState(0);
  const [accelSub, setAccelSub] = useState(null);

  const [{ x, y, z }, setData] = useState({
    x: 0,
    y: 0,
    z: 0,
  });
  Accelerometer.setUpdateInterval(100);

  const accelSubscribe = () => {
    setAccelSub(Accelerometer.addListener(({ x, y, z }) => {
      const movingX = moving.x * 0.9 + x * 0.1;
      const movingY = moving.y * 0.9 + y * 0.1;
      setMoving({x: movingX, y: movingY, z:0});
      x -= movingX;
      y -= movingY;
      x *= 9.8;
      y *= 9.8;
      setAcceleration({ x, y, z });
      const velX = velocity.x + x * 0.1;
      console.log(movingX);
      const velY = velocity.y + y * 0.1;
      setVelocity({x: velX, y: velY, z: 0});
      const posX = position.x + velX * 0.1;
      const posY = position.y + velY * 0.1;
      setPosition({x: posX, y: posY, z: 0});
      if(Math.abs(gyro.gamma) < 1) {
        if(x > 0) {
          x -= Math.abs(gyro.gamma);
        } else {
          x += Math.abs(gyro.gamma);
        }
      } else {
        if(x > 0) {
          x -= 1;
        } else {
          x += 1;
        }
      }
      if(Math.abs(gyro.beta) < 1) {
        if(y > 0) {
          y -= Math.abs(gyro.beta);
        } else {
          y += Math.abs(gyro.beta);
        }
      } else {
        if(y > 0) {
          y -= 1;
        } else {
          y += 1;
        }
      }
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

  const [gyro, setGyro] = useState({ alpha: 0, beta: 0, gamma: 0 });
  const [gyroSub, setGyroSub] = useState(null);

  DeviceMotion.setUpdateInterval(100);

  const rotateSubscribe = () => {
    setGyroSub(
      DeviceMotion.addListener((orientation) => {
        const { alpha, beta, gamma } = orientation.rotation;
        setGyro({alpha, beta, gamma});
      })
    );
  }

  const rotateUnsubscribe = () => {
    gyroSub && gyroSub.remove();
    setGyroSub(null);
  };

  useEffect(() => {
    accelSubscribe();
    return () => {
      accelUnsubscribe();
    };
  }, [acceleration, velocity]);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Accelerometer: (in gs where 1g = 9.81 m/s^2)</Text>
      <Text style={styles.text}>step: {step}</Text>
      <Text style={styles.text}>accelMax: {max}</Text>
      <Text style={styles.text}>x: {position.x}</Text>
      <Text style={styles.text}>y: {position.y}</Text>
      <Text style={styles.text}>z: {gyro.gamma}</Text>
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
