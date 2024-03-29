import React, { useState, useEffect, useRef } from 'react';
import { Dimensions, TouchableOpacity, View, TextInput, Text, StyleSheet } from 'react-native';
import { Accelerometer, Magnetometer, Gyroscope } from 'expo-sensors';
import Canvas from 'react-native-canvas';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ref, update, onValue, set } from 'firebase/database'
import { database } from '../../FirebaseConfig';

// custom modules
import { range } from './sensors_utils';
import { useHeading, useStepLength, useAccStep } from './customHooks';

export default function MapCreator({ navigation }) {
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
    getMapName();
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
  const [nodeObject, setNodeObject] = useState({});

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
    let graph = new Object();
    let visualMap = new Object();
    let nodePos = new Object();
    graph[end] = length;
    visualMap[end] = heading;
    nodePos[end] = location.x + ' ' + location.y;

    let realGraph = nodeObject;
    if(Object.hasOwn(nodeObject, start)) {
      let inside = nodeObject[start];
      inside[end] = length;
      realGraph[start] = inside;
    } else {
      let inside = new Object();
      inside[end] = length;
      realGraph[start] = inside;
    }
    setNodeObject(realGraph);

    update(ref(database, mapName + '/nodeGraph/' + start), graph);
    update(ref(database, mapName + '/visualGraph/' + start), visualMap);
    update(ref(database, mapName + '/nodePos/'), nodePos);
    setStatus(false);
    setStart(end);
    setEnd('');
  }

  const getMapName = async () => {
    setMapName(await AsyncStorage.getItem('mapName'));
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
    let nodePos = new Object();
    nodePos[start] = location.x + ' ' + location.y;
    update(ref(database, mapName + '/nodePos/'), nodePos);
  }

  const canvasRef = useRef(null);
  const [location, setLocation] = useState({ x: 0, y: 0 });
  
  const windowWidth = Dimensions.get('window').width;
  const windowHeight = Dimensions.get('window').height / 2;

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
    canvas.width = windowWidth;
    canvas.height = windowHeight;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if(nodes != null && positions != null)
      _current_user(ctx);
  };

  const _current_user = (ctx) => {
    const nodeNames = Object.keys(positions);
    const nodeLocations = Object.values(positions);
    const nodeConnections = Object.keys(nodes).map((key) => [key, Object.keys(nodes[key])]);
    ctx.strokeStyle = "blue";
    ctx.lineWidth = 5;
    for(let i = 0; i < nodeConnections.length; i++) {
      let index = nodeNames.indexOf(nodeConnections[i][0]);
      for(let j = 0; j < nodeConnections[i][1].length; j++) {
        let index2 = nodeNames.indexOf(nodeConnections[i][1][j]);
        let x1 = parseFloat(nodeLocations[index].substring(0, nodeLocations[index].indexOf(' ')));
        let y1 = parseFloat(nodeLocations[index].substring(nodeLocations[index].indexOf(' ') + 1));
        let x2 = parseFloat(nodeLocations[index2].substring(0, nodeLocations[index2].indexOf(' ')));
        let y2 = parseFloat(nodeLocations[index2].substring(nodeLocations[index2].indexOf(' ') + 1));
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.closePath();
      }
    }
  };

  const handleSubmit = async () => {
    set(ref(database, mapName + '/nodeObject'), nodeObject);
    navigation.navigate('Tracker');
  }

  return (
    <View style={styles.container}>
      <Canvas ref={canvasRef} style={styles.map}/>
      <Text>{length}</Text>
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
      <TouchableOpacity style={styles.btn} onPress={status ? setNode : resetLength}><Text style={styles.btnLabel}>{status ? 'Stop Tracking' : 'Begin Tracking'}</Text></TouchableOpacity>
      <TouchableOpacity style={styles.btn} onPress={handleSubmit}><Text style={styles.btnLabel}>Done Mapping</Text></TouchableOpacity>
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
    btn: {
      backgroundColor: '#478eff',
      width: '70%',
      height: 50,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      margin: 20,
    },
    btnLabel: {
      fontSize: 20,
      fontWeight: 'bold',
      fontFamily: 'Roboto',
    },
  })