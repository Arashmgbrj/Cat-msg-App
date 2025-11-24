import axios from 'axios';
import { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  ImageBackground,
  TouchableOpacity,
  Animated,
  Text,
  Image,
  ScrollView,
  StatusBar
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome5';
import Search from '../search/search';
import Login from '../Login/Login';
import Setting from '../setting/setting';
import Chat from '../chat/chat';

const backgrounds = {
  dark: require('../../assets/bgdark.jpg'),
  light: require('../../assets/bglight.jpg'),
};

export default function MainPage() {
  const [isConnect, setIsConnect] = useState(false);
  const [isLogin, setIsLogin] = useState(false);
  const [bg, setBg] = useState(backgrounds.dark);
  const [animationValue] = useState(new Animated.Value(0));
  const [apiData, setApiData] = useState([]);
  const [search, setSearch] = useState(true);
  const [isSetting, setIsSetting] = useState(true);
  const [chat, setChat] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await getBread("token");
        setIsLogin(!!token);
        console.log(`https://your_domain/cat/getchats/${token}`);
        
        
        const response = await axios.get(`https://your_domain/cat/getchats/${token}`);
        
        setApiData((prevData) => {
          // اضافه کردن پیام‌های جدید به لیست
          return [...response.data.result];
          
        });
        
      } catch (error) {
        console.error('Error fetching data from API', error);
      }
    };

    const checkConnection = async () => {
      try {
        const response = await axios.get("https://your_domain");
        setIsConnect(response.status === 200);
      } catch {
        setIsConnect(false);
      }
    };

    fetchData();
    checkConnection();
    // const interval = setInterval(() => {
    //   fetchData();
    //   checkConnection();
    // }, 1000);  // هر 1 ثانیه پیام‌ها و وضعیت اتصال را بررسی می‌کند

    // // پاکسازی interval هنگام خروج از کامپوننت
    // return () => clearInterval(interval);
  },[]);

  const getBread = async (name) => {
    try {
      return await AsyncStorage.getItem(`@${name}`);
    } catch (e) {
      console.error('Error reading storage', e);
      return null;
    }
  };

  const saveBread = async (name, value) => {
    try {
      await AsyncStorage.setItem(`@${name}`, String(value));
      console.log('Value saved:', value);
    } catch (e) {
      console.error('Error saving bread', e);
    }
  };

  const handleIconPress = () => {
    Animated.timing(animationValue, {
      toValue: 1,
      duration: 50,
      useNativeDriver: false,
    }).start(() => {
      setBg(bg === backgrounds.dark ? backgrounds.light : backgrounds.dark);
      animationValue.setValue(0);
    });
  };

  const goToChat = async (id) => {
    setChat(true);
    await saveBread("chat_user", id);
    console.log("Navigating to chat...");
  };

  if (!isLogin) return <Login />;
  if (!search) return <Search />;
  if (!isSetting) return <Setting />;
  if (chat) return <Chat />;

  return (
    <ImageBackground source={bg} style={styles.background} resizeMode="cover">
      <StatusBar barStyle="light-content" backgroundColor="#2980b9" />
      <View style={styles.main}>
        <View style={styles.upMain}>
          <TouchableOpacity onPress={() => setSearch(!search)}>
            <Icon name="search" size={30} color="#fff" style={styles.icon} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleIconPress}>
            <Icon name="paw" size={50} color="#fff" style={styles.icon} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setIsSetting(false)}>
            <Icon name="cogs" size={30} color="#fff" style={styles.icon} />
          </TouchableOpacity>
        </View>
        <ScrollView>
          <View style={styles.apiContainer}>
            {apiData.length > 0 ? (
              apiData.slice(0, 5).map((item) => (
                <TouchableOpacity key={item.id} onPress={() => goToChat(item.id)}>
                  <View style={styles.apiItem}>
                    <Image source={{ uri: `https://ocrgood.ir/cat/images/${item.img}` }} style={styles.avatar} />
                    <View>
                      <Text style={styles.apiTitle}>{item.username}</Text>
                      <Text style={styles.apiBody}>{item.bio}</Text>
                      <Text style={styles.date}>Chat....</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.loadingText}>پیامی وجود ندارد</Text>
            )}
          </View>
        </ScrollView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  upMain: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  main: {
    flex: 1,
    marginTop: 30,
    padding: 20,
  },
  icon: {
    fontSize: 40,
  },
  apiContainer: {
    marginTop: 20,
  },
  apiItem: {
    backgroundColor: 'rgba(206, 197, 197, 0.39)',
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  apiTitle: {
    fontWeight: 'bold',
    fontSize: 15,
    maxWidth: 150,
    color: 'white',
  },
  apiBody: {
    fontSize: 14,
    color: 'gray',
    maxWidth: 200,
    marginTop: 5,
  },
  date: {
    position: 'absolute',
    left: 200,
    color: 'white',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 50,
    marginRight: 10,
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
    color: 'white',
  },
});
