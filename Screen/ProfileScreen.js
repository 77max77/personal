import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, Button, Alert } from 'react-native';
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


  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigation.navigate('Login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.profileList}>
        {profiles.map((profile, index) => (
          <View key={index} style={styles.profileCard}>
            <TouchableOpacity onPress={() => handleProfileClick(profile)}>
              <Text style={styles.profileName}>{profile.pname}</Text>
            </TouchableOpacity>
            <Button
              title="X"
              onPress={() => handleRemoveProfile(profile)}
            />
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
          <Button title="Save Profile" onPress={handleSaveProfile} />
        </View>
      )}
       <RemoveProfileModal
        visible={isRemoveModalVisible}
        onConfirm={handleConfirmRemove}
        onCancel={handleCancelRemove}
      />
      <TouchableOpacity onPress={handleAddProfile} style={styles.addButton}>
        <Text style={styles.addButtonText}>프로필 추가 +</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
        <Text style={styles.logoutButtonText}>LogOut</Text>
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
  profileList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
  },
  profileCard: {
    backgroundColor: 'black',
    padding: 20,
    margin: 10,
    borderRadius: 10,
    width: 150,
    alignItems: 'center',
  },
  profileName: {
    fontSize: 18,
    marginBottom: 10,
    color:'yellow'
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
  },
  addButton: {
    width: 200,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'blue',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  addButtonText: {
    fontSize: 18,
    color: 'white',
  },
  logoutButton: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
  logoutButtonText: {
    fontSize: 16,
    color: 'red',
  },
});

export default ProfileScreen;
