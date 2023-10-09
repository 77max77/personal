import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions }  from 'react-native';
import { getDocs, collection, query, getFirestore, orderBy } from 'firebase/firestore';
import { fireStoreJob, auth } from '../firebase';
import { useNavigation } from '@react-navigation/native'; // Add this line

const MainScreen = () => {
  const [profileNames, setProfileNames] = useState([]);
  const [timelineData, setTimelineData] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('day');
  const [filteredTimelineData, setFilteredTimelineData] = useState([]);

  useEffect(() => {
    const fetchTimelineData = async (profileName) => {
      const db = getFirestore();
      const q = query(collection(fireStoreJob, auth.currentUser?.email, profileName, 'timeline'), orderBy('time', 'desc'));
      const querySnapshot = await getDocs(q);
      const loadedTimelineData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        const timestamp = new Date(data.time.seconds * 1000);
        return { ...data, timestamp, profile: profileName };
      });
      setTimelineData(prevData => [...prevData, ...loadedTimelineData]);
    };

    const fetchProfileData = async () => {
      try {
        const q = query(collection(fireStoreJob, auth.currentUser?.email));
        const querySnapshot = await getDocs(q);
        const loadedProfiles = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const loadedProfileNames = loadedProfiles.map(profile => profile.pname);
        setProfileNames(loadedProfileNames);

        for (const profileName of loadedProfileNames) {
          await fetchTimelineData(profileName);
        }
      } catch (error) {
        console.error('Error fetching profiles:', error);
      }
    };

    fetchProfileData();
  }, []);

  useEffect(() => {
    const filterData = () => {
      if (selectedPeriod === 'day') {
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);
        setFilteredTimelineData(
          timelineData.filter(data => data.timestamp >= oneDayAgo).sort((a, b) => a.timestamp - b.timestamp)
        );
      } else if (selectedPeriod === 'week') {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        setFilteredTimelineData(
          timelineData.filter(data => data.timestamp >= oneWeekAgo).sort((a, b) => a.timestamp - b.timestamp)
        );
      } else if (selectedPeriod === 'month') {
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        setFilteredTimelineData(
          timelineData.filter(data => data.timestamp >= oneMonthAgo).sort((a, b) => a.timestamp - b.timestamp)
        );
      } else {
        setFilteredTimelineData(timelineData.sort((a, b) => a.timestamp - b.timestamp));
      }
    };
  
    filterData();
  }, [selectedPeriod, timelineData]);

  const screenWidth = Dimensions.get('window').width;
  const isSmallScreen = screenWidth <= 600;
  const navigation = useNavigation(); 
  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigation.navigate('Login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
        <Text style={styles.logoutButtonText}>로그아웃</Text>
      </TouchableOpacity>
      <View style={styles.filterContainer}>
      <TouchableOpacity
      onPress={() => setSelectedPeriod('all')}
      style={[
        styles.filterButton,
        selectedPeriod === 'all' ? styles.selectedButton : null,
        selectedPeriod !== 'all' ? styles.notSelectedButton : null
      ]}
    >
      <Text style={[
        styles.buttonText,
        selectedPeriod === 'all' ? styles.selectedButtonText : null,
        selectedPeriod !== 'all' ? styles.notSelectedButtonText : null
      ]}>ALL</Text>
    </TouchableOpacity>
    <TouchableOpacity
      onPress={() => setSelectedPeriod('day')}
      style={[
        styles.filterButton,
        selectedPeriod === 'day' ? styles.selectedButton : null,
        selectedPeriod !== 'day' ? styles.notSelectedButton : null
      ]}
    >
      <Text style={[
        styles.buttonText,
        selectedPeriod === 'day' ? styles.selectedButtonText : null,
        selectedPeriod !== 'day' ? styles.notSelectedButtonText : null
      ]}>DAY</Text>
    </TouchableOpacity>
    <TouchableOpacity
      onPress={() => setSelectedPeriod('week')}
      style={[
        styles.filterButton,
        selectedPeriod === 'week' ? styles.selectedButton : null,
        selectedPeriod !== 'week' ? styles.notSelectedButton : null
      ]}
    >
      <Text style={[
        styles.buttonText,
        selectedPeriod === 'week' ? styles.selectedButtonText : null,
        selectedPeriod !== 'week' ? styles.notSelectedButtonText : null
      ]}>WEEK</Text>
    </TouchableOpacity>
<TouchableOpacity
  onPress={() => setSelectedPeriod('month')}
  style={[
    styles.filterButton,
    selectedPeriod === 'month' ? styles.selectedButton : null,
    selectedPeriod !== 'month' ? styles.notSelectedButton : null
  ]}
>
  <Text style={[
    styles.buttonText,
    selectedPeriod === 'month' ? styles.selectedButtonText : null,
    selectedPeriod !== 'month' ? styles.notSelectedButtonText : null
  ]}>MONTH</Text>
</TouchableOpacity>
      </View>
      <View style={styles.contentContainer}>
        {profileNames.map(profileName => (
          <View key={profileName} style={[styles.profileContainer, isSmallScreen && styles.smallScreenProfileContainer]}>
          <View style={styles.card}>
            <Text style={styles.profileName}>{profileName}</Text>
            {filteredTimelineData
              .filter(data => data.profile === profileName)
              .map((data, index) => (
                <View style={styles.timelineItem} key={index}>
                  <View style={styles.dot} />
                  <View style={styles.timelineText}>
                    <Text style={styles.cardText}>{`${data.title}(${selectedPeriod !== 'day' ? data.timestamp.toLocaleDateString() : ''}${data.timestamp.getHours() >= 12 ? '오후' : '오전'} ${(data.timestamp.getHours() % 12) || 12}:${data.timestamp.getMinutes().toString().padStart(2, '0')})`}</Text>
                  </View>
                </View>
              ))}
          </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};


const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingTop: 50,
    paddingHorizontal: 10,
    justifyContent: 'flex-start',
    backgroundColor: '#F5FFFA', // 라이트 민트 그린
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
    marginTop: 20,
  },
  filterButton: {
    margin: 5,
    padding: 10,
    backgroundColor: '#E0EEE0', // 연한 민트 그린
    borderRadius: 5,
  },
  contentContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-evenly', // 가운데 정렬
  },
  profileContainer: {
    marginBottom: 10,
    marginLeft: 5,
    marginRight: 5,
    width: '45%', // 최대 2개가 들어갈 수 있도록 조정
    alignItems: 'center', // 가운데 정렬
    backgroundColor: '#556B2F', // 올리브 그린
    padding: 10,
    borderRadius: 10,
  },
  smallScreenProfileContainer: {
    width: '45%', // 화면이 작을 때 전체 너비로 설정
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'yellow',
    marginBottom: 5,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#F5FFFA', // 라이트 민트 그린
    marginVertical: 5,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  timelineText: {
    marginLeft: 5,
    color: 'black',
  },
  selectedButton: {
    backgroundColor: '#8FBC8F', // 다크 올리브 그린
  },
  notSelectedButton: {
    backgroundColor: '#8FBC8F', // 다크 올리브 그린
  },
  selectedButtonText: {
    color: 'red',
  },
  notSelectedButtonText: {
    color: 'yellow',
  },
  buttonText: {
    color: 'black',
  },
  card: {
    backgroundColor: '#8FBC8F', // 다크 올리브 그린
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  cardText: {
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


export default MainScreen;