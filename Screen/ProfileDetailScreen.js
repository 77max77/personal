import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Button, StyleSheet } from 'react-native';
import { addDoc, collection, getDocs, query, serverTimestamp } from 'firebase/firestore';
import { fireStoreJob, auth } from '../firebase';

const ProfileDetailScreen = ({ route, navigation }) => {
  const { pname } = route.params;
  const [newMessageName, setNewMessageName] = useState('');
  const [messages, setMessages] = useState([]);
  let lastButtonClickTime = null;

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const q = query(collection(fireStoreJob, auth.currentUser?.email, pname, 'buttons'));
        const querySnapshot = await getDocs(q);
        const loadedMessages = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return { id: doc.id, message: data.message };
        });
        setMessages(loadedMessages);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };
    fetchMessages();
  }, [pname]);

  const handleRegisterMessage = async () => {
    if (newMessageName.trim() !== '') {
      try {
        const newMessage = {
          message: newMessageName.trim(),
        };
        const profileCollectionRef = collection(fireStoreJob, auth.currentUser?.email, pname, 'buttons');
        await addDoc(profileCollectionRef, newMessage);
        setNewMessageName('');
        setMessages([...messages, newMessage]);
      } catch (error) {
        console.error('Error registering message:', error);
      }
    }
  };

  const handleButtonClick = async (message) => {
    const now = new Date();

    if (!lastButtonClickTime || now - lastButtonClickTime > 60 * 1000) {
      try {
        const profileCollectionRef = collection(fireStoreJob, auth.currentUser?.email, pname, 'timeline');
        await addDoc(profileCollectionRef, { title: message, time: serverTimestamp() });
        lastButtonClickTime = now;
      } catch (error) {
        console.error('Error handling button click:', error);
      }
    } else {
      alert('1분 이내에 연속해서 버튼을 클릭할 수 없습니다.');
    }
  };

  const goBack = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text>{`안녕하세요 "${pname}"님`}</Text>
      <View style={styles.messageButtons}>
        {messages.map((message, index) => (
          <TouchableOpacity
            key={index}
            style={styles.messageButton}
            onPress={() => handleButtonClick(message.message)}
          >
            <Text style={styles.messageButtonText}>{message.message}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.bottomBar}>
        <TextInput
          placeholder="메시지 이름"
          value={newMessageName}
          onChangeText={setNewMessageName}
          style={styles.input}
        />
        <TouchableOpacity onPress={handleRegisterMessage} style={styles.registerButton}>
          <Text style={styles.buttonText}>등록</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity onPress={goBack} style={styles.backButton}>
        <Text style={styles.buttonText}>돌아가기</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  messageButton: {
    backgroundColor: '#F0F0F0',
    padding: 20,
    margin: 10,
    borderRadius: 10,
  },
  messageButtonText: {
    fontSize: 24,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'lightgrey',
    padding: 10,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    flex: 1,
    marginRight: 10,
    paddingHorizontal: 8,
    backgroundColor: 'white',
  },
  registerButton: {
    backgroundColor: 'blue',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  backButton: {
    backgroundColor: 'red',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 20,
  },
});

export default ProfileDetailScreen;
