import { setMessage, setOpenModelAbout } from '../../../../redux/slices/messageSlice';
import { Text, TouchableOpacity, View } from 'react-native';
import { useDispatch } from 'react-redux';
import { useState } from 'react';

import ChatScreenStyles from '../ChatScreenStyles';
import { RightSwipeEvent } from '../../../Ui/Modalize';
import { formatDateTime } from '../../../../../Constains';
import Feather from 'react-native-vector-icons/Feather'

const MessageItem = ({ item, chowDate }) => {

    const dispatch = useDispatch();
    const { styles } = ChatScreenStyles();

    const [lastTap, setLastTap] = useState(null);

    const handleDoubleTap = () => {
        const now = Date.now();

        const DOUBLE_PRESS_DELAY = 600;

        if (lastTap && (now - lastTap) < DOUBLE_PRESS_DELAY) {
            dispatch(setMessage(item))
            dispatch(setOpenModelAbout(true))
        } else {
            setLastTap(now);
        }
    };

    return (
        <>
            <RightSwipeEvent>
                {chowDate && (
                    <Text>Date</Text>
                )}
                {item?.status == "loading" ? (
                    <View
                        style={item.is_my_message ? styles.myMessage : styles.otherMessage}
                    >
                        <Text style={{ color: 'black' }}>{item.message_text}</Text>
                        <Feather name="clock" style={[styles.time, { fontSize: 13, marginTop: 3 }]}></Feather>
                    </ View>
                ) : (
                    <TouchableOpacity
                        onLongPress={() => { dispatch(setMessage(item)), dispatch(setOpenModelAbout(true)) }}
                        onPress={handleDoubleTap}
                        style={item.is_my_message ? styles.myMessage : styles.otherMessage}
                    >
                        <Text style={{ color: 'black' }}>{item.message_text}</Text>
                        <Text style={styles.time}>{formatDateTime(item.created_at)}</Text>
                        {console.log(item.created_at)}
                    </ TouchableOpacity>
                )}
            </RightSwipeEvent>
        </>

    );
};


export default MessageItem;
