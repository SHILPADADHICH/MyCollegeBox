// ✅ File: app/marketplace.js
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const booksData = [
  {
    id: "1",
    title: "Introduction to Algorithms",
    author: "Cormen, Leiserson",
    price: "₹350",
    seller: "Aarav Mehta",
    condition: "Used - Good",
    // image: require("../assets/images/book1.png"),
  },
  {
    id: "2",
    title: "Operating System Concepts",
    author: "Galvin",
    price: "₹250",
    seller: "Sanya Verma",
    condition: "Used - Fair",
    // image: require("../assets/images/book2.png"),
  },
  {
    id: "3",
    title: "DBMS by Korth",
    author: "Henry F. Korth",
    price: "₹300",
    seller: "Raj Patel",
    condition: "Used - Like New",
    // image: require("../assets/images/book3.png"),
  },
];

export default function Marketplace() {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const filteredBooks = booksData.filter((book) =>
    book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Buy / Sell Books</Text>
        <Ionicons name="book-outline" size={28} color="#4D8DFF" />
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color="#888" style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by title or author"
          placeholderTextColor="#888"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={filteredBooks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => router.push(`/book/${item.id}`)}>
            <View style={styles.bookCard}>
              <Image source={item.image} style={styles.bookImage} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.bookTitle}>{item.title}</Text>
                <Text style={styles.bookAuthor}>{item.author}</Text>
                <Text style={styles.bookInfo}>
                  {item.condition} | {item.price}
                </Text>
                <Text style={styles.bookSeller}>Seller: {item.seller}</Text>
              </View>
              <Ionicons name="chevron-forward" size={22} color="#B0B0B0" />
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7FAFF",
    paddingTop: 48,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#222",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 44,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#222",
  },
  bookCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 14,
    marginHorizontal: 20,
    marginVertical: 8,
    padding: 12,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
    alignItems: "center",
  },
  bookImage: {
    width: 54,
    height: 54,
    borderRadius: 12,
    resizeMode: "cover",
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222",
  },
  bookAuthor: {
    fontSize: 14,
    color: "#555",
    marginTop: 2,
  },
  bookInfo: {
    fontSize: 13,
    color: "#666",
    marginTop: 4,
  },
  bookSeller: {
    fontSize: 13,
    color: "#4D8DFF",
    marginTop: 4,
  },
});
