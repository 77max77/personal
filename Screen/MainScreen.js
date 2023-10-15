import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions }  from 'react-native';
import { getDocs, collection, query, getFirestore, orderBy } from 'firebase/firestore';
import { fireStoreJob, auth } from '../firebase';
import { useNavigation } from '@react-navigation/native';

const MainScreen = () => {
  const [profileNames, setProfileNames] = useState([]);
  const [timelineData, setTimelineData] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('day');
  const [filteredTimelineData, setFilteredTimelineData] = useState([]);

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

      setTimelineData(prevData => [...prevData]);
    } catch (error) {
      console.error('Error fetching profiles:', error);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  useEffect(() => {
    // filterData 함수는 선택된 기간에 따라 타임라인 데이터를 필터링하는 역할을 합니다.
    const filterData = () => {
      if (selectedPeriod === 'day') {
        // 만약 선택된 기간이 '일'이면, 지난 24시간 동안의 데이터를 필터링합니다.
        const 하루전 = new Date();
        하루전.setDate(하루전.getDate() - 1);
        setFilteredTimelineData(
          timelineData.filter(data => data.timestamp >= 하루전).sort((a, b) => a.timestamp - b.timestamp)
        );
      } else if (selectedPeriod === 'week') {
        // 만약 선택된 기간이 '주'이면, 지난 7일 동안의 데이터를 필터링합니다.
        const 일주일전 = new Date();
        일주일전.setDate(일주일전.getDate() - 7);
        setFilteredTimelineData(
          timelineData.filter(data => data.timestamp >= 일주일전).sort((a, b) => a.timestamp - b.timestamp)
        );
      } else if (selectedPeriod === 'month') {
        // 만약 선택된 기간이 '월'이면, 지난 30일 동안의 데이터를 필터링합니다.
        const 한달전 = new Date();
        한달전.setMonth(한달전.getMonth() - 1);
        setFilteredTimelineData(
          timelineData.filter(data => data.timestamp >= 한달전).sort((a, b) => a.timestamp - b.timestamp)
        );
      } else {
        // 특정 기간이 선택되지 않았을 때, 원래의 타임라인 데이터를 사용합니다.
        setFilteredTimelineData(timelineData.sort((a, b) => a.timestamp - b.timestamp));
      }
    };
    
    // 선택된 기간이나 타임라인 데이터가 변경될 때마다 filterData 함수를 호출합니다.
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

  const handleRefresh = () => {
    setTimelineData([]);
    fetchProfileData();
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
        <Text style={styles.logoutButtonText}>로그아웃</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
        <Text style={styles.refreshButtonText}>새로고침</Text>
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
                      <Text style={styles.cardText}>
                        {`${data.title}(${selectedPeriod !== 'day' ? data.timestamp.toLocaleDateString() : ''}${data.timestamp.getHours() >= 12 ? '오후' : '오전'} ${(data.timestamp.getHours() % 12) || 12}:${data.timestamp.getMinutes().toString().padStart(2, '0')})`}
                      </Text>
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
    backgroundColor: '#F5FFFA', 
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
    backgroundColor: '#E0EEE0', 
    borderRadius: 5,
  },
  contentContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-evenly', 
  },
  profileContainer: {
    marginBottom: 10,
    marginLeft: 5,
    marginRight: 5,
    width: '45%', // 최대 2개가 들어갈 수 있도록 조정
    alignItems: 'center',
    backgroundColor: '#86B404',
    padding: 10,
    borderRadius: 10,
  },
  smallScreenProfileContainer: {
    width: '45%',
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 5,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#F5FFFA', 
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
    backgroundColor: '#8FBC8F', 
  },
  notSelectedButton: {
    backgroundColor: '#8FBC8F',
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
    backgroundColor: '#8FBC8F',
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
  refreshButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: '#8FBC8F',
    padding: 10,
    borderRadius: 5,
  },
  refreshButtonText: {
    color: 'white',
  },

});


export default MainScreen;