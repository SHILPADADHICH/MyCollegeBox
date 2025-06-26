// ✅ File: app/book/[id].js
import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const booksData = [
  {
    id: "1",
    title: "Introduction to Algorithms",
    author: "Cormen, Leiserson",
    price: "₹350",
    seller: "Aarav Mehta",
    condition: "Used - Good",
    // image: require("../../assets/images/book1.png"),
  },
  {
    id: "2",
    title: "Operating System Concepts",
    author: "Galvin",
    price: "₹250",
    seller: "Sanya Verma",
    condition: "Used - Fair",
    // image: require("../../assets/images/book2.png"),
  },
  {
    id: "3",
    title: "DBMS by Korth",
    author: "Henry F. Korth",
    price: "₹300",
    seller: "Raj Patel",
    condition: "Used - Like New",
    // image: require("../../assets/images/book3.png"),
  },
];

export default function BookDetail() {
  const { id } = useLocalSearchParams();
  const book = booksData.find((b) => b.id === id);
  const router = useRouter();

  if (!book) {
    return (
      <View style={styles.container}>
        <Text style={styles.notFound}>Book not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image source={book.image} style={styles.image} />
      <Text style={styles.title}>{book.title}</Text>
      <Text style={styles.author}>by {book.author}</Text>
      <Text style={styles.info}>Condition: {book.condition}</Text>
      <Text style={styles.info}>Seller: {book.seller}</Text>
      <Text style={styles.price}>{book.price}</Text>

      <TouchableOpacity style={styles.buyButton} onPress={() => alert("Redirect to payment or chat")}>
        <Ionicons name="cart-outline" size={20} color="#fff" />
        <Text style={styles.buyText}>Buy Now</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 24,
    backgroundColor: "#F7FAFF",
    alignItems: "center",
  },
  image: {
    width: 130,
    height: 130,
    borderRadius: 12,
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#222",
    textAlign: "center",
  },
  author: {
    fontSize: 16,
    color: "#555",
    marginTop: 6,
  },
  info: {
    fontSize: 14,
    color: "#777",
    marginTop: 8,
  },
  price: {
    fontSize: 20,
    fontWeight: "700",
    color: "#4D8DFF",
    marginTop: 12,
  },
  buyButton: {
    flexDirection: "row",
    backgroundColor: "#4D8DFF",
    paddingVertical: 12,
    paddingHorizontal: 26,
    borderRadius: 14,
    marginTop: 24,
    alignItems: "center",
  },
  buyText: {
    fontSize: 16,
    color: "#fff",
    marginLeft: 10,
    fontWeight: "600",
  },
  notFound: {
    marginTop: 100,
    fontSize: 18,
    color: "#888",
  },
});
