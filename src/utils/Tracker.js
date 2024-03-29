import React, { useState, useEffect, useRef } from 'react';
import { Dimensions, TouchableOpacity, View, TextInput, Text, StyleSheet } from 'react-native';
import { Accelerometer, Magnetometer, Gyroscope } from 'expo-sensors';
import Canvas from 'react-native-canvas';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ref, update, onValue } from 'firebase/database'
import { database } from '../../FirebaseConfig';

// custom modules
import { range } from './sensors_utils';
import { useHeading, useStepLength, useAccStep } from './customHooks';

export default function Tracker({ navigation }) {
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
    setMapName("Yut");
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
  const [nodes, setNodes] = useState([]);
  const [angles, setAngles] = useState([]);
  const [positions, setPos] = useState([]);
  const [mapName, setMapName] = useState('');
  const [trueGraph, setTrueGraph] = useState();
  const [isNavigate, setIsNavigate] = useState(false);
  const [shortestPath, setShortestPath] = useState([]);
  const [currentNode, setCurrentNode] = useState([]);
  const [nodeObject, setNodeObject] = useState({});

  useEffect(() => {
    if (accEvent && !isNaN(stepLength)) {
      setLength(length + stepLength);
    }
  }, [accStep]);

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
    const reference4 = ref(database, mapName + '/nodeObject');
    onValue(reference4, (snapshot) => {
      const data = snapshot.val();
      setNodeObject(data);
    });
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
    const nodeAngles = Object.keys(angles).map((key) => [key, Object.values(nodes[key])])
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
    if(isNavigate) {
      ctx.beginPath();
      ctx.fillStyle = 'fc8132';
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 1;
      ctx.arc(location.x, location.y, 10, 0, 2 * Math.PI, false);
      ctx.fill();
      ctx.stroke();
      ctx.closePath();
      ctx.strokeStyle = "red";
      ctx.lineWidth = 5;
      for(let i = 0; i < shortestPath.length - 1; i++) {
        let index = nodeNames.indexOf(shortestPath[i]);
        let index2 = nodeNames.indexOf(shortestPath[i + 1]);
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
      ctx.beginPath();
      ctx.fillStyle = 'rgba(252, 129, 50, 0.3)';
      ctx.arc(
        location.x,
        location.y,
        55,
        range(heading - Math.PI / 2 - (20 * Math.PI) / 180, '2PI'),
        range(heading - Math.PI / 2 + (20 * Math.PI) / 180, '2PI'),
        false
      );
      ctx.lineTo(location.x, location.y);
      ctx.fill();
      ctx.closePath();
      // let firstNode = currentNode[0];
      // let secondNode = currentNode[1];
      // let index = nodeNames.indexOf(firstNode);
      // let index2 = nodeNames.indexOf(secondNode);
      // let x1 = parseFloat(nodeLocations[index].substring(0, nodeLocations[index].indexOf(' ')));
      // let y1 = parseFloat(nodeLocations[index].substring(nodeLocations[index].indexOf(' ') + 1));
      // let x2 = parseFloat(nodeLocations[index2].substring(0, nodeLocations[index2].indexOf(' ')));
      // let y2 = parseFloat(nodeLocations[index2].substring(nodeLocations[index2].indexOf(' ') + 1));
      
    }
  };

  let shortestDistanceNode = (distances, visited) => {
    // create a default value for shortest
    let shortest = null;
    
      // for each node in the distances object
    for (let node in distances) {
        // if no node has been assigned to shortest yet
        // or if the current node's distance is smaller than the current shortest
      let currentIsShortest =
        shortest === null || distances[node] < distances[shortest];
            
        // and if the current node is in the unvisited set
      if (currentIsShortest && !visited.includes(node)) {
              // update shortest to be the current node
        shortest = node;
      }
    }
    return shortest;
  };

  let findShortestPath = (graph, startNode, endNode) => {
    // track distances from the start node using a hash object
      let distances = {};
    distances[endNode] = "Infinity";
    distances = Object.assign(distances, graph[startNode]);
   // track paths using a hash object
    let parents = { endNode: null };
    for (let child in graph[startNode]) {
     parents[child] = startNode;
    }
     
    // collect visited nodes
      let visited = [];
   // find the nearest node
      let node = shortestDistanceNode(distances, visited);
    
    // for that node:
    while (node) {
    // find its distance from the start node & its child nodes
     let distance = distances[node];
     let children = graph[node]; 
         
    // for each of those child nodes:
         for (let child in children) {
     
     // make sure each child node is not the start node
           if (String(child) === String(startNode)) {
             continue;
          } else {
             // save the distance from the start node to the child node
             let newdistance = distance + children[child];
   // if there's no recorded distance from the start node to the child node in the distances object
   // or if the recorded distance is shorter than the previously stored distance from the start node to the child node
             if (!distances[child] || distances[child] > newdistance) {
   // save the distance to the object
        distances[child] = newdistance;
   // record the path
        parents[child] = node;
       } 
            }
          }  
         // move the current node to the visited set
         visited.push(node);
   // move to the nearest neighbor node
         node = shortestDistanceNode(distances, visited);
       }
     
    // using the stored paths from start node to end node
    // record the shortest path
    let shortestPath = [endNode];
    let parent = parents[endNode];
    while (parent) {
     shortestPath.push(parent);
     parent = parents[parent];
    }
    shortestPath.reverse();
     
    //this is the shortest path
    // let results = {
    //  distance: distances[endNode],
    //  path: shortestPath,
    // };
    // return the shortest path & the end node's distance from the start node
      return shortestPath;
   };

   const navigate = () => {
    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    let tempShortestPath = findShortestPath(nodeObject, start, end);
    setShortestPath(tempShortestPath);
    const nodeNames = Object.keys(positions);
    const nodeLocations = Object.values(positions);
    ctx.strokeStyle = "red";
    for(let i = 0; i < tempShortestPath.length - 1; i++) {
      let index = nodeNames.indexOf(tempShortestPath[i]);
      let index2 = nodeNames.indexOf(tempShortestPath[i + 1]);
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
    setCurrentNode([tempShortestPath[0], tempShortestPath[1]]);
    setLength(0);
    let firstNode = tempShortestPath[0];
    let index = nodeNames.indexOf(firstNode);
    let x1 = parseFloat(nodeLocations[index].substring(0, nodeLocations[index].indexOf(' ')));
    let y1 = parseFloat(nodeLocations[index].substring(nodeLocations[index].indexOf(' ') + 1));
    setLocation({x: x1, y: y1});
    setIsNavigate(true);
   }

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
      <TouchableOpacity style={styles.btn} onPress={navigate}><Text style={styles.btnLabel}>Navigate</Text></TouchableOpacity>
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