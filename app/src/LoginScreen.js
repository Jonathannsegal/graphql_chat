import React, { useState, useEffect } from 'react';
import { Text, Button, TouchableWithoutFeedback, Keyboard, View, TextInput, KeyboardAvoidingView } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { useMutation } from '@apollo/client';
import { ADD_USER } from './constants/graphql';

export const LoginScreen = ({ navigation }) => {
  useEffect(() => {
    AsyncStorage.getItem('userId', (_, result) => {
      if (result !== null){
        navigation.navigate("Chat");
      }
    });
  });
  const [value, setUsername] = useState('');
  const [AddUser] = useMutation(ADD_USER);

  function OnSend() {
    if (value.length > 0) {
      try {
        AddUser({ variables: { username: value } }).then((user) => {
          AsyncStorage.setItem('username', user.data.addUser.username);
          AsyncStorage.setItem('userId', user.data.addUser._id);
        });
        navigation.navigate('Chat');
      } catch (error) {
        console.log(error);
      }
    }
    setUsername('');
  }

  return (
    <KeyboardAvoidingView keyboardVerticalOffset={60}
      behavior={Platform.OS == "ios" ? "padding" : "height"}
      style={{
        flex: 1,
        backgroundColor: '#ffffff'
      }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{
          padding: 24,
          flex: 1,
          justifyContent: "space-around"
        }}>
          <Text style={{
            fontSize: 36,
            marginBottom: 0
          }}>Login 🔒</Text>
            <TextInput
              autoFocus
              onSubmitEditing={() => OnSend()}
              placeholder=" Username"
              style={{
                height: 40,
                borderBottomWidth: 1,
                marginBottom: 40
              }}
              onChangeText={(username) => setUsername(username)}
              value={value}
            />
          <View 
            style={{
                backgroundColor: "white",
                marginTop: 0
              }}
          >
            <Button title="Go to Chat" onPress={() => OnSend()} />
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};
