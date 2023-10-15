import { useNavigation } from '@react-navigation/core'
import React, { useEffect, useState } from 'react'
import { KeyboardAvoidingView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { auth} from '../firebase'
import {  createUserWithEmailAndPassword ,signInWithEmailAndPassword} from 'firebase/auth';

const LoginScreen = () => {
    const [email,setEmail]= useState('')
    const [password,setPassword]= useState('')
    const navigation = useNavigation()
    
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(user => {
          if (user) {
            navigation.replace("Tab")
          }
        })
        return unsubscribe
      }, [])

    const handleSignUp = () => {
        createUserWithEmailAndPassword(auth, email, password) 
          .then(userCredential => {
            const user = userCredential.user;
            console.log('Registered with:', user.email);
          })
          .catch(error => alert(error.message));
      };
      const handleLogin = () => {
        signInWithEmailAndPassword(auth,email, password) 
          .then(userCredential => {
            const user = userCredential.user;
            console.log('Logged in with:', user.email);
          })
          .catch(error => alert(error.message));
      };
  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
        <View style={styles.inputContainer}>
            <TextInput
                placeholder='Email'
                value={email}
                onChangeText={text=>setEmail(text)}
                style={styles.input}
            />
            <TextInput
                placeholder='Password'
                value={password}
                onChangeText={text=>setPassword(text)}
                style={styles.input}
                secureTextEntry
            />
        </View>
        <View style={styles.buttonContainer}>
            <TouchableOpacity
                onPress={handleLogin}
                style={styles.button}
            >
            <Text style={styles.buttonText}>로그인</Text>
            </TouchableOpacity>
            <TouchableOpacity
                onPress={handleSignUp}
                style={[styles.button, styles.buttonOutline]}
            >
            <Text style={styles.buttonOutlineText}>회원가입</Text>
            </TouchableOpacity>
        </View>
    </KeyboardAvoidingView>
  )
}

export default LoginScreen

const styles = StyleSheet.create({
  container:{
    flex:1,
    justifyContent:'center',
    alignItems:'center',
    backgroundColor: '#F5FFFA', 
  },
  inputContainer: {
    width: '80%',
    backgroundColor: '#F5FFFA', 
  },
  input: {
    backgroundColor: '#FFFFFF', 
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 5,
    borderColor: '#556B2F', 
    borderWidth: 2,
    color: 'black', 
  },
  buttonContainer: {
    width: '60%',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  button: {
    backgroundColor: '#556B2F', 
    width: '100%',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonOutline: {
    backgroundColor: '#FFFFFF', 
    marginTop: 5,
    borderColor: '#556B2F', 
    borderWidth: 2,
  },
  buttonText: {
    color: '#FFFFFF', 
    fontWeight: '700',
    fontSize: 16,
  },
  buttonOutlineText: {
    color: '#556B2F', 
    fontWeight: '700',
    fontSize: 16,
  },
});
