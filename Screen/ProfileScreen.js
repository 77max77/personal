import React, { useState, useEffect } from 'react';
import {
  KeyboardAvoidingView,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Button,
  Alert,
  Keyboard
} from 'react-native';
import { collection, addDoc, getDocs, query, deleteDoc, doc } from 'firebase/firestore'; // Update imports
import { fireStoreJob, auth } from '../firebase';
import { useNavigation } from '@react-navigation/native'; // Add this line
import RemoveProfileModal from '../RemoveProfileModal'; // 모달 컴포넌트 import


const ProfileScreen = () => {
  const [profiles, setProfiles] = useState([]);
  const [isAddingProfile, setIsAddingProfile] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');
  const [selectedProfile, setSelectedProfile] = useState(null); // 선택된 프로필 상태
  const [isRemoveModalVisible, setIsRemoveModalVisible] = useState(false); // 모달 표시 상태
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  const handleRemoveProfile = (profile) => {
    setSelectedProfile(profile); // 선택된 프로필 설정
    setIsRemoveModalVisible(true); // 모달 표시
  };
 
  const handleConfirmRemove = async () => {
    if (selectedProfile) {
      try {
        await deleteDoc(doc(collection(fireStoreJob, auth.currentUser?.email), selectedProfile.id));
        const updatedProfiles = profiles.filter(item => item.id !== selectedProfile.id);
        setProfiles(updatedProfiles);
      } catch (error) {
        console.error('Error removing profile:', error);
      } finally {
        setIsRemoveModalVisible(false); // 모달 닫기
        setSelectedProfile(null); // 선택된 프로필 초기화
      }
    }
  };

  const handleCancelRemove = () => {
    setIsRemoveModalVisible(false); // 모달 닫기
    setSelectedProfile(null); // 선택된 프로필 초기화
  };

  const handleCancelAddProfile = () => {
    setNewProfileName(''); // 입력값 초기화
    setIsAddingProfile(false); // 프로필 추가 화면 닫기
  };
  

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const q = query(collection(fireStoreJob, auth.currentUser?.email));
        const querySnapshot = await getDocs(q);
        const loadedProfiles = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProfiles(loadedProfiles);
      } catch (error) {
        console.error('Error fetching profiles:', error);
      }
    };

    fetchProfiles();
  }, []);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);


  const handleAddProfile = () => {
    setIsAddingProfile(true);
  };

  const handleSaveProfile = async () => {
    if (newProfileName.trim() !== '') {
      const isProfileExist = profiles.some(profile => profile.pname === newProfileName.trim());
      if (isProfileExist) {
        alert('이미 존재하는 프로필 이름입니다.');
        return;
      }

      try {
        const newProfile = {
          pname: newProfileName.trim(),
        };
        const docRef = await addDoc(collection(fireStoreJob, auth.currentUser?.email), newProfile);
        newProfile.id = docRef.id;
        setProfiles([...profiles, newProfile]);
        setNewProfileName('');
        setIsAddingProfile(false);
      } catch (error) {
        console.log(error.message);
      }
    }
  };

  const navigation = useNavigation();  // navigation 객체 가져오기

  const handleProfileClick = (profile) => {
    navigation.navigate('ProfileDetailScreen', { pname: profile.pname });  // 프로필 디테일 화면으로 이동
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.container}>
      <View style={styles.profileList}>
        {profiles.map((profile, index) => (
          <View key={index} style={styles.profileCard}>
            <TouchableOpacity onPress={() => handleProfileClick(profile)}>
              <Text style={styles.profileName}>{profile.pname}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleRemoveProfile(profile)} style={styles.removeButton}>
              <Text style={styles.removeButtonText}>삭제</Text>
            </TouchableOpacity>
          </View>
        ))}
        </View>

        {isAddingProfile && (
          <View style={styles.addProfileContainer}>
            <TextInput
              style={styles.input}
              placeholder="프로필 이름"
              value={newProfileName}
              onChangeText={setNewProfileName}
            />
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveProfile}
              >
                <Text style={styles.saveButtonText}>Save Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCancelAddProfile}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {!isAddingProfile && !isKeyboardVisible && (
          <TouchableOpacity onPress={handleAddProfile} style={styles.addButton}>
            <Text style={styles.addButtonText}>프로필 추가 +</Text>
          </TouchableOpacity>
        )}

        <RemoveProfileModal
          visible={isRemoveModalVisible}
          onConfirm={handleConfirmRemove}
          onCancel={handleCancelRemove}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FFFA', // 라이트 민트 그린
  },
  profileList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
  },
  profileCard: {
    backgroundColor: '#556B2F', // 다크 올리브 그린
    padding: 20,
    margin: 10,
    borderRadius: 10,
    width: 150,
    alignItems: 'center',
  },
  profileName: {
    padding:20,
    borderRadius: 5,
    fontSize: 18,
    backgroundColor: 'lightgreen',
    marginBottom: 10,
    color: 'black',
    fontWeight: 'bold',
  },
  addProfileContainer: {
    alignItems: 'center',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 8,
    backgroundColor: '#FFFFFF', // 화이트
  },
  addButton: {
    width: 200,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#556B2F', // 다크 올리브 그린
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  addButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF', // 화이트
  },
  removeButton: {
    backgroundColor: 'lightgreen', // 배경색
    padding: 5,
    borderRadius: 5,
    marginTop: 10,
    alignItems: 'center',
  },
  removeButtonText: {
    color: 'black', // 텍스트 색상
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#556B2F',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 10,
    marginBottom:10
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#FF6347',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 10,
    marginLeft:5,
    marginBottom: 10,
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  
  
  
  
});



export default ProfileScreen;
