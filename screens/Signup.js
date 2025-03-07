import { StatusBar } from 'expo-status-bar';
import { supabase } from '../supabase';
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ImageBackground, TouchableOpacity } from 'react-native';

const image = { uri: 'https://i.pinimg.com/736x/af/e1/1b/afe11bd360cf7366be1d4bc7bc79b375.jpg' };

const SignupScreen = ({ navigation }) => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [focusedInput, setFocusedInput] = useState(null);

    const handleSignup = async () => {
        if (!email || !password || !username) {
            setErrorMessage("Please enter all required fields");
            return;
        }

        try {
            // Sign up user with Supabase Auth
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: { data: { username } } // Save username in user metadata
            });

            if (error) throw error;
            if (!data?.user?.id) throw new Error("Signup failed. Try again.");

            // Store additional user details in 'users_details' table
            const { error: profileError } = await supabase
                .from('users_details')
                .insert([{ email, username }]);

            if (profileError) throw profileError;

            // Redirect to Login Screen
            navigation.navigate('Login');
        } catch (error) {
            setErrorMessage(error.message || "Signup failed. Check your internet connection.");
        }
    };

    return (
        <>
            <StatusBar style='dark' />
            <ImageBackground source={image} resizeMode='cover' style={styles.backgroundImage}>
                <View style={styles.container}>
                    <Text style={styles.header}>Sign Up</Text>
                    <View style={styles.subcontainer}>
                        <Text style={styles.text}>Username</Text>
                        <TextInput
                            style={[styles.input, { color: focusedInput === 'input1' ? 'yellow' : '#000' }]}
                            value={username}
                            placeholder='Enter your username'
                            placeholderTextColor='#999'
                            onChangeText={setUsername}
                            onFocus={() => setFocusedInput('input1')}
                            onBlur={() => setFocusedInput(null)}
                        />

                        <Text style={styles.text}>Email</Text>
                        <TextInput
                            style={[styles.input, { color: focusedInput === 'input2' ? 'yellow' : '#000' }]}
                            value={email}
                            placeholder='example@gmail.com'
                            placeholderTextColor='#999'
                            keyboardType="email-address"
                            autoCapitalize="none"
                            onChangeText={setEmail}
                            onFocus={() => setFocusedInput('input2')}
                            onBlur={() => setFocusedInput(null)}
                        />

                        <Text style={styles.text}>Password</Text>
                        <TextInput
                            style={[styles.input, { color: focusedInput === 'input3' ? 'yellow' : '#000' }]}
                            value={password}
                            placeholder='********'
                            placeholderTextColor='#999'
                            secureTextEntry
                            autoCorrect={false}
                            onChangeText={setPassword}
                            onFocus={() => setFocusedInput('input3')}
                            onBlur={() => setFocusedInput(null)}
                        />

                        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
                    </View>

                    <TouchableOpacity onPress={handleSignup} style={styles.button}>
                        <Text style={styles.buttonText}>Signup</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                        <Text style={styles.loginText}>
                            Already have an account? <Text style={styles.loginLink}>Login</Text>
                        </Text>
                    </TouchableOpacity>
                </View>
            </ImageBackground>
        </>
    );
};

export default SignupScreen;

// 🔹 Styles
const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
        justifyContent: "center"
    },
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: 'center',
    },
    header: {
        marginBottom: 40,
        color: "#2f3061",
        backgroundColor: "#758173",
        width: "80%",
        height: 40,
        textAlign: 'center',
        fontSize: 25,
        borderRadius: 5,
        padding: 4,
    },
    input: {
        fontSize: 18,
        height: 40,
        borderWidth: 1,
        padding: 10,
        borderRadius: 5,
        marginBottom: 20,
        borderColor: "grey",
        backgroundColor: "grey"
    },
    text: {
        color: "#3D7A57",
        fontSize: 18,
    },
    subcontainer: {
        width: "80%",
        padding: 15,
    },
    button: {
        backgroundColor: "green",
        borderRadius: 10,
        width: 200,
        alignItems: 'center',
        paddingVertical: 10,
        marginTop: 10,
    },
    buttonText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: "#fff",
    },
    errorText: {
        backgroundColor: "#fff",
        color: "red",
        fontSize: 16,
        textAlign: 'center',
        borderRadius: 5,
        padding: 5,
        marginTop: 5,
    },
    loginText: {
        marginTop: 15,
        fontSize: 18,
        color: "#fff",
    },
    loginLink: {
        color: "darkblue",
        fontSize: 20,
        fontWeight: "bold",
    },
});
