import {
  View,
  Text,
  SafeAreaView,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Keyboard,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { theme } from "../theme";
import { MagnifyingGlassIcon as SearchIcon } from "react-native-heroicons/outline";
import { MapPinIcon as MapIcon } from "react-native-heroicons/solid";
import { Feather } from "@expo/vector-icons";
import { Entypo } from "@expo/vector-icons";
import { FontAwesome } from "@expo/vector-icons";
import { debounce } from "lodash";
import { fetchLocations, fetchWeatherForecast } from "../api/weather";
import { weatherImages } from "../constants";
import * as Progress from "react-native-progress";


export default function HomeScreen() {
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [locations, setLocations] = useState([]);
  const [weather, setWeather] = useState({});
  const [loading, setLoading] = useState(true);
  
  const [isCelsius, setIsCelsius] = useState(true);
  const toggleTemperatureUnit = () => {
    setIsCelsius(!isCelsius);
  };

  const [isKilometer, setIsKilometer] = useState(true);
  const toggleDistanceUnit = () => {
    setIsKilometer(!isKilometer);
  };

  const [isDarkMode, setIsDarkMode] = useState(true);
  const toggleColorScheme = () => {
    setIsDarkMode(!isDarkMode);
  }

  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
      }
    );

    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  });

  const handelLocation = (loc) => {
    console.log(locations);
    setLocations([]);
    setShowSearchBar(false);
    setLoading(true);
    fetchWeatherForecast({
      cityName: loc.name,
      days: "3",
    }).then((data) => {
      setWeather(data);
      setLoading(false);
      console.log(data);
    });
  };

  const handleSearch = (value) => {
    if (value.length > 2) {
      fetchLocations({ cityName: value }).then((data) => setLocations(data));
    }
  };

  useEffect(() => {
    fetchMyWeatherData();
  }, []);
  const fetchMyWeatherData = async () => {
    fetchWeatherForecast({ cityName: "Muscat", days: "3" }).then((data) => {
      setWeather(data);
      setLoading(false);
    });
  };
  const handleDebounce = useCallback(debounce(handleSearch, 1000), []);
  const { current, location } = weather;

  return (
    <View
      className="h-[7] flex-1 relative"
      style={{ backgroundColor: isDarkMode ? "black" : "white" }}
    >
      <StatusBar style={isDarkMode ? "light" : "dark"} />

      {loading ? (
        <View className="flex-1 flex-row justify-center items-center">
          <Progress.CircleSnail thickness={10} size={140} color="white" />
        </View>
      ) : (
        <SafeAreaView className="flex flex-1">
          {/* SEARCH BAR SECTION */}

          <View className=" mx-5 mt-10 relative z-50">
            <View
              className="flex-row justify-end items-center rounded-full "
              style={{
                backgroundColor: showSearchBar ? `#a0c9e1` : "transparent",
              }}
            >
              {showSearchBar ? (
                <TextInput
                  onChangeText={handleDebounce}
                  placeholder="Search City"
                  placeholderTextColor={"white"}
                  className="text-center h-12 pl-4 text-xl pb-1 flex-1"
                />
              ) : null}

              <TouchableOpacity
                onPress={() => setShowSearchBar(!showSearchBar)}
                style={{ backgroundColor: `#36B4FF` }}
                className="p-3 rounded-full m-1"
              >
                <SearchIcon size={25} color="white" />
              </TouchableOpacity>
            </View>
            {locations.length > 0 && showSearchBar ? (
              <View
                className=" absolute w-full top-16 rounded-3xl "
                style={{
                  backgroundColor: "rgba(160, 201, 225, 0.6)",
                  borderBottomColor: "#f0f0f0",
                  backdropFilter: "blur(6px)",
                }}
              >
                {locations.map((loc, index) => {
                  let showBorder = index + 1 != locations.length;
                  let borderClass = showBorder ? "" : "";
                  return (
                    <TouchableOpacity
                      onPress={() => handelLocation(loc)}
                      key={index}
                      className={
                        "flex-row items-center m-1 p-3  px-4 " + borderClass
                      }
                    >
                      <MapIcon size={20} color={"white"} />
                      <Text className="text-white font-bold text-lg ml-2">
                        {loc?.name}, {loc?.country}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : null}
          </View>

          {/* FORECAST SECTION */}

          {!isKeyboardVisible && (
            <View className="flex-1 flex justify-around mx-5">
              <View
                className="rounded-3xl py-4 px-5"
                style={{ backgroundColor: "rgba(54,180,255, 1)" }}
              >
                <View className="flex-row items-center justify-center">
                  <Text className="text-white text-3xl font-bold items-center justify-center">
                    {location?.name}, {location?.country}
                  </Text>
                </View>

                {/* IMAGE VIEW */}
                <View className="justify-center flex-row my-7">
                  <Image
                    source={weatherImages[current?.condition?.text]}
                    className="w-52 h-52"
                  />
                </View>

                {/* TEMPERATURE CELCIUS */}
                <View>
                  <TouchableOpacity onPress={toggleTemperatureUnit}>
                    <Text className="text-center text-6xl text-white font-bold">
                      {isCelsius ? current?.temp_c : current?.temp_f}&#176;
                      {isCelsius ? "C" : "F"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* WEATHER CONDITIONS */}

              <View
                className="p-6 rounded-3xl"
                style={{ backgroundColor: "rgba(54,180,255, 1)" }}
              >
                <View className="flex-row items-center">
                  <View className="mr-8 flex-row space-x1 items-center ">
                    <Feather name="wind" size={30} color="white" />
                    <TouchableOpacity onPress={toggleDistanceUnit}>
                      <Text className="items-center text-white text-lg font-semibold items-center">
                        {isKilometer
                          ? current?.wind_kph + " km"
                          : current?.wind_mph + " mi"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <View className="mr-8 flex-row space-x1 items-center items-center ">
                    <Entypo name="drop" size={30} color="white" />
                    <Text className="items-center text-white text-lg font-semibold">
                      {current?.humidity}%
                    </Text>
                  </View>
                  <View className="flex-row space-x1 items-center ">
                    <Feather name="sun" size={30} color="white" />
                    <Text className="items-center text-white text-lg font-semibold">
                      {" " + current?.uv}
                    </Text>
                  </View>
                </View>
              </View>

              {/* NEXT DAYS FORECAST */}

              <View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {weather?.forecast?.forecastday?.map((days, index) => {
                    let date = new Date(days.date);
                    let options = { weekday: "long" };
                    let dayName = date.toLocaleDateString("en-US", options);
                    return (
                      <View
                        key={index}
                        className=" w-32 rounded-3xl py-4 px-5 mr-4"
                        style={{ backgroundColor: "rgba(54,180,255, 1)" }}
                      >
                        <Image
                          source={weatherImages[days?.day?.condition?.text]}
                          className="w-12 h-12 ml-5"
                        />
                        <Text className="text-white font-semibold text-center py-1">
                          {dayName}
                        </Text>
                        <Text className="text-white font-semibold text-lg text-center">
                          {isCelsius
                            ? days?.day?.avgtemp_c
                            : days?.day?.avgtemp_f}
                          &#176;
                          {isCelsius ? "C" : "F"}
                        </Text>
                      </View>
                    );
                  })}
                </ScrollView>
              </View>

              {/* COLOR SCHEME BUTTON */}

              <TouchableOpacity onPress={toggleColorScheme}>
                <View
                  className="p-3 rounded-3xl items-center "
                  style={{ backgroundColor: "rgba(54,180,255, 1)" }}
                >
                  <View className="flex-row space-x1 items-center ">
                    <Text className="items-center text-white text-3xl font-semibold">
                      {isDarkMode ? "Dark mode" : "Light mode"}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          )}
        </SafeAreaView>
      )}
    </View>
  );
}
