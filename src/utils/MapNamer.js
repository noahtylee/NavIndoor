import { StatusBar } from 'expo-status-bar';
import React, {useState} from 'react'
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Image } from 'react-native';
import Icon from 'react-native-vector-icons/AntDesign'
import Icon2 from 'react-native-vector-icons/Feather'
import { ref, onValue } from 'firebase/database'
import {database} from '../../FirebaseConfig'
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Login({navigation}) {
  const [pass, onChangePass] = useState('');

  const handleSubmit = async () => {
    if(pass != '') {
        storeData('mapName', pass)
        navigation.navigate('MapCreator');
    }
  }

  const storeData = async (keyName, value) => {
    try {
      await AsyncStorage.setItem(keyName, value);
    } catch (e) {
      // saving error
    }
  };

  return (
    <View style={styles.container}>
        <View style={styles.pass}>
          <TextInput
            style={styles.input}
            onChangeText={onChangePass}
            value={pass}
            placeholder="Map Name"
            keyboardType="default"
          />
        </View>
        <TouchableOpacity style={styles.btn} onPress={handleSubmit}>
            <Text style={styles.btnLabel}>Save Name</Text>
        </TouchableOpacity>
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
  logo: {
    height: '20%',
    width: '50%',
  },
  user: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  pass: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    height: 50,
    width: '70%',
    margin: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'grey',
    padding: 10,
    fontSize: 20,
    backgroundColor: '#fff',
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
  extra: {
    paddingTop: 20,
    fontSize: 16,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
    color: 'purple',
  }
});
