const handleLogout = async () => {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        navigation.replace("Login"); // Redirect to login screen after logout
    } catch (error) {
        console.error("Logout Error:", error.message);
    }
};