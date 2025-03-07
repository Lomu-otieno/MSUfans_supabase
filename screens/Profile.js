import { View, Text, TextInput, Button, TouchableOpacity, StyleSheet, ImageBackground, Image, Alert, Modal } from 'react-native';
import React, { useState, useEffect } from 'react';
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { supabase } from '../supabase';

export default function Home() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [gender, setGender] = useState('');
    const [interests, setInterests] = useState('');
    const [contact, setContact] = useState('');
    const [profilePicture, setProfilePicture] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [newPassword, setNewPassword] = useState('');


    const navigation = useNavigation();

    const onSelectImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled) {
            setProfilePicture(result.assets[0].uri);
            // TODO: Upload image to Supabase
            const { uri } = result.assets[0];
            const fileName = uri.split('/').pop();
            const fileType = fileName.split('.').pop();

            // Convert image to base64 for upload
            const base64 = await FileSystem.readAsStringAsync(uri, {
                encoding: FileSystem.EncodingType.Base64,
            });

            // Upload to Supabase Storage
            const { data, error } = await supabase.storage
                .from('profile_pictures')
                .upload(`public/${fileName}`, Buffer.from(base64, 'base64'), {
                    contentType: `image/${fileType}`,
                });

            if (error) {
                Alert.alert("Upload failed", error.message);
                return;
            }

            // Get public URL of the uploaded image
            const { data: imageUrl } = supabase.storage.from('profile_pictures').getPublicUrl(`public/${fileName}`);

            setProfilePicture(imageUrl.publicUrl);

            // Save URL to database
            await supabase.from('users_details').update({ profilePicture: imageUrl.publicUrl }).eq('email', email);
        }
    }


    const changePassword = async () => {
        if (!newPassword) {
            Alert.alert("Error", "Please enter a new password");
            return;
        }
        const { error } = await supabase.auth.updateUser({
            password: newPassword,
        });

        if (error) {
            Alert.alert("Error", error.message);
        } else {
            Alert.alert("Success", "Password changed successfully!");
            setModalVisible(false); // Close modal after success
            setNewPassword(''); // Reset input
        }
    };

    useEffect(() => {
        const fetchUserProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUsername(user.user_metadata?.username || "No Username");
                setEmail(user.email || "No Email");

                const { data, error } = await supabase.from('users_details').select('gender, interests, contact, profilePicture').single();
                if (data) {
                    setGender(data.gender || "Not specified");
                    setInterests(data.interests || "No interests");
                    setContact(data.contact || "No contact info");
                    setProfilePicture(data.profilePicture || "https://i.pinimg.com/236x/31/f4/ea/31f4ea5f4e930b9d6c9e3e0cef0c0f7f.jpg");
                } else if (error) {
                    Alert.alert("Error fetching user data:", error.message);
                }
            }
        };
        fetchUserProfile();
    }, []);

    const handleLogout = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            navigation.replace("Login"); // Redirect to login screen after logout
        } catch (error) {
            console.error("Logout Error:", error.message);
        }
    };


    // fetch user dat from supabse a tbale named users_details 
    // with records interests, gender and contact

    return (
        <ImageBackground source={{ uri: 'https://i.pinimg.com/236x/ed/20/5a/ed205aff1fb33c28ddd8bfc7f3e7ff29.jpg' }}
            resizeMode="cover" style={styles.backgroundImage}>
            <View style={styles.overlay} />
            <View style={styles.container}>

                {/* Profile Section */}
                <View style={styles.profileContainer}>
                    <View style={styles.profileWrapper}>
                        <Image source={{ uri: profilePicture || "https://i.pinimg.com/236x/31/f4/ea/31f4ea5f4e930b9d6c9e3e0cef0c0f7f.jpg" }} style={styles.profileImage} />
                        <TouchableOpacity style={styles.cameraButton} onPress={onSelectImage}>
                            <Ionicons name="camera-outline" size={30} color={"#fff"} />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.username}>{username}</Text>
                </View>

                {/* User Info Section */}
                <View style={styles.bioContainer}>
                    <View style={{ justifyContent: 'center', alignItems: "center" }}>
                        <Text style={styles.bioTitle}>About User</Text>
                    </View>
                    <Text style={styles.bioText}><Text style={styles.label}>Email:</Text> {email}</Text>
                    <Text style={styles.bioText}><Text style={styles.label}>Gender:</Text> {gender}</Text>
                    <Text style={styles.bioText}><Text style={styles.label}>Interests:</Text> {interests}</Text>
                    <Text style={styles.bioText}><Text style={styles.label}>Contact:</Text> {contact}</Text>

                </View>

                <View style={styles.updateView}>
                    <TouchableOpacity onPress={() => { navigation.navigate('UpdateProfile') }}>
                        <Text style={styles.update}>Update Info</Text>
                    </TouchableOpacity>
                </View>

                {/* Buttons Section */}

                {/* Error Message */}
                {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
                <View>
                    <View style={styles.buttonWrapper}>
                        <TouchableOpacity style={styles.button} onPress={() => setModalVisible(true)}>
                            <Text style={styles.buttonText}>Change Password</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.button} onPress={handleLogout}>
                            <Text style={styles.buttonText}>Logout</Text>
                        </TouchableOpacity>
                    </View>
                    <Modal visible={modalVisible} animationType="slide">
                        <View style={styles.modalOverlay}>
                            <View style={styles.modalContainer}>
                                <Text style={styles.modalTitle}>Enter New Password</Text>
                                <TextInput
                                    secureTextEntry
                                    placeholder="New password"
                                    value={newPassword}
                                    onChangeText={setNewPassword}
                                    style={styles.input}
                                />
                                {/* <Button title="Submit" onPress={changePassword} />
                                <Button title="Cancel" onPress={() => setModalVisible(false)} /> */}
                                <TouchableOpacity style={styles.modalButton} onPress={changePassword}>
                                    <Text style={styles.modalButtonText}>Submit</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                                    <Text style={styles.cancelButtonText}>Cancel</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Modal>
                </View>
            </View>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
    container: {
        width: '90%',
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 20,
        padding: 25,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20
    },
    profileContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    profileWrapper: {
        position: 'relative',
        borderRadius: 100,
    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 2,
        borderColor: '#fff'
    },
    cameraButton: {
        position: 'absolute',
        bottom: 5,
        right: 5,
        backgroundColor: '#ff6b6b',
        borderRadius: 20,
        padding: 6
    },
    username: {
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 10,
        color: '#fff'
    },
    bioContainer: {
        width: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        padding: 20,
        borderRadius: 15,
        marginBottom: 20
    },
    bioTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#000',
        textAlign: 'center',
    },
    bioText: {
        fontSize: 16,
        marginBottom: 8,
        color: '#fff',
        textAlign: 'center',
    },
    label: {
        fontWeight: 'bold',
        color: '#ffcc00',
    },
    buttonWrapper: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
    },
    updateView: {
        width: "50%",
        backgroundColor: "blue",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 10,
    },
    update: {
        color: "#fff",
        fontSize: 20,
        paddingVertical: 12,
        borderRadius: 30,
        alignItems: 'center',
        marginHorizontal: 8,
        width: 150,
    },
    button: {
        flex: 1,
        marginTop: 25,
        backgroundColor: '#4a90e2', // Blue color
        paddingVertical: 12,
        borderRadius: 30,
        alignItems: 'center',
        marginHorizontal: 8,
    },
    changePassword: {
        backgroundColor: '#ff6b6b',
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    errorText: {
        color: '#ff6b6b',
        marginTop: 10,
        textAlign: 'center',
        fontSize: 16,
        fontWeight: 'bold',
    },
    modalOverlay: {
        flex: 0.99,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent overlay
        marginTop: 10,
    },
    modalContainer: {
        width: '80%',
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 15,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 10, // Android shadow
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#333',
    },
    input: {
        width: "100%",
        borderBottomWidth: 1,
        borderBottomColor: "#ccc",
        padding: 8,
        marginBottom: 20,
        textAlign: "center",
    },
    modalButton: {
        width: '100%',
        backgroundColor: '#007AFF',
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 10,
    },
    modalButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    cancelButton: {
        marginTop: 10,
    },
    cancelButtonText: {
        color: "#ff6b6b'",
        fontSize: 16,
        fontWeight: "bold",
    },
});