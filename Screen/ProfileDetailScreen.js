import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Button, Modal, StyleSheet, KeyboardAvoidingView } from 'react-native';
import { addDoc, collection, getDocs, query, serverTimestamp, deleteDoc, where, doc } from 'firebase/firestore';
import { fireStoreJob, auth } from '../firebase';

const ProfileDetailScreen = ({ route, navigation }) => {
  const { pname } = route.params;
  const [newMessageName, setNewMessageName] = useState('');
  const [messages, setMessages] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  let lastButtonClickTime = null;
  const [isAddingButton, setIsAddingButton] = useState(false);

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

  useEffect(() => {
    const fetchEmergencyContacts = async () => {
      try {
        const q = query(collection(fireStoreJob, auth.currentUser?.email, pname, 'phoneNumber'));
        const querySnapshot = await getDocs(q);
        const loadedContacts = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return { id: doc.id, name: data.name, phone: data.phone };
        });
        setEmergencyContacts(loadedContacts);
      } catch (error) {
        console.error('Error fetching emergency contacts:', error);
      }
    };
    fetchEmergencyContacts();
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

  const handleAddContact = async () => {
    if (newContactName.trim() !== '' && newContactPhone.trim() !== '') {
      try {
        const newContact = {
          name: newContactName.trim(),
          phone: newContactPhone.trim(),
        };
        const profileCollectionRef = collection(fireStoreJob, auth.currentUser?.email, pname, 'phoneNumber');
        await addDoc(profileCollectionRef, newContact);
        setNewContactName('');
        setNewContactPhone('');
        setModalVisible(false);
        setEmergencyContacts([...emergencyContacts, newContact]);
      } catch (error) {
        console.error('Error adding contact:', error);
      }
    }
  };

  const goBack = () => {
    navigation.goBack();
  };

  const handleDeleteContact = async (contactId) => {
    try {
      const contactRef = doc(fireStoreJob, auth.currentUser?.email, pname, 'phoneNumber', contactId);
      await deleteDoc(contactRef);
      const updatedContacts = emergencyContacts.filter(contact => contact.id !== contactId);
      setEmergencyContacts(updatedContacts);
    } catch (error) {
      console.error('Error deleting contact:', error);
    }
  };

  const handleDeleteButton = async (message) => {
    try {
      const profileCollectionRef = collection(fireStoreJob, auth.currentUser?.email, pname, 'buttons');
      const q = query(profileCollectionRef, where('message', '==', message));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(async (doc) => {
        await deleteDoc(doc.ref);
      });
      const updatedMessages = messages.filter(msg => msg.message !== message);
      setMessages(updatedMessages);
    } catch (error) {
      console.error('Error deleting button:', error);
    }
  };

  const handleAddButton = () => {
    setIsAddingButton(true);
  };

  return (
    <KeyboardAvoidingView behavior="padding" style={styles.container}>
      <View style={styles.container}>
        <Text>{`안녕하세요 "${pname}"님`}</Text>
  
     
  
        <View style={styles.messageButtons}>
          {messages.map((message, index) => (
            <View key={index} style={styles.messageButtonContainer}>
              <View style={styles.messageButton}>
                <TouchableOpacity
                  onPress={() => handleButtonClick(message.message)}
                >
                  <Text style={styles.messageButtonText}>{message.message}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeleteButton(message.message)}>
                  <Text style={styles.deleteButton}>삭제</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>      
       <View style={styles.emergencyContacts}>
          <Text style={styles.sectionTitle}>비상 연락망</Text>
          {emergencyContacts.map((contact, index) => (
            <View key={index} style={styles.contactItem}>
              <Text>{`이름: ${contact.name}`}</Text>
              <Text>{`전화번호: ${contact.phone}`}</Text>
              <TouchableOpacity onPress={() => handleDeleteContact(contact.id)}>
                <Text style={styles.deleteButton}>삭제</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </View>

        <TouchableOpacity onPress={handleAddButton} style={styles.addButton}>
          <Text style={styles.buttonText}>버튼 추가</Text>
        </TouchableOpacity>
        <Modal
          animationType="slide"
          transparent={true}
          visible={isAddingButton}
          onRequestClose={() => setIsAddingButton(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <TextInput
                style={styles.modalTextInput}
                placeholder="버튼 이름"
                value={newMessageName}
                onChangeText={setNewMessageName}
              />
             <View style={styles.modalButtonContainer}>
              <TouchableOpacity onPress={handleRegisterMessage} style={styles.modalButton}>
                <Text style={styles.modalButtonText}>등록</Text>
              </TouchableOpacity>
              <View style={styles.modalButtonSpacer} />
              <TouchableOpacity onPress={() => setIsAddingButton(false)} style={styles.modalButton}>
                <Text style={styles.modalButtonText}>취소</Text>
              </TouchableOpacity>
            </View>
            </View>
          </View>
        </Modal>
  
        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addButton}>
          <Text style={styles.buttonText}>비상연락망 추가</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <Text style={styles.buttonText}>돌아가기</Text>
        </TouchableOpacity>
        <Modal
          animationType="slide"
          transparent={true}
          visible={isModalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <TextInput
                style={styles.modalTextInput}
                placeholder="이름"
                value={newContactName}
                onChangeText={setNewContactName}
              />
              <TextInput
                  style={styles.modalTextInput}
                  placeholder="전화번호 (000-0000-0000)"
                  value={newContactPhone}
                  onChangeText={(text) => {
                    // 정규식을 사용하여 입력값을 형식에 맞게 수정
                    const formattedPhone = text.replace(/[^0-9]/g, '').replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
                    setNewContactPhone(formattedPhone);
                  }}
                />
              <View style={styles.modalButtonContainer}>
              <TouchableOpacity onPress={handleAddContact} style={styles.modalButton}>
                <Text style={styles.modalButtonText}>추가</Text>
              </TouchableOpacity>
              <View style={styles.modalButtonSpacer} />
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalButton}>
                <Text style={styles.modalButtonText}>취소</Text>
              </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
              
    </KeyboardAvoidingView>
  );
  
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageButtonContainer: {
    marginBottom: 20,
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
    alignItems: 'center',
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
  addButton: {
    backgroundColor: 'green',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 20,
  },
  backButton: {
    backgroundColor: 'red',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  emergencyContacts: {
    marginTop: 20,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },

  contactItem: {
    backgroundColor: '#F0F0F0',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  buttonWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteButton: {
    marginTop: 10,
    color: 'red',
    fontSize: 16,
  },
  modalTextInput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 10,
    width: 200,
  },
  modalButton: {
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 5,
  },
  modalButtonText: {
    color: 'white',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginTop: 20,
  },
  modalButtonSpacer: {
    width: 10, // 필요에 따라 조절
  },
});

export default ProfileDetailScreen;
