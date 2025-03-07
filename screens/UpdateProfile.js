import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../supabase'; // Ensure Supabase is initialized

const UpdateProfile = () => {
    const navigation = useNavigation();

    const [interests, setInterests] = useState('');
    const [gender, setGender] = useState('');
    const [contact, setContact] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [userEmail, setUserEmail] = useState(null);

    useEffect(() => {
        getUserEmail(); // First, get the authenticated user's email
    }, []);

    // Get authenticated user's email
    const getUserEmail = async () => {
        const { data, error } = await supabase.auth.getUser();

        if (error || !data?.user?.email) {
            Alert.alert('Error', 'Failed to get user email.');
            setLoading(false);
            return;
        }

        setUserEmail(data.user.email);
        fetchUserDetails(data.user.email); // Fetch user details after getting email
    };

    // Fetch user details from Supabase
    const fetchUserDetails = async (email) => {
        try {
            const { data, error } = await supabase
                .from('users_details')
                .select('interests, gender, contact')
                .eq('email', email)
                .maybeSingle();

            if (error) throw error;

            if (data) {
                setInterests(data.interests || '');
                setGender(data.gender || '');
                setContact(data.contact || '');
            }
        } catch (error) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false); // Stop loading
        }
    };

    // Update user details in Supabase
    const updateProfile = async () => {
        if (!userEmail) {
            Alert.alert('Error', 'User email is missing.');
            return;
        }

        if (!interests || !gender || !contact) {
            Alert.alert('Error', 'All fields are required.');
            return;
        }

        setSaving(true);
        try {
            const { error } = await supabase
                .from('users_details')
                .update({ interests, gender, contact })
                .eq('email', userEmail);

            if (error) throw error;

            Alert.alert('Success', 'Profile updated successfully!');
            navigation.goBack();
        } catch (error) {
            Alert.alert('Update Failed', error.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loader}>
                <ActivityIndicator size="large" color="#007bff" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Update Profile</Text>

            <TextInput
                placeholder="Your interests (comma separated)"
                value={interests}
                onChangeText={setInterests}
                style={styles.input}
            />

            <TextInput
                placeholder="Gender (e.g. Male, Female, Other)"
                value={gender}
                onChangeText={setGender}
                style={styles.input}
            />

            <TextInput
                placeholder="Contact"
                value={contact}
                onChangeText={setContact}
                keyboardType="phone-pad"
                style={styles.input}
            />

            <TouchableOpacity style={styles.button} onPress={updateProfile} disabled={saving}>
                <Text style={styles.buttonText}>{saving ? 'Saving...' : 'Save Changes'}</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = {
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
        backgroundColor: '#f8f8f8',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    input: {
        borderWidth: 1,
        padding: 10,
        marginBottom: 10,
        borderRadius: 5,
        backgroundColor: '#fff',
    },
    button: {
        backgroundColor: '#007bff',
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
};

export default UpdateProfile;
