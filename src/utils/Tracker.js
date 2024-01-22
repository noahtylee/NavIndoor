import React, { useState, useEffect, useRef } from 'react';
import { Dimensions, TouchableOpacity, View, TextInput, Text, StyleSheet } from 'react-native';
import { Accelerometer, Magnetometer, Gyroscope } from 'expo-sensors';
import Canvas from 'react-native-canvas';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ref, update } from 'firebase/database'
import { database } from '../../FirebaseConfig';

// custom modules
import { range } from './sensors_utils';
import { useHeading, useStepLength, useAccStep } from './customHooks';

export default function LocationScreen({ navigation }) {
  // Listeners
  const [acc, setAcc] = useState({ x: 0, y: 0, z: 0 });
  const [mag, setMag] = useState({ x: 0, y: 0, z: 0 });
  const [gyr, setGyr] = useState({ x: 0, y: 0, z: 0 });

  // Custom Hooks
  const heading = useHeading(acc, mag, gyr);
  const [stepLength, headingStep] = useStepLength(acc, mag, gyr);

  Accelerometer.setUpdateInterval(100);
  Magnetometer.setUpdateInterval(100);
  Gyroscope.setUpdateInterval(100);

  useEffect(() => {
    Accelerometer.addListener((data) => {
      setAcc(data);
    });
    Magnetometer.addListener((data) => {
      setMag(data);
    });
    Gyroscope.addListener((data) => {
      setGyr(data);
    });
    _handleCanvas(canvasRef.current);
    getData();
    return () => {
      Accelerometer.removeAllListeners();
      Magnetometer.removeAllListeners();
      Gyroscope.removeAllListeners();
    };
  }, [acc]);
  
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [accStep, accEvent] = useAccStep(acc, mag, gyr);
  const [length, setLength] = useState(0);
  const [status, setStatus] = useState(false);
  const [nodes, setNodes] = useState([]);
  const [angles, setAngles] = useState([]);
  const [positions, setPos] = useState([]);
  const [mapName, setMapName] = useState('');

  useEffect(() => {
    if (accEvent && !isNaN(stepLength)) {
      setLength(length + stepLength);
    }
  }, [accStep]);

  const clearAll = async () => {
    try {
      await AsyncStorage.clear()
    } catch(e) {
      // clear error
    }
  
    console.log('Done.')
  }

  const setNode = async () => {
    setMapName(await AsyncStorage.getItem('mapName'));
    let graph = new Object();
    let visualMap = new Object();
    graph[end] = length;
    visualMap[end] = heading;

    update(ref(database, mapName + '/nodeGraph/' + start), graph);
    update(ref(database, mapName + '/visualGraph/' + start), visualMap);
    update(ref(database, mapName + '/nodePos/' + end), [location.x, location.y]);
    setStatus(false);
    setStart(end);
    setEnd('');
  }

  const getData = () => {
    const reference = ref(database, mapName + '/nodeGraph');
    onValue(reference, (snapshot) => {
      const data = snapshot.val();
      setNodes(data);
    });
    const reference2 = ref(database, mapName + '/visualGraph');
    onValue(reference2, (snapshot) => {
      const data = snapshot.val();
      setAngles(data);
    });
    const reference3 = ref(database, mapName + '/nodePos');
    onValue(reference3, (snapshot) => {
      const data = snapshot.val();
      setPos(data);
    });
  }

  const resetLength = () => {
    setLength(0);
    setStatus(true);
    update(ref(database, mapName + '/nodePos/' + start), [location.x, location.y]);
  }

  const canvasRef = useRef(null);
  const [location, setLocation] = useState({ x: 0, y: 0 });

  useEffect(() => {
    let nx = stepLength ? stepLength * Math.sin(headingStep) * 10 : 0,
      ny = stepLength ? stepLength * Math.cos(headingStep) * 10 : 0;
    setLocation((l) => ({
      x: l.x ? l.x + nx : windowWidth / 2,
      y: l.y ? l.y - ny : windowHeight / 2,
    }));
    _handleCanvas(canvasRef.current);
  }, [stepLength]);

  const _handleCanvas = (canvas) => {
    const windowWidth = Dimensions.get('window').width;
    const windowHeight = Dimensions.get('window').height - 64;
    canvas.width = windowWidth;
    canvas.height = windowHeight;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    _current_user(ctx);
  };

  const _current_user = (ctx) => {
    const nodeNames = Object.keys(positions);
    const nodeLocations = Object.values(positions);
    const nodeConnections = Object.keys(nodes).map((key) => [key, Object.keys(nodes[key])]);
    ctx.beginPath();
    for(let i = 0; i < nodeConnections.length; i++) {
      let index = nodeNames.indexOf(nodeConnections[i][0]);
      for(let j = 0; j < nodeConnections[i][1].length; j++) {
        let index2 = nodeNames.indexOf(nodeConnections[i][1][j]);
        let x1 = parseFloat(nodeLocations[index][0]);
        let y1 = parseFloat(nodeLocations[index][1]);
        let x2 = parseFloat(nodeLocations[index2][0]);
        let y2 = parseFloat(nodeLocations[index2][1]);
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
      }
    }
    ctx.closePath();
  };

  return (
    <View style={styles.container}>
      <Canvas ref={canvasRef} style={styles.map}/>
      <TextInput
      onChangeText={setStart}
      value={start}
      placeholder="Starting"
      keyboardType="default"
      />
      <TextInput
      onChangeText={setEnd}
      value={end}
      placeholder="Ending"
      keyboardType="default"
      />
      <TouchableOpacity onPress={status ? setNode : resetLength}><Text>{status ? 'Stop Tracking' : 'Begin Tracking'}</Text></TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center'
    },
    map: {

    }
  })