import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons, MaterialIcons, Feather, FontAwesome5 } from '@expo/vector-icons';
import { Link } from 'expo-router';

const notifications = [
  {
    id: '1',
    icon: <Ionicons name="checkmark-done" size={22} color="#fff" />,
    iconBg: '#4D8DFF',
    title: 'Welcome!',
    description: 'Thanks for joining MyCollegeBox.',
    time: 'Just now',
  },
  {
    id: '2',
    icon: <MaterialIcons name="note-add" size={22} color="#fff" />, 
    iconBg: '#34C759',
    title: 'New Notes Shared',
    description: 'A new set of notes is available for you.',
    time: '2h ago',
  },
  {
    id: '3',
    icon: <Feather name="book-open" size={22} color="#fff" />, // orange
    iconBg: '#FF9500',
    title: 'Book Sale',
    description: 'Your book listing received a new message.',
    time: '4h ago',
  },
  {
    id: '4',
    icon: <FontAwesome5 name="user-friends" size={20} color="#fff" />, // purple
    iconBg: '#AF52DE',
    title: 'New Connection',
    description: 'You have a new friend request.',
    time: '1d ago',
  },
  {
    id: '5',
    icon: <Ionicons name="calendar" size={22} color="#fff" />, // red
    iconBg: '#FF3B30',
    title: 'Event Reminder',
    description: "Don't forget the upcoming event tomorrow.",
    time: '2d ago',
  },
];

export default function MessagesScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F7FAFF" />
      {/* Top Bar */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.title}>Messages</Text>
          <Text style={styles.subheading}>Notifications</Text>
        </View>
        <Image
          source={{ uri: 'https://randomuser.me/api/portraits/women/44.jpg' }}
          style={styles.avatar}
        />
      </View>
      {/* Notification List */}
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 18, paddingTop: 8, paddingBottom: 90 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={[styles.iconCircle, { backgroundColor: item.iconBg }]}>{item.icon}</View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardDesc}>{item.description}</Text>
            </View>
            <Text style={styles.time}>{item.time}</Text>
          </View>
        )}
      />
      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <Link href="/homepage" asChild>
          <TouchableOpacity style={styles.navItem}>
            <Ionicons name="home" size={24} color="#B0B0B0" />
            <Text style={styles.navLabel}>Home</Text>
          </TouchableOpacity>
        </Link>
        <TouchableOpacity style={styles.navItemActive}>
          <Ionicons name="chatbubble-ellipses-outline" size={24} color="#4D8DFF" />
          <Text style={styles.navLabelActive}>Messages</Text>
        </TouchableOpacity>
        <Link href="/UploadSelectPage" asChild>
          <TouchableOpacity style={styles.navItem}>
            <Ionicons name="add-circle-outline" size={28} color="#B0B0B0" />
            <Text style={styles.navLabel}>Add</Text>
          </TouchableOpacity>
        </Link>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="search" size={24} color="#B0B0B0" />
          <Text style={styles.navLabel}>Search</Text>
        </TouchableOpacity>
        <Link href="/profile" asChild>
          <TouchableOpacity style={styles.navItem}>
            <Ionicons name="person-outline" size={24} color="#B0B0B0" />
            <Text style={styles.navLabel}>Profile</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7FAFF',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#222',
    fontFamily: 'Poppins_700Bold',
  },
  subheading: {
    fontSize: 15,
    color: '#888',
    marginTop: 2,
    fontWeight: '600',
    fontFamily: 'Poppins_400Regular',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginLeft: 10,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    gap: 16,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222',
    fontFamily: 'Poppins_600SemiBold',
  },
  cardDesc: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
    fontFamily: 'Poppins_400Regular',
  },
  time: {
    fontSize: 12,
    color: '#B0B0B0',
    marginLeft: 8,
    alignSelf: 'flex-start',
    fontWeight: '600',
    fontFamily: 'Poppins_400Regular',
  },
  bottomNav: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 64,
    backgroundColor: '#fff',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: -2 },
    elevation: 8,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  navItemActive: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    borderTopWidth: 2,
    borderTopColor: '#4D8DFF',
    backgroundColor: '#F7FAFF',
  },
  navLabel: {
    fontSize: 12,
    color: '#B0B0B0',
    marginTop: 2,
    fontFamily: 'Poppins_400Regular',
  },
  navLabelActive: {
    fontSize: 12,
    color: '#4D8DFF',
    marginTop: 2,
    fontWeight: '700',
    fontFamily: 'Poppins_600SemiBold',
  },
}); 