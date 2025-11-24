import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ImageBackground, TextInput, TouchableOpacity, Image,StatusBar } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5'; // آیکون‌ها
import App from '../../App';
import MainPage from '../main/mainpage';
import AsyncStorage from '@react-native-async-storage/async-storage';


export default function Login() {
  const [email, setEmail] = useState('');  // ایمیل فعلی
  const [verificationCode, setVerificationCode] = useState(['', '', '', '']); // 4 تا input برای کد تایید
  const [isEmailValid, setIsEmailValid] = useState(false); // وضعیت تایید ایمیل
  const [isCodeVisible, setIsCodeVisible] = useState(false); // وضعیت نمایش کد تایید
  const [timer, setTimer] = useState(10); // تایمر برای 1 دقیقه
  const [isTimerVisible, setIsTimerVisible] = useState(false); // وضعیت نمایش تایمر
  const [showResendButton, setShowResendButton] = useState(false); // وضعیت نمایش دکمه ارسال مجدد
  const [isEditingEmail, setIsEditingEmail] = useState(false); // وضعیت ویرایش ایمیل
  const [isMain,setisMain] = useState(false);
  const [islogin,setIsLogin] = useState(false);
  

  useEffect(() => {
    let interval;
    if (timer > 0 && isCodeVisible) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setShowResendButton(true); // نمایش دکمه ارسال مجدد بعد از تایم 1 دقیقه
    }

    return () => clearInterval(interval);
  }, [timer, isCodeVisible]);
  useEffect(()=>{

    const CheckLogin = async () => {
      const token = await getBread("token");
      if (token) {
        setIsLogin(true);
      } else {
        setIsLogin(false);
      }
    };
    CheckLogin();

  },[])

  const handleEmailValidation = async () => {
    // استفاده از Regex برای اعتبار سنجی شماره تلفن
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      // ارسال درخواست به سرور برای ارسال کد تایید
      try {
        const response = await axios.post("https://your_domain/cat/adduser", { email });
        if (response.status === 201) {
          console.log(response.data);
          
          setIsCodeVisible(true); // نمایش ورودی‌های تایید کد
          setTimer(60); // ریست کردن تایمر به 1 دقیقه
          setIsEmailValid(true);
        } else {
          alert("Error: " + response.data);
        }
      } catch (error) {
        alert("Error: " + error.message);
      }
    } else {
      alert("Please enter a valid Email Address");
    }
  };
  

  const handleCodeChange = (text, index) => {
    const updatedCode = [...verificationCode];
    updatedCode[index] = text;
    setVerificationCode(updatedCode);
  };
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
      if (bread !== null) {
        console.log('Bread:', bread);
        const br = bread
        return br;
      }
      return null;
    } catch (e) {
      console.error('Error reading bread', e);
      return null;
    }
  };

  const handleLogin = async () => {
    const code = verificationCode.join('');
    console.log(code.length);
    console.log(email);

    if (code.length === 4) {
        console.log("Sending request...");

        const data_send_v = {
            'code': code,
            "email": email
        };

        try {
            const response = await fetch("https://your_domain/cat/validatecode", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data_send_v)
            });

            console.log(response.status);

            if (response.ok) { 
               
                const resData = await response.json();
                const token = resData['result'];
                console.log(token);
                
                await saveBread('token', token);

                setisMain(true);
              
                console.log(await getBread("token"));
                
                alert('Welcome');
            } else if (response.status === 500) {
                alert('You are banned and cannot use this platform');
            } else {
                alert('Login failed. Please try again.');
            }

        } catch (error) {
            console.error("Error during login:", error);
            alert('An error occurred. Please try again later.');
        }
    } else {
        alert("لطفاً کد تایید را کامل وارد کنید.");
    }
};


  const handleResendCode = async() => {
    const data_send_v = {
      "email": email,
      
     };
    try {
      const response = await fetch("https://your_domain/cat/resetcode", {
          method: "POST",
          headers: {
              "Content-Type": "application/json"
          },
          body: JSON.stringify(data_send_v)
      });

      console.log(response.status);

      if (response.ok) { 
         
          const resData = await response.json();
          console.log(`data=====>$`);
          
          const token = resData['result'];
          
          
        
          
      } else if (response.status === 500) {
          alert('You are banned and cannot use this platform');
      } else {
          alert('Login failed. Please try again.');
      }

    }  catch (error) {
      console.error("Error during login:", error);
      alert('An error occurred. Please try again later.');
    }
    // ارسال کد تایید مجدد به ایمیل
    console.log("ارسال کد تایید مجدد به ایمیل");
    setTimer(60); // ریست کردن تایمر
    setShowResendButton(false); // مخفی کردن دکمه ارسال مجدد
  };

  const handleEditEmail = () => {
    setIsEmailValid(false); // ریست کردن وضعیت تایید ایمیل
    setIsCodeVisible(false); // مخفی کردن کد تایید
    setTimer(10); // تنظیم تایمر به مقدار پیش فرض
    setShowResendButton(false); // مخفی کردن دکمه ارسال مجدد
  };


  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#2980b9" />

      {islogin ? (
        <MainPage />
      ) : (
        isMain ? (
          <MainPage />
        ) : (
          <ImageBackground
            source={require('../../assets/loginbg.jpg')}
            style={styles.background}
            resizeMode="cover"
          >

            <View style={styles.container}>
              <Image source={require('../../assets/icon.png')} style={styles.image} />
              <Text style={styles.text}>Login</Text>
  
              {!isCodeVisible ? (
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor="#FFA173"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                  editable={!isEditingEmail}
                />
              ) : (
                <View style={styles.codeContainer}>
                  {verificationCode.map((digit, index) => (
                    <TextInput
                      key={index}
                      style={styles.codeInput}
                      placeholder="0"
                      placeholderTextColor="#ddd"
                      keyboardType="numeric"
                      maxLength={1}
                      value={digit}
                      onChangeText={(text) => handleCodeChange(text, index)}
                    />
                  ))}
                </View>
              )}
  
              <View style={styles.emailAndTimerContainer}>
                {isCodeVisible && !showResendButton && (
                  <Text style={styles.timerText}>Timer: {timer}</Text>
                )}
                {isCodeVisible && !showResendButton && !isEditingEmail && (
                  <TouchableOpacity style={styles.buttonedit} onPress={handleEditEmail}>
                    <Icon name="pen" size={20} color="#fff" style={styles.icon} />
                    <Text style={styles.buttonText}>Edit</Text>
                  </TouchableOpacity>
                )}
              </View>
  
              <TouchableOpacity style={styles.button} onPress={isEmailValid ? handleLogin : handleEmailValidation}>
                <Icon name="paw" size={20} color="#fff" style={styles.icon} />
                <Text style={styles.buttonText}>{isEmailValid ? "Submit Code" : "Login"}</Text>
              </TouchableOpacity>
  
              {showResendButton && (
                <TouchableOpacity style={styles.resendButton} onPress={handleResendCode}>
                  <Text style={styles.resendButtonText}>send regester code again</Text>
                </TouchableOpacity>
              )}
  
              {isEditingEmail && (
                <View style={styles.editEmailContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter new email"
                    placeholderTextColor="#FFA173"
                    keyboardType="email-address"
                    value={newEmail}
                    onChangeText={setNewEmail}
                  />
                  <TouchableOpacity style={styles.button} onPress={handleSaveNewEmail}>
                    <Text style={styles.buttonText}>Save new email</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </ImageBackground>
        )
      )}
    </>
  );
  }

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
  },
  text: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '80%',
    height: 50,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#000',
    marginBottom: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFA173',
    width: '80%',
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
  },
  buttonedit:{
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFA173',
    width: '40%',
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    
  },
  icon: {
    marginRight: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  image: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginBottom: 20,
  },
  codeInput: {
    width: '20%',
    height: 50,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 10,
    textAlign: 'center',
    fontSize: 20,
    color: '#000',
  },
  timerText: {
    fontSize: 18,
    color: '#fff',
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFA173',
    width: '40%',
    height: "auto",
    padding:12,
    position:"relative",
    bottom:8,
    alignItems:"center",
    justifyContent:"center",
    borderRadius: 10,
    justifyContent: 'center',
    fontWeight:"bold"
  },
  resendButton: {
    marginTop: 20,
    backgroundColor: '#FFA173',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  resendButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  emailAndTimerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginBottom: 20,
  },
  editEmailContainer: {
    marginTop: 20,
    width: '80%',
  },
});
