import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import BiometricAuth from '../Authorization/BiometricAuth';
import { setLoggedIn } from '../../redux/slices/userSlice';


const CustomKeyboard = () => {

    const dispatch = useDispatch();
    const theme = useSelector(state => state.theme.styles);
    const [inputValue, setInputValue] = useState('');
    const [errorCode, setErrorCode] = useState(false);
    const [successfullyCode, setSuccessfullyCode] = useState(false);


    useEffect(() => {
        if (inputValue.length == 5) {
            if (inputValue == "11111") {
                setSuccessfullyCode(true);
                setInputValue("")
                dispatch(setLoggedIn())
            } else {
                setErrorCode(true)
                setInputValue("")
            }
        } else if (errorCode && inputValue > 0) {
            setErrorCode(false)
        } else if (successfullyCode && inputValue > 0) {
            setSuccessfullyCode(false)
        }

    }, [inputValue]);

    const handleAddChar = (char) => {
        setInputValue(prev => prev + char);
    };


    const handleDeleteChar = () => {
        setInputValue(prev => prev.slice(0, -1));
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            justifyContent: 'flex-end',
            alignItems: 'center',
            gap: 30,
            paddingBottom: 100,
            backgroundColor: theme.backgroundColor
        },
        inputPassword: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
        },
        inputPasswordDot: {
            height: 15,
            width: 15,
            borderRadius: 100,
            backgroundColor: theme.textColor,
        },
        keyboard: {
            flexDirection: 'column',
            gap: 10,
        },
        keyboardRow: {
            flexDirection: 'row',
            gap: 10,
        },
        key: {
            height: 80,
            width: 80,
            display: "flex",
            alignItems: "center",
            justifyContent: 'center',
            borderRadius: 30,
        },
        keyDell: {
            height: 80,
            width: 80,
            display: "flex",
            alignItems: "center",
            justifyContent: 'center',
        },
        keyText: {
            fontSize: 30,
            color: theme.textColor
        },
        passText: {
            fontSize: 15,
            color: theme.textColor
        }
    });


    return (
        <View style={styles.container}>
            <Text style={styles.passText}>Введите пароль</Text>
            <View style={styles.inputPassword}>
                <View style={[styles.inputPasswordDot, inputValue.length > 0 ? { backgroundColor: "blue" } : {}, errorCode ? { backgroundColor: "red" } : {}, successfullyCode ? { backgroundColor: "green" } : {}]}></View>
                <View style={[styles.inputPasswordDot, inputValue.length > 1 ? { backgroundColor: "blue" } : {}, errorCode ? { backgroundColor: "red" } : {}, successfullyCode ? { backgroundColor: "green" } : {}]}></View>
                <View style={[styles.inputPasswordDot, inputValue.length > 2 ? { backgroundColor: "blue" } : {}, errorCode ? { backgroundColor: "red" } : {}, successfullyCode ? { backgroundColor: "green" } : {}]}></View>
                <View style={[styles.inputPasswordDot, inputValue.length > 3 ? { backgroundColor: "blue" } : {}, errorCode ? { backgroundColor: "red" } : {}, successfullyCode ? { backgroundColor: "green" } : {}]}></View>
                <View style={[styles.inputPasswordDot, inputValue.length > 4 ? { backgroundColor: "blue" } : {}, errorCode ? { backgroundColor: "red" } : {}, successfullyCode ? { backgroundColor: "green" } : {}]}></View>
            </View>
            <View style={styles.keyboard}>
                <View style={styles.keyboardRow}>
                    <TouchableOpacity style={styles.key} onPress={() => handleAddChar('1')}>
                        <Text style={styles.keyText}>1</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.key} onPress={() => handleAddChar('2')}>
                        <Text style={styles.keyText}>2</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.key} onPress={() => handleAddChar('3')}>
                        <Text style={styles.keyText}>3</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.keyboardRow}>
                    <TouchableOpacity style={styles.key} onPress={() => handleAddChar('4')}>
                        <Text style={styles.keyText}>4</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.key} onPress={() => handleAddChar('5')}>
                        <Text style={styles.keyText}>5</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.key} onPress={() => handleAddChar('6')}>
                        <Text style={styles.keyText}>6</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.keyboardRow}>
                    <TouchableOpacity style={styles.key} onPress={() => handleAddChar('7')}>
                        <Text style={styles.keyText}>7</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.key} onPress={() => handleAddChar('8')}>
                        <Text style={styles.keyText}>8</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.key} onPress={() => handleAddChar('9')}>
                        <Text style={styles.keyText}>9</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.keyboardRow}>
                    <View style={styles.keyDell}>
                        <BiometricAuth></BiometricAuth>
                    </View>
                    <TouchableOpacity style={styles.key} onPress={() => handleAddChar('0')}>
                        <Text style={styles.keyText}>0</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.keyDell} onPress={handleDeleteChar}>
                        <Text style={styles.keyText}>⌫</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <Text style={styles.passText}>Версия 1.0.0</Text>
        </View>
    );
};

export default CustomKeyboard;