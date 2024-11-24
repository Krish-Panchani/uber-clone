import { Redirect } from "expo-router";
import { Text, SafeAreaView } from "react-native";

const Home = () => {
    return <Redirect href="/(auth)/welcome" />;
};

export default Home;