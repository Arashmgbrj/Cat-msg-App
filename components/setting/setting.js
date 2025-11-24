import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ImageBackground, TouchableOpacity, Text, Image, TextInput, StatusBar } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MainPage from '../main/mainpage';
import axios from 'axios';

const Setting = () => {
  const [image, setImage] = useState(null);
  const [ishome, setIshome] = useState(true);
  const [fetchdata, setfetchdata] = useState(false);
  const [userinfo, setUserinfo] = useState({});
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [phone, setPhone] = useState("");
  const saveBread = async (name, value) => {
    try {
      await AsyncStorage.setItem(`@${name}`, value);
      console.log('Value saved');
      return true;
    } catch (e) {
      console.error('Error saving bread', e);
      return false;
    }
  };

  const getBread = async (name) => {
    try {
      const bread = await AsyncStorage.getItem(`@${name}`);
      return bread !== null ? bread : null;
    } catch (e) {
      console.error('Error reading bread', e);
      return null;
    }
  };
  const Back = () => {
    setIshome(false)
  }

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      await AsyncStorage.setItem('@profile_image', result.assets[0].uri);
    }
  };

  const removeBread = async (name) => {
    try {
      await AsyncStorage.removeItem(`@${name}`);
      console.log(`Bread با نام ${name} حذف شد.`);
    } catch (e) {
      console.error('Error removing bread', e);
    }
  };

  const Logout = async () => {
    try {
      await removeBread("token");
      await removeBread("chat_user");
      setIshome(false)
    } catch (error) {
      console.log("not connect server");
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await getBread('token');
        const response = await axios.post("https://ocrgood.ir/cat/userinfo", { "token": token });

        if (response.status === 200) {
          setUserinfo(response.data['result']);
          setUsername(response.data['result'].name || "");
          setBio(response.data['result'].bio || "");
          setPhone(response.data['result'].ph || "");
          setfetchdata(true)
          console.log(response.data['result']);
        } else {
          alert("Not Correct Token");
        }
      } catch (error) {
        alert("Not Correct Token");
      }
    };

    fetchData();
  }, [fetchdata]);

  const handleSave = async () => {
    const token = await getBread("token");
    const userData = new FormData();
    userData.append("id", userinfo.id);
    userData.append("bio", bio);
    userData.append("username", username);
    userData.append('token', token);

    if (image) {
      const localUri = image;
      const filename = localUri.split("/").pop();
      const type = `image/${filename.split(".")[1]}`;

      userData.append("img", {
        uri: localUri,
        name: filename,
        type: type,
      });
    }

    console.log("Sending User Data with Image:", userData);
    setfetchdata(false);

    try {
      const response = await axios.post("https://ocrgood.ir/cat/edituser", userData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200) {
        alert("User data updated successfully!");
        console.log(response.data);
      } else {
        alert("Failed to update user data.");
      }
    } catch (error) {
      console.error("Error updating user data:", error);
      alert("Error updating user data.");
    }
  };

  return ishome ? (
    <ImageBackground source={require("../../assets/settingbag.jpg")} style={styles.background} resizeMode="cover">
      <StatusBar barStyle="light-content" backgroundColor="#2980b9" />
      <View style={styles.container}>
        {image ? (
          <Image source={{ uri: image }} style={styles.image} />
        ) : userinfo.img ? (
          <Image source={{ uri: `https://ocrgood.ir/cat/${userinfo.img}` }} style={styles.image} />
        ) : (
          <Image source={require("../../assets/icon.png")} style={styles.image} />
        )}

        <TouchableOpacity onPress={pickImage} style={styles.button}>
          <Text style={styles.buttonText}>Chose Picture</Text>
        </TouchableOpacity>

        <TextInput style={styles.input} placeholder="Username" placeholderTextColor="#ccc" value={username} onChangeText={setUsername} />
        <TextInput style={styles.input} placeholder="Bio" placeholderTextColor="#ccc" value={bio} onChangeText={setBio} multiline />
        <TextInput style={styles.input} placeholder="Phone Number" placeholderTextColor="#ccc" value={phone} onChangeText={setPhone} editable={false} keyboardType="phone-pad" />
        
        <View style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexDirection: "row" }}>
          <TouchableOpacity onPress={handleSave} style={styles.button}>
            <Text style={styles.buttonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={Back} style={styles.button}>
            <Text style={styles.buttonText}>Back</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={Logout} style={styles.button}>
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  ) : (
    <MainPage />
  );
};

export default Setting;

const styles = StyleSheet.create({
  background: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  container: {
    alignItems: "center",
    marginBottom: 230,
  },
  button: {
    backgroundColor: "#6200ea",
    padding: 10,
    borderRadius: 5,
    marginVertical: 10,
    margin: 30,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 5,
    borderColor: "rgba(224, 14, 243, 0.54)",
    alignSelf: "center",
  },
  input: {
    width: 300,
    height: 40,
    backgroundColor: "rgba(224, 14, 243, 0.54)",
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
    color: "white",
  },
});