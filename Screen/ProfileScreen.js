import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, Button } from 'react-native';
import { collection, addDoc, getDocs, query } from 'firebase/firestore';
import { fireStoreJob, auth } from '../firebase';
import { useNavigation } from '@react-navigation/native'; // Add this line

const ProfileScreen = () => {
  const navigation = useNavigation()
  const [profiles, setProfiles] = useState([]);
  const [isAddingProfile, setIsAddingProfile] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');

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
      // Check if the profile name already exists
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

  const handleProfileClick = (profile) => {
    navigation.navigate('ProfileDetailScreen', { pname: profile.pname });
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigation.navigate('Login'); // 이동할 화면으로 변경
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.profileList}>
        {profiles.map((profile, index) => (
          <TouchableOpacity
            key={index}
            style={styles.profileCard}
            onPress={() => handleProfileClick(profile)}
          >
            <Text style={styles.profileName}>{profile.pname}</Text>
          </TouchableOpacity>
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

      <TouchableOpacity onPress={handleAddProfile} style={styles.addButton}>
        <Text style={styles.addButtonText}>프로필 추가 +</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
        <Text style={styles.logoutButtonText}>로그아웃</Text>
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
    marginBottom: 20,
  },
  profileCard: {
    backgroundColor: '#F0F0F0',
    padding: 20,
    margin: 10,
    borderRadius: 10,
    width: 100,
    alignItems: 'center',
  },
  profileName: {
    fontSize: 18,
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
