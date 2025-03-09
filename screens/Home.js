import React from "react";
import { View, Text, StyleSheet, FlatList, Image, ScrollView, TouchableOpacity, PixelRatio } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { Dimensions } from "react-native";
import { supabase } from "../supabase";
import { useState, useEffect } from "react";

const { width } = Dimensions.get("window");
const stories = [
    { id: "1", image: "https://i.pinimg.com/236x/ed/20/5a/ed205aff1fb33c28ddd8bfc7f3e7ff29.jpg", username: "You" },
    { id: "2", image: "https://picsum.photos/101", username: "Emily" },
    { id: "3", image: "https://picsum.photos/102", username: "Emma" },
    { id: "4", image: "https://picsum.photos/103", username: "Olivia" },
    { id: "5", image: "https://picsum.photos/104", username: "Michael" },
];

// const posts = [
//     { id: "1", image: "https://i.pinimg.com/474x/fb/d0/a7/fbd0a78875801bd026a85bdf80cd6f85.jpg", username: "Amelia John", likes: "12.5K", comments: "6.8K" },
//     { id: "2", image: "https://i.pinimg.com/474x/1e/e1/fc/1ee1fc4d681f56f9a2ab96fc9df42148.jpg", username: "Shekel Afeni", likes: "8.2K", comments: "5.1K" },
//     { id: "3", image: "https://i.pinimg.com/474x/73/4a/25/734a251b61723478b09a4bb241822cad.jpg", username: "Jane Snow", likes: "2.2K", comments: "1.5K" },
// ];

const HomeScreen = () => {
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        fetchImages();
    }, []);

    const fetchImages = async () => {
        try {
            // Fetch images from Supabase storage
            const { data: images, error: imageError } = await supabase.storage.from("profile_pictures").list("", { limit: 20 });

            if (imageError) {
                console.error("Error fetching images:", imageError);
                return;
            }

            // Fetch user details (replace 'profile_picture' with the correct column name)
            const { data: users, error: userError } = await supabase.from("users_details").select("username, image_url"); // Change `image_url` if necessary

            if (userError) {
                console.error("Error fetching user details:", userError);
                return;
            }

            // Match images with usernames
            const imagePosts = images.map((file) => {
                const user = users.find((u) => u.image_url === file.name) || {}; // Match by filename
                return {
                    id: file.name, // Use filename as ID
                    image: supabase.storage.from("profile_pictures").getPublicUrl(file.name).data.publicUrl,
                    username: user.username || "Unknown User", // Use username if found
                    likes: `${Math.floor(Math.random() * 10000)} Likes`,
                    comments: `${Math.floor(Math.random() * 5000)} Comments`,
                };
            });

            setPosts(imagePosts);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };


    return (
        <>
            <StatusBar style="auto" />
            <View style={styles.container}>
                {/* Header Section */}
                <View style={styles.header}>
                    <TouchableOpacity>
                        <Ionicons name="menu" size={28} color="black" />
                    </TouchableOpacity>
                    <Text style={styles.title}>Top Stories</Text>
                    <TouchableOpacity>
                        <Ionicons name="notifications-outline" size={28} color="black" />
                    </TouchableOpacity>
                </View>

                {/* Stories Section */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.storyContainer}>
                    {stories.map((story) => (
                        <View key={story.id} style={styles.story}>
                            <Image source={{ uri: story.image }} style={styles.storyImage} resizeMode="cover" />
                            <Text style={styles.storyUsername}>{story.username}</Text>
                        </View>
                    ))}
                </ScrollView>

                {/* Feed Section */}
                <FlatList
                    data={posts}
                    keyExtractor={(item) => item.id}
                    initialNumToRender={5}
                    windowSize={3}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item }) => (
                        <View style={styles.post}>
                            <Text style={styles.postUsername}>{item.username}</Text>
                            <Image source={{ uri: item.image }} style={styles.postImage} resizeMode="cover" />
                            <View style={styles.postActions}>
                                <TouchableOpacity style={styles.actionButton}>
                                    <Ionicons name="heart-outline" size={24} color="black" />
                                    <Text>{item.likes}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.actionButton}>
                                    <Ionicons name="chatbubbles-outline" size={24} color="black" />
                                    <Text>{item.comments}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity>
                                    <Ionicons name="ellipsis-horizontal-outline" size={24} color="black" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                />
            </View>
        </>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff", },

    // Header
    header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 15, marginTop: 18 },
    title: { fontSize: 18, fontWeight: "bold", alignSelf: "center" },

    // Stories
    storyContainer: { padding: 10 },
    story: { alignItems: "center", marginRight: 15 },
    storyImage: { width: 60, height: 60, borderRadius: 30, borderWidth: 2, borderColor: "red" },
    storyUsername: { fontSize: 12, marginTop: 5, marginBottom: 15 },

    // Posts
    post: { padding: 15 },
    postUsername: { fontWeight: "bold", fontSize: 16, marginBottom: 5 },
    postImage: { width: "100%", height: width * 1.4, borderRadius: 10 },
    postActions: { flexDirection: "row", alignItems: "center", marginTop: 10, justifyContent: 'space-around' },
    actionButton: { flexDirection: "row", alignItems: "center", gap: 5 }
});

export default HomeScreen;