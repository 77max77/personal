import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { getDocs, collection, query, getFirestore } from 'firebase/firestore';
import { fireStoreJob, auth } from '../firebase';

const MainScreen = () => {
  const [profileNames, setProfileNames] = useState([]);
  const [timelineData, setTimelineData] = useState([]);

  useEffect(() => {
    const fetchTimelineData = async (profileName) => {
      const db = getFirestore();
      const q = query(collection(fireStoreJob, auth.currentUser?.email, profileName, 'timeline'));
      const querySnapshot = await getDocs(q);
      const loadedTimelineData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        const timestamp = new Date(data.time.seconds * 1000);
        const currentDate = new Date();
        if (
          timestamp.getDate() === currentDate.getDate() &&
          timestamp.getMonth() === currentDate.getMonth() &&
          timestamp.getFullYear() === currentDate.getFullYear()
        ) {
          const hours = timestamp.getHours();
          const minutes = timestamp.getMinutes();
          const formattedTime = `${hours}시 ${minutes}분`;
          const formattedTitle = `${data.title} (${formattedTime})`;
          return { ...data, formattedTitle, profile: profileName, hours, minutes };
        }
        return null;
      }).filter(Boolean); // null을 제거하여 유효한 데이터만 남깁니다.
      return loadedTimelineData;
    };
  
    const fetchProfileData = async () => {
      try {
        const q = query(collection(fireStoreJob, auth.currentUser?.email));
        const querySnapshot = await getDocs(q);
        const loadedProfiles = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const loadedProfileNames = loadedProfiles.map(profile => profile.pname);
        setProfileNames(loadedProfileNames);
  
        const timelineDataArray = [];
        for (const profileName of loadedProfileNames) {
          const loadedData = await fetchTimelineData(profileName);
          timelineDataArray.push(...loadedData);
        }
        setTimelineData(timelineDataArray);
      } catch (error) {
        console.error('Error fetching profiles:', error);
      }
    };
  
    fetchProfileData();
  }, []);
  

  const sortedTimelineData = timelineData.sort((a, b) => {
    const timeA = new Date(a.time.seconds * 1000);
    const timeB = new Date(b.time.seconds * 1000);
    return timeA - timeB;
  });

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {profileNames.map(profileName => (
        <View key={profileName} style={styles.profileContainer}>
          <Text style={styles.profileName}>{profileName}</Text>
          {sortedTimelineData
            .filter(data => data.profile === profileName)
            .map((data, index) => (
              <View style={styles.timelineItem} key={index}>
                <View style={styles.dot} />
                <View style={styles.timelineText}>
                  <Text>{data.formattedTitle}</Text>
                </View>
              </View>
            ))}
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingTop: 50,
    paddingHorizontal: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-evenly',
  },
  profileContainer: {
    marginBottom: 20,
    width: '30%',
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  timelineContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    position: 'relative',
  },
  verticalLine: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'black',
    marginVertical: 5,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  timelineText: {
    marginLeft: 5,
  },
});

export default MainScreen;
