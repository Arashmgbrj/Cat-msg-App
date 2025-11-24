import axios from "axios";
import { useEffect, useState, useRef } from "react";
import {
  ImageBackground,
  StyleSheet,
  Text,
  View,
  Animated,
  Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Login from "./components/Login/Login";
import MainPage from "./components/main/mainpage";
import Disconent from "./components/connection/disconnect";

export default function App() {
  const [isConnect, setIsConnect] = useState(false);
  const [isLogin, setIsLogin] = useState(false);
  // بخش 1: تعریف حالت‌های انیمیشن
  const characterTranslateX = useRef(new Animated.Value(0)).current;
  const catTranslateX = useRef(new Animated.Value(0)).current;

  // بخش 2: تابع شروع انیمیشن ( Loop رفت و برگشت)
  const startAnimation = () => {
    const moveDistance = 300; // مسافت حرکت
    const duration = 2000; // زمان کل رفت و برگشت

    const animation = Animated.loop(
      Animated.sequence([
        // حرکت به سمت راست
        Animated.parallel([
          Animated.timing(characterTranslateX, {
            toValue: moveDistance,
            duration: duration / 2,
            useNativeDriver: true,
          }),
          Animated.timing(catTranslateX, {
            toValue: moveDistance,
            duration: duration / 2,
            useNativeDriver: true,
          }),
        ]),
        // برگشتن به سمت چپ
        Animated.parallel([
          Animated.timing(characterTranslateX, {
            toValue: 0,
            duration: duration / 2,
            useNativeDriver: true,
          }),
          Animated.timing(catTranslateX, {
            toValue: 0,
            duration: duration / 2,
            useNativeDriver: true,
          }),
        ]),
      ])
    );
    animation.start();
  };

  // بررسی اتصال به اینترنت
  useEffect(() => {
    const CheckConnection = async () => {
      try {
        const response = await axios.get("https://ocrgood.ir/cat/");
        if (response.status === 200) {
          setIsConnect(true);
        } else {
          setIsConnect(false);
        }
      } catch (error) {
        setIsConnect(false);
      }
    };
    CheckConnection();
    startAnimation();
  }, []);

  // دریافت اطلاعات از حافظه AsyncStorage
  const getBread = async (name) => {
    try {
      const bread = await AsyncStorage.getItem(`@${name}`);
      if (bread !== null) {
        console.log("Bread:", bread);
        return bread;
      }
      return null;
    } catch (e) {
      console.error("Error reading bread", e);
      return null;
    }
  };

  // بررسی ورود به سیستم
  useEffect(() => {
    const CheckLogin = async () => {
      const token = await getBread("token");
      if (token) {
        const response = await axios.post(
          "https://ocrgood.ir/cat/checktoken",
          (data = { token: token })
        );
        if (response.status === 200) {
          setIsLogin(true);
        }
      } else {
        setIsLogin(false);
      }
    };
    CheckLogin();
  }, []);

  return (
    <View style={styles.main}>
      {isConnect ? (
        isLogin ? (
          <MainPage />
        ) : (
          <Login />
        )
      ) : (
        <ImageBackground
          style={{
            flex: 1,
            width: "100%",
            alignItems: "center",
            justifyContent: "center",
          }}
          source={require("./assets/connect.jpg")}
        >
          <Text
            style={{
              color: "white",
              fontSize: 30,
              fontWeight: "bold",
              textAlign: "center",
              alignItems: "center",
            }}
          >
            connecting to network please wait ......
          </Text>
          <View style={styles.animationContainer}>
            {/* کاراکتر */}
            <Animated.View
              style={{
                transform: [{ translateX: characterTranslateX }],
                position: "absolute",
              }}
            >
              <View style={styles.character} />
            </Animated.View>

            {/* گربه به عنوان آیکون */}
            <Animated.View
              style={{
                transform: [{ translateX: catTranslateX }],
                position: "absolute",
              }}
            >
              <Image
                source={require("./assets/connectcat.png")}
                style={{ width: 300, height: 150 }}
              />
            </Animated.View>
          </View>
        </ImageBackground>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: "#fff",
  },
  animationContainer: {
    position: "absolute",
    bottom: 50,
    width: "100%",
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  character: {
    width: 50,
    height: 50,
  },
});
