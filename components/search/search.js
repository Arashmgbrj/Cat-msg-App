import React, { useState } from 'react';
import axios from 'axios';
import { StyleSheet, View, ImageBackground, TextInput, FlatList, Text, Image, TouchableOpacity,StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MainPage from '../main/mainpage';
import Chat from '../chat/chat';

export default function Search() {
  const [searchText, setSearchText] = useState('');
  const [apiData, setApiData] = useState([]);
  const [back, setBack] = useState(true);
  const [isChat, setIsChat] = useState(true);

  // تابع جستجو
  const handleSearch = async (text) => {
    setSearchText(text);
    if (text.length > 0) {
      try {
        const response = await axios.get(`https://your_domain/finduser/${text}`);
        setApiData(response.data);
      } catch (error) {
        console.error('Error fetching data', error);
      }
    } else {
      setApiData([]);
    }
  };

  // ذخیره مقدار در AsyncStorage
  const saveBread = async (name, value) => {
    try {
      await AsyncStorage.setItem(`@${name}`, String(value));
      console.log('Value saved:', value);
    } catch (e) {
      console.error('Error saving bread', e);
    }
  };

  // دریافت مقدار از AsyncStorage
  const getBread = async (name) => {
    try {
      const bread = await AsyncStorage.getItem(`@${name}`);
      return bread !== null ? bread : null;
    } catch (e) {
      console.error('Error reading bread', e);
      return null;
    }
  };

  // حذف مقدار از AsyncStorage
  const removeBread = async (name) => {
    try {
      await AsyncStorage.removeItem(`@${name}`);
      console.log(`Bread با نام ${name} حذف شد.`);
    } catch (e) {
      console.error('Error removing bread', e);
    }
  };

  // رویداد کلیک روی آیتم
  const handleItemPress = async (item) => {
    await saveBread("chat_user", item.id);
    setIsChat(false);
    console.log("Chat started with user ID:", item.id);
  };

  // رویداد کلیک روی دکمه بازگشت
  const handleIconPress = () => {
    setBack(false);
  };

  return (
    <>
      {back ? (
        isChat ? (
          <ImageBackground source={require("../../assets/ser.jpg")} style={styles.background} resizeMode="cover">
            <StatusBar barStyle="light-content" backgroundColor="#2980b9" />
            
            <View style={styles.container}>
              {/* هدر */}
              <View style={styles.header}>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search..."
                  value={searchText}
                  onChangeText={handleSearch}
                />
                <TouchableOpacity onPress={handleIconPress} style={styles.backButton}>
                  <Text style={styles.backText}>Back</Text>
                </TouchableOpacity>
              </View>

              {/* نمایش نتایج */}
              <FlatList
                data={apiData}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity onPress={() => handleItemPress(item)} style={styles.apiItem}>
                    <Image source={{ uri: `https://ocrgood.ir/cat/${item.img}` }} style={styles.apiImage} />
                    <View style={styles.apiTextContainer}>
                      <Text style={styles.apiTitle} numberOfLines={1}>{item.username}</Text>
                      <Text style={styles.apiBody} numberOfLines={1}>{item.bio}</Text>
                      <Text style={styles.date}>chat...</Text>
                    </View>
                  </TouchableOpacity>
                )}
              />
            </View>
          </ImageBackground>
        ) : (
          <Chat />
        )
      ) : (
        <MainPage />
      )}
    </>
  );
}

// استایل‌ها
const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  searchInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    paddingLeft: 10,
    marginBottom: 20,
    width: 300,
    borderRadius: 5,
    backgroundColor: "rgba(206, 197, 197, 0.39)",
    marginTop: 30,
  },
  backButton: {
    backgroundColor: "rgba(88, 64, 95, 0.39)",
    padding: 10,
    borderRadius: 30,
  },
  backText: {
    color: "white",
    fontWeight: "bold",
  },
  apiItem: {
    backgroundColor: 'rgba(206, 197, 197, 0.39)',
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  apiImage: {
    width: 50,
    height: 50,
    borderRadius: 50,
    marginRight: 10,
  },
  apiTextContainer: {
    flexDirection: 'column',
  },
  apiTitle: {
    fontWeight: 'bold',
    fontSize: 15,
    maxWidth: 150,
    color: 'white',
  },
  apiBody: {
    fontSize: 14,
    color: 'white',
    maxWidth: 250,
  },
  date: {
    position: 'relative',
    left: 230,
    color: 'white',
  },
});
