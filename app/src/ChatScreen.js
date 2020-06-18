import React, { useState, useEffect } from 'react';
import { TextInput, TouchableOpacity, TouchableWithoutFeedback, Keyboard, Text, View, KeyboardAvoidingView } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { useMutation } from '@apollo/client';
import { Messages } from './components/Messages';
import { POST_MESSAGE } from './constants/graphql';

export const ChatScreen = ({ navigation }) => {
  const [value, setText] = useState('');
  const [userId, setUserId] = useState('');
  const [username, setUsername] = useState('');

  useEffect(() => {
    AsyncStorage.getItem('userId', (_, result) => {
      setUserId(result);
    });
    AsyncStorage.getItem('username', (_, result) => {
      setUsername(result);
    });
  });
  const [addMessage] = useMutation(POST_MESSAGE);

  AsyncStorage.getItem('username', (_, result) => {
    navigation.setOptions({ title: result, headerLeft: null, headerRight: () => (
      <TouchableOpacity
            style={{
              paddingRight: 20
            }}
            onPress={() => {
              AsyncStorage.removeItem('username');
              AsyncStorage.removeItem('userId');
              navigation.navigate('Login');
            }}
          ><Text>Logout</Text>
        </TouchableOpacity>
    ), });
  });

  function OnSend() {
    if (value.length > 0) {
      addMessage({
        variables: { text: value, userId, username }
      });
    }
    setText('');
  }

  return (
      <KeyboardAvoidingView
      keyboardVerticalOffset={Platform.OS == "ios" ? 85 : null}
      behavior={Platform.OS == "ios" ? "padding" : null}
      style={{
        flex: 1,
        backgroundColor: '#ffffff'
      }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <>
      <Messages />
        <View style={{ bottom: 0, flexDirection: 'row', width: '100%' }}>
        <TextInput
            autoFocus
            onSubmitEditing={() => OnSend()}
            blurOnSubmit={false}
            placeholder=" message"
            style={{
              backgroundColor: '#f5f5f5',
              height: 50,
              width: '80%',
              paddingLeft: 20
            }}
            onChangeText={(text) => setText(text)}
            value={value}
          />
          <TouchableOpacity
            style={{
              backgroundColor: '#f5f5f5',
              width: '20%',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onPress={() => OnSend()}
          ><Text style={{fontSize: 36}}></Text></TouchableOpacity>
          </View>
          </>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};
