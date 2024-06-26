import { ScrollView, Text, View, FlatList, TouchableOpacity, Button, TextInput, ActivityIndicator, Animated, Easing, Modal, Platform, Dimensions, KeyboardAvoidingView } from 'react-native'
import { ApiUrl, createWebSocketConnection, formatDateTime, parseJsonString, useDebouncedFunction } from '../../../Constains';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { setActiveChat } from '../../redux/slices/userSlice';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useMemo, useRef, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView as ExpoBlurView } from 'expo-blur';
import { SlideInRight } from 'react-native-reanimated';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';

import Ionicons from 'react-native-vector-icons/Ionicons';
import Entypo from 'react-native-vector-icons/Entypo';
import * as SecureStore from 'expo-secure-store';
import SwiperFlatList from 'react-native-swiper';
import MessagesStyles from './MessagesStyles';
import IconUser from '../Ui/IconUser'
import MuTosat from '../Ui/MuToast';
import ChatScreen from './ChatScreen/ChatScreen';
import getApi from '../../../api/getApi';
import JSEncrypt from 'jsencrypt';


export default function Chats() {

    const navigation = useNavigation();
    const dispatch = useDispatch();

    const { showNotification } = MuTosat()
    const { styles } = MessagesStyles()
    const { api } = getApi()
    const encryptor = new JSEncrypt()

    const localPrivateKey = useSelector(state => state.session.localPrivateKey)
    const lokalPublicKey = useSelector(state => state.session.lokalPublicKey)
    const publicKey = useSelector(state => state.session.publicKey)
    const theme = useSelector(state => state.theme.styles);
    const uuid = useSelector(state => state.session.uuid)

    const token = SecureStore.getItem("userToken");
    const encodedToken = encodeURIComponent(token);

    const [isSearchVisible, setSearchVisible] = useState(false);
    const [serchLoadind, setSerchLoading] = useState(false);
    const [serchResult, setSerchResult] = useState([])
    const [serchValue, setSerchValue] = useState("");

    const [ferstLoadindChats, setFerstLoadindChats] = useState(true);

    const [soNameProps, setSoNameProps] = useState(null)
    const [nameProps, setNameProps] = useState(null)
    const [showChat, setChowChat] = useState(false)
    const [chats, setChats] = useState([]);

    const swiperRef = useRef(null);
    const serchRef = useRef(null)
    const socketRef = useRef()

    const inputWidth = useRef(new Animated.Value(1)).current;
    const widthInterpolate = inputWidth.interpolate({
        inputRange: [0.8, 1],
        outputRange: ['90%', '100%']
    });


    useEffect(() => {
        getChats()
        createWebSocketConnection({ socketUrl: "/chatsWS/events-chats?userToken=" + encodedToken + "&publicKey=" + encodeURIComponent(lokalPublicKey) })
            .then((socket) => {
                socketRef.current = socket;
                socket.onmessage = (event) => {
                    const parsedData = parseJsonString(event.data);
                    if (parsedData && parsedData.chatUpdate) {
                        const newChat = decryptChats(parsedData.chatUpdate, localPrivateKey)
                        setChats((prevChats) => {
                            const chatIndex = prevChats.findIndex(chat => chat.chat_id === newChat.chat_id);
                            if (chatIndex !== -1) {
                                const updatedChats = [...prevChats];
                                updatedChats[chatIndex] = newChat;
                                return updatedChats;
                            } else {
                                return [newChat, ...prevChats];
                            }
                        });
                    }
                };
            })
            .catch(() => {
                showNotification({ "message": "Ошибка соеденения, перезагрузите страницу", "type": "er" })
            });

    }, []);

    useEffect(() => {
        setSerchLoading(true)
        getSerchResultD(serchValue)
    }, [serchValue]);


    const getSerchResultD = useDebouncedFunction((value) => getSerchResult(value), 500)

    const getChats = () => {
        encryptor.setPublicKey(publicKey);
        const cruptToken = encryptor.encrypt(token)
        api.get(ApiUrl + `/chats/get-chats?user_token=${encodeURIComponent(cruptToken)}&publicKey=${encodeURIComponent(lokalPublicKey)}&uuid=${uuid}`).then((response) => {
            if (response.data.chats) {
                setChats(decryptChats(response.data.chats))
            }
        }).finally(() => setFerstLoadindChats(false))
    }

    const getSerchResult = (serchStr) => {
        if (serchStr.length > 0) {
            encryptor.setPublicKey(publicKey);
            const cruptToken = encryptor.encrypt(token)
            const cruptSerchStr = encryptor.encrypt(serchStr)
            api.get(ApiUrl + `/chats/find-chats?search_term=${encodeURIComponent(cruptSerchStr)}&user_token=${encodeURIComponent(cruptToken)}&uuid=${uuid}`).then((response) => {
                if (response.data.data) {
                    setSerchResult(response.data.data)
                } else {
                    setSerchResult([])
                }
            }).finally(() => setSerchLoading(false))
        } else {
            let serchHistory = SecureStore.getItem("serchHistory")
            if (!serchHistory) {
                serchHistory = []
                SecureStore.setItem("serchHistory", JSON.stringify([]))
            } else {
                serchHistory = JSON.parse(serchHistory)
            }
            setSerchResult(serchHistory)
            setSerchLoading(false)
        }
    }

    const serchOn = () => {
        setSearchVisible(true);
        Animated.timing(inputWidth, {
            toValue: 0.8,
            duration: 150,
            easing: Easing.linear,
            useNativeDriver: false,
        }).start();
        setSearchVisible(!isSearchVisible);
        handleToggleSearch()
    }


    const serchOff = (clearSerchInput = true) => {
        Animated.timing(inputWidth, {
            toValue: 1,
            duration: 150,
            easing: Easing.linear,
            useNativeDriver: false,
        }).start();
        setSearchVisible(false)
        serchRef.current?.blur()
        handleToggleSearch()
        if (clearSerchInput) {
            setSerchValue("")
        }
    }

    const handleToggleSearch = () => {
        const newIndex = isSearchVisible ? 1 : 0;
        swiperRef.current?.scrollTo(newIndex);
    };

    async function updateSearchHistory(item) {
        try {
            let serchHistoryString = SecureStore.getItem("serchHistory");
            let serchHistory = serchHistoryString ? JSON.parse(serchHistoryString) : [];
            const existingItem = serchHistory.find(existingItem => existingItem.user_id === item.user_id);
            if (existingItem) {
                if (existingItem.name !== item.name || existingItem.soName !== item.soName) {
                    existingItem.name = item.name;
                    existingItem.soName = item.soName;
                }
            } else {
                serchHistory.push(item);
            }
            SecureStore.setItemAsync("serchHistory", JSON.stringify(serchHistory));
        } catch {
            None
        }
    }
    const clearSerchItem = () => {
        SecureStore.setItemAsync("serchHistory", JSON.stringify([]));
        setSerchResult([])
    }

    const selektSerchItem = async (itemId, name, soName) => {
        const createChat = async () => {
            const token = SecureStore.getItem("userToken");
            const requestData = {
                "companion_id": itemId.toString(),
                "user_token": token,
                "uuid": uuid,
                "pKey": lokalPublicKey,
            }

            let chatId = null

            await api.post(ApiUrl + "/chats/create-chat", requestData).then(response => {
                encryptor.setPrivateKey(localPrivateKey)
                chatId = encryptor.decrypt(response.data.chat_id);
            })

            const item = serchResult.find(item => item.user_id === itemId)

            updateSearchHistory(item)
            dispatch(setActiveChat(chatId))
        }
        createChat()
        navigation.navigate('ChatScreen', { name: name, soName: soName })
    }


    const decryptChatField = (encryptedField) => {
        if (!encryptedField) return "";
        encryptor.setPrivateKey(localPrivateKey)
        return encryptor.decrypt(encryptedField);
    };

    const decryptChat = (chat) => {
        return {
            chat_id: decryptChatField(chat.chat_id),
            companion_id: decryptChatField(chat.companion_id),
            companion_name: decryptChatField(chat.companion_name),
            companion_so_name: decryptChatField(chat.companion_so_name),
            companion_nik: decryptChatField(chat.companion_nik),
            last_msg: decryptChatField(chat.last_msg),
            chat_type: chat.chat_type,
            last_msg_time: chat.last_msg_time,
            last_updated: chat.last_updated,
            new_msg_count: chat.new_msg_count,
            secured: chat.secured,
            is_my_message: chat.is_my_message
        };
    };

    const decryptChats = (chats) => {
        if (Array.isArray(chats)) {
            return chats.map(chat => decryptChat(chat));
        } else {
            return decryptChat(chats);
        }
    };

    const sortedChats = useMemo(() => {
        return [...chats].sort((a, b) => {
            if (a.secured === b.secured) {
                return new Date(b.last_updated) - new Date(a.last_updated);
            }
            return a.secured ? -1 : 1;
        });
    }, [chats]);

    const renderItem = ({ item }) => (
        <Animated.View entering={SlideInRight.duration(500)}>
            <TouchableOpacity
                onPress={() => {
                    dispatch(setActiveChat(item.chat_id));
                    navigation.navigate('ChatScreen', { name: item.companion_name, soName: item.companion_so_name });
                }}
                onLongPress={() => {
                    dispatch(setActiveChat(item.chat_id));
                    setNameProps(item.companion_name)
                    setSoNameProps(item.companion_so_name)
                    setChowChat(true)

                }}
                style={styles.userItem}
            >
                <IconUser size={30} />
                <View style={styles.userItemSubContent}>
                    <View style={styles.usetTitleContaner}>
                        <Text style={{ color: theme.activeItems }}>{item.companion_name} {item.companion_so_name}</Text>
                        <View style={styles.userCheckAndTimeContaner}>
                            {item.IsMyMessage && (
                                <>
                                    {item.lastMsgRead ? (
                                        <Ionicons name="checkmark-done-sharp" size={15} color={theme.activeItems}></Ionicons>
                                    ) : (
                                        <Ionicons name="checkmark-done" size={15} color={theme.textColor}></Ionicons>
                                    )}
                                </>
                            )}
                            {item.last_msg_time && (
                                <Text style={{ color: theme.activeItems }}>{formatDateTime(item.last_msg_time)}</Text>
                            )}
                        </View>
                    </View>
                    <View style={styles.userLastMsgContaner}>
                        {item.last_msg && (
                            <View style={styles.userLastMsg}>
                                <Text style={{ color: theme.activeItems }} numberOfLines={5} ellipsizeMode="tail">{item.last_msg}</Text>
                            </View>
                        )}
                        {item.new_msg_count != 0 && (
                            <View style={styles.userCountMsg}>
                                <Text style={{ color: theme.activeItems }}>{item.new_msg_count}</Text>
                            </View>
                        )}
                    </View>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );

    const closeModal = () => {
        setChowChat(false)
    };

    const { width, height } = Dimensions.get('window');

    return (
        <>
            <SafeAreaProvider>
                <SafeAreaView style={{ flex: 1, backgroundColor: theme.backgroundColor }}>
                    <View style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                        <Animated.View style={{ width: widthInterpolate }}>
                            <View style={{ display: "flex", flexDirection: "row", gap: 10, borderRadius: 5, padding: 10 }}>
                                <Entypo name={"magnifying-glass"} size={20} style={{ position: "absolute", display: "flex", alignItems: "center", justifyContent: "center", left: 20, top: 18, zIndex: 2 }} />
                                <View style={{ borderRadius: 20, flex: 1, maxWidth: "100%", backgroundColor: theme.textColor, padding: 10, zIndex: 1 }}>
                                    <TextInput
                                        ref={serchRef}
                                        onFocus={serchOn}
                                        style={{ paddingLeft: 30 }}
                                        value={serchValue}
                                        onChangeText={text => setSerchValue(text)}
                                        placeholder={"Поиск..."} />
                                </View>
                            </View>
                        </Animated.View>
                        <TouchableOpacity onPress={serchOff} style={{ right: -5 }}>
                            <Ionicons name="close-circle-outline" size={24} color={theme.textColor} />
                        </TouchableOpacity>
                    </View>
                    <Modal
                        animationType="fade"
                        transparent={true}
                        visible={showChat}
                        onRequestClose={closeModal}
                    >
                        {Platform.OS === 'ios' ? (
                            <KeyboardAvoidingView
                                behavior={Platform.OS === "ios" ? "padding" : "height"}
                                style={{ flex: 1, justifyContent: 'center', alignItems: 'center', position: "relative" }}
                            >
                                <ExpoBlurView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', position: "relative" }} intensity={50}>
                                    <TouchableWithoutFeedback onPress={closeModal}>
                                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', width: width, height: width, top: 0, left: 0, }}>
                                        </View>
                                    </TouchableWithoutFeedback>
                                    <View style={{ flex: 1, height: height * 0.55, width: width * 0.9, zIndex: 1, position: "absolute", borderRadius: 10, overflow: "hidden" }}>
                                        <ChatScreen renderForModal={true} nameProps={nameProps} soNameProps={soNameProps} />
                                    </View>
                                </ExpoBlurView>
                            </KeyboardAvoidingView>
                        ) : (
                            <>
                                <KeyboardAvoidingView oardAvoidingView
                                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                                    style={{ flex: 1, justifyContent: 'center', alignItems: 'center', position: "relative" }}
                                >
                                    <TouchableOpacity onPress={closeModal}>
                                        <LinearGradient
                                            colors={['rgba(0,0,0,0.9)', 'rgba(0,0,0,0.9)']}
                                            style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
                                        >
                                            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', width: width, height: width, top: 0, left: 0, zIndex: 2, }}>
                                            </View>
                                        </LinearGradient>
                                    </TouchableOpacity>
                                    <View style={{ flex: 1, height: height * 0.55, width: width * 0.9, zIndex: 1, position: "absolute", borderRadius: 10, overflow: "hidden" }}>
                                        <ChatScreen renderForModal={true} nameProps={nameProps} soNameProps={soNameProps} />
                                    </View>
                                </KeyboardAvoidingView>
                            </>
                        )}
                    </Modal>
                    {ferstLoadindChats ? (
                        <View style={{ height: "100%", width: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <ActivityIndicator></ActivityIndicator>
                        </View>
                    ) : (

                        <SwiperFlatList
                            ref={swiperRef}
                            loop={false}
                            showsPagination={false}
                            index={1}
                            onIndexChanged={(value) => {
                                if (value == 1) {
                                    serchOff(false)
                                } else {
                                    serchOn()
                                }
                            }}
                        >
                            <View>
                                {!serchLoadind ? (
                                    <>
                                        {serchValue.length == 0 && serchResult.length != 0 && (
                                            <View style={styles.userItem}>
                                                <Text style={{ color: theme.activeItems }}>Недавние</Text>
                                                <TouchableOpacity style={{ backgroundColor: "red", padding: 5, borderRadius: 10 }} onPress={clearSerchItem}>
                                                    <Text style={{ color: theme.activeItems }}>Очистить</Text>
                                                </TouchableOpacity>
                                            </View>
                                        )}
                                        <ScrollView
                                            scrollEventThrottle={10}
                                            style={styles.container}
                                        >
                                            {serchResult.map(chat => (
                                                <TouchableOpacity
                                                    key={chat.user_id}
                                                    onPress={() => selektSerchItem(chat.user_id, chat.name, chat.soName)}
                                                    style={styles.userItem}
                                                >
                                                    <IconUser size={25} />
                                                    <View style={styles.userItemSubContent}>
                                                        <View style={styles.usetTitleContaner}>
                                                            <Text style={{ color: theme.activeItems }}>{chat.name} {chat.soName}</Text>
                                                        </View>
                                                        <View style={styles.usetTitleContaner}>
                                                            <Text style={{ color: theme.activeItems }}>{chat.nik}</Text>
                                                        </View>
                                                    </View>
                                                </TouchableOpacity>
                                            ))}
                                        </ScrollView>
                                    </>
                                ) : (
                                    <View style={{ height: "100%", width: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                        <ActivityIndicator></ActivityIndicator>
                                    </View>
                                )}
                            </View>
                            <View>
                                {/* <Button title='Обновить' onPress={getChats}></Button> */}
                                <FlatList
                                    data={sortedChats}
                                    renderItem={renderItem}
                                    keyExtractor={item => item.chat_id.toString()}
                                    contentContainerStyle={styles.contentContainer}
                                    style={styles.container}
                                />
                            </View>
                        </SwiperFlatList>

                    )}

                </SafeAreaView>
            </SafeAreaProvider >
        </>
    )
}



