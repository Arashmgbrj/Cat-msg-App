import axios from 'axios';
import { useEffect, useState } from 'react';
import { StyleSheet, View, ImageBackground, TouchableOpacity, Animated, Text, Image, ScrollView, TextInput,StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome5';
import MainPage from '../main/mainpage';

const backgrounds = {
  dark: require('../../assets/bgdark.jpg'),
  light: require('../../assets/bglight.jpg'),
};

const Chat = () => {
  const [chat_id, setchat_id] = useState(null);
  const [ishome, setishome] = useState(true);
  const [bg, setBg] = useState(backgrounds.dark);
  const [animationValue] = useState(new Animated.Value(0));
  const [userinfo, setuserinfo] = useState({});
  const [chatinfo, setchatinfo] = useState([]);
  const [isActive, setIsActive] = useState(true);
  const [name_rec,setname_rec] = useState("");

  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const id = await getBread("chat_user");
        if (!id) return; // جلوگیری از درخواست نامعتبر

        const response = await axios.get(`https://ocrgood.ir/cat/receverinfo/${id}`);
        if (response.status === 200) {
          setuserinfo(response.data['result']);
          console.log(response.data['result']);
          
          setname_rec(response.data['result']['receiver'])
          console.log(`https://ocrgood.ir/cat/images/${userinfo.img}`);
          if (userinfo === null || (Array.isArray(userinfo) && userinfo.length === 0)) {
            setIsActive(false);
            setishome(false);
            
          }
          
        } else {
          console.warn("No connection");
             setIsActive(false);
             setishome(false);

        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setIsActive(false);
        setishome(false);
      }
    };

    const fetchChatData = async () => {
      try {
        const id = await getBread("chat_user");
        const token_re = await getBread("token");
        if (!id || !token_re) return;

        const response = await axios.get(`https://ocrgood.ir/cat/getchatsuser/${token_re}/${id}`);
        if (response.status === 200) {
          setchatinfo(response.data['result']);
        } else {
          console.warn("No connection");
          setishome(false)
        }
      } catch (error) {
        console.error("Error fetching chat data:", error);
        setishome(false)
      }
    };
    const interval = setInterval(() => {
      fetchUserData();
      fetchChatData();
    }, 1000);
  
    // پاکسازی interval هنگام خروج از کامپوننت
    return () => clearInterval(interval);

    // پاکسازی و اجرای مجدد هنگام تغییر chat_id
  }, [chat_id]);

  const handleSend = async () => {
    const recever = await getBread("chat_user");
    const token_sender = await getBread("token");

    if (!message.trim()) {
      alert("پیام نمی‌تواند خالی باشد!");
      return;
    }

    try {
      const response = await axios.post("https://ocrgood.ir/cat/addchat", {
        text: message,
        token: token_sender,
        id: recever
      });

      if (response.status === 201) {
        setMessage('');
      } else {
        alert("خطا در ارسال پیام!");
      }
    } catch (error) {
      console.error("خطا در ارسال پیام:", error);
      alert("مشکلی در ارسال پیام وجود دارد!");
    }
  };

  const getBread = async (name) => {
    try {
      const bread = await AsyncStorage.getItem(`@${name}`);
      return bread || null;
    } catch (e) {
      console.error('Error reading bread', e);
      return null;
    }
  };

  const handback = async () => {
    setchat_id(await getBread("chat_user"));
    setIsActive(false);
    setishome(false);
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

  return ishome ? (
    <ImageBackground source={bg} style={styles.background} resizeMode="cover">
      <StatusBar barStyle="light-content" backgroundColor="#2980b9" />

      <View style={styles.main}>
        <View style={bg === backgrounds.dark ? styles.upmain : styles.upmainlight}>
          <View style={{ flexDirection: "row", alignItems: "center",marginTop:40,padding:5 }}>
            <Image
              source={{ uri: `https://ocrgood.ir/cat/images/${userinfo.img}` }} 
              style={{ width: 50, height: 50, borderRadius: 50, marginRight: 10, borderColor: bg === backgrounds.dark ? "white" : "rgb(137, 61, 156)", borderWidth: 2 }}
            />
            <View>
              <Text style={{ color: bg === backgrounds.dark ? "white" : "rgb(137, 61, 156)", fontWeight: "bold", fontSize: 10 }}>{userinfo?.username || "کاربر"}</Text>
              <Text style={{ color: bg === backgrounds.dark ? "white" : "rgb(137, 61, 156)", fontSize: 8 }}>  {userinfo?.bio ? userinfo.bio.substring(0, 15) + (userinfo.bio.length > 20 ? "..." : "") : "کاربر"}</Text>
            </View>
          </View>

          <View style={{ flexDirection: "row" }}>
            <TouchableOpacity onPress={handleIconPress}>
              <Icon name="paw" size={40} color={bg === backgrounds.dark ? "#fff" : "rgb(137, 61, 156)"} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handback} style={{ marginLeft: 10 }}>
              <Icon name="arrow-right" size={40} color={bg === backgrounds.dark ? "#fff" : "rgb(137, 61, 156)"} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView>
          <View style={styles.apiContainer}>
            {chatinfo.length > 0 ? (
              chatinfo.map((item, index) => (
                <View key={index} style={bg === backgrounds.dark ? styles.apiItem : styles.apiItemli}>
                  <Text style={{color:"white",fontWeight:"bold"}}>{item.sender}:</Text>
                  <Text style={{color:"#202124",fontWeight:"bold"}}> {item.message}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.loadingText}>start Chat.......</Text>
            )}
          </View>
        </ScrollView>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="پیام خود را بنویسید..."
            placeholderTextColor="#aaa"
            value={message}
            onChangeText={setMessage}
          />
          <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
            <Icon name="paper-plane" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  ) : (
    <MainPage />
  );
};

export default Chat;


const styles = StyleSheet.create({
  background: { flex: 1 },
  main: { flex: 1, marginTop: 30, padding: 20 },
  upmain: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: "rgba(24, 0, 86, 0.9)",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "white",
    width:390,
    position:"relative",
    right:24,
    
    bottom:50
  },
  upmainlight: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: "#75BFFF",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "white",
    width:400,
    position:"relative",
    right:24,
    bottom:49
  },
  apiContainer: { marginTop: 20 },
  apiItem: {
    backgroundColor: 'rgba(206, 197, 197, 0.39)',
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  apiItemli: {
    backgroundColor: 'rgba(131, 105, 167, 0.39)',
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  apiTitle: { fontWeight: 'bold', fontSize: 15, maxWidth: 150, color: "white" },
  apiBody: { fontSize: 14, color: 'gray', maxWidth: 200, marginTop: 5 },
  date: { color: "white", textAlign: 'right' },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#ddd',
    
    
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingHorizontal: 15,
    backgroundColor: '#f9f9f9',
  },
  sendButton: {
    marginLeft: 10,
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 20,
  },
  loadingText:{
    color:"white",
    fontSize:20,
    alignItems:"center",
    justifyContent:"center",
    textAlign:"center"
  }
});
