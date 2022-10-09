import axios from 'axios';
import React, {useEffect, useState} from 'react';
import {
  Alert,
  FlatList,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';
import Share from 'react-native-share';
import EntypoIcon from 'react-native-vector-icons/Entypo';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import FontAwesome5Icon from 'react-native-vector-icons/FontAwesome5';
import Clipboard from '@react-native-clipboard/clipboard';
import AsyncStorage from '@react-native-async-storage/async-storage';
const BaseURL = 'https://icanhazdadjoke.com/';

const App = () => {
  const [text, setText] = useState('');
  const [ModalVisible, setModalVisible] = useState(false);
  const [Registry, setRegistry] = useState([]);
  const [ExtraData, setExtraData] = useState(false);

  const GetData = async () => {
    try {
      await AsyncStorage.getItem('RegistryArray').then(value => {
        if (value !== null) {
          setRegistry(JSON.parse(value));
        }
      });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    RandomGenerator();
    GetData();
  }, []);

  const ShareMessage = text => {
    const shareOptions = {
      title: 'Share via',
      message: text,
    };
    Share.open(shareOptions)
      .then(res => {
        console.log(res);
      })
      .catch(err => {
        err && console.log(err);
      });
  };
  const AddItem = async () => {
    if (text.length > 0) {
      if (Registry.includes(text)) {
        Alert.alert('Warning', 'This joke is already saved in the registry.');
      } else {
        const temp = Registry;
        temp.push(text);
        setRegistry(temp);
        await AsyncStorage.setItem('RegistryArray', JSON.stringify(temp)).catch(
          err => {
            console.log(err);
          },
        );
        setExtraData(!ExtraData);
        ToastAndroid.show('Joke has been saved.', ToastAndroid.SHORT);
      }
    } else Alert.alert('Warning', 'Please generate a joke first.');
  };
  const DeleteItem = index => {
    Alert.alert(
      'Delete',
      'Are you sure you want to delete this joke?',
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: async () => {
            const temp = Registry;
            temp.splice(index, 1);
            setRegistry(temp);
            await AsyncStorage.setItem('RegistryArray', JSON.stringify(temp));
            setExtraData(!ExtraData);
            ToastAndroid.show('Joke has been deleted.', ToastAndroid.SHORT);
          },
        },
      ],
      {cancelable: false},
    );
  };
  const renderItem = ({item, index}) => {
    return (
      <View
        style={{
          flex: 1,
          margin: 10,
          flexDirection: 'row',
          borderBottomWidth: 0.3,
          borderBottomColor: 'gray',
        }}>
        <Text
          onLongPress={() => {
            Alert.alert(
              'Joke',
              item,
              [
                {
                  text: 'Cancel',
                  onPress: () => console.log('Cancel Pressed'),
                  style: 'cancel',
                },
                {
                  text: 'Copy',
                  onPress: () => {
                    ToastAndroid.show(
                      'Copied to clipboard.',
                      ToastAndroid.SHORT,
                    );
                    Clipboard.setString(text);
                  },
                },
              ],
              {cancelable: false},
            );
          }}
          style={{
            fontSize: 20,
            fontWeight: 'bold',
            color: 'black',
            letterSpacing: 1,
            width: '95%',
            marginVertical: 10,
            lineHeight: 30,
            padding: 5,
          }}>
          {index + 1}-) {item}
        </Text>
        <View
          style={{
            position: 'absolute',
            right: -20,
            top: 0,
            bottom: 0,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 10,
            flexDirection: 'column',
          }}>
          <TouchableOpacity
            onPress={() => {
              DeleteItem(index);
            }}>
            <FontAwesomeIcon
              name="trash"
              size={35}
              color="red"
              style={{bottom: 20}}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              ShareMessage(item);
            }}>
            <EntypoIcon
              name="share"
              size={35}
              color="green"
              style={{bottom: 5}}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  const RandomGenerator = async () => {
    const response = await axios.get(`${BaseURL}`, {
      headers: {
        Accept: 'application/json',
      },
    });
    setText(response.data.joke);
  };
  const RegistryModal = () => {
    return (
      <SafeAreaView style={{flex: 1}}>
        <Modal
          style={{flex: 1}}
          visible={ModalVisible}
          animationType="fade"
          transparent={false}
          onRequestClose={() => {
            ToastAndroid.show('Registry has been closed.', ToastAndroid.SHORT);
            setModalVisible(false);
          }}>
          <SafeAreaView
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: '#E6DDBA',
            }}>
            <Text
              style={{
                fontWeight: 'bold',
                color: '#9A2262',
                fontSize: 33,
                padding: 10,
              }}>
              Saved Jokes
            </Text>
            <FlatList
              data={Registry}
              extraData={ExtraData}
              renderItem={renderItem}
              keyExtractor={(item, index) => index.toString()}
            />
            <TouchableOpacity
              style={{
                backgroundColor: 'cyan',
                borderRadius: 20,
                width: 90,
                height: 60,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#FC8389',
                margin: 20,
              }}
              onPress={() => {
                setModalVisible(false);
              }}>
              <Text style={{color: 'black', fontWeight: 'bold'}}>Close</Text>
            </TouchableOpacity>
          </SafeAreaView>
        </Modal>
      </SafeAreaView>
    );
  };
  return (
    <SafeAreaView
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ebd2b4',
      }}>
      <ScrollView
        style={{flex: 1, width: '92%', marginVertical: 10, top: '2%'}}>
        <Text
          onLongPress={() => {
            Alert.alert(
              'Joke',
              text,
              [
                {
                  text: 'Cancel',
                  onPress: () => console.log('Cancel Pressed'),
                  style: 'cancel',
                },
                {
                  text: 'Copy',
                  onPress: () => {
                    ToastAndroid.show(
                      'Copied to clipboard.',
                      ToastAndroid.SHORT,
                    );
                    Clipboard.setString(text);
                  },
                },
              ],
              {cancelable: false},
            );
          }}
          style={{
            fontWeight: 'bold',
            color: 'black',
            fontSize: 22,
            letterSpacing: 1,
            lineHeight: 32,
            top: '2%',
          }}>
          {text}
        </Text>
      </ScrollView>
      <View style={{flex: 0.2, top: '1%'}}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            marginVertical: 20,
            top: '5%',
          }}>
          <TouchableOpacity
            style={[styles.button, {backgroundColor: '#f1c40f', right: '15%'}]}
            onPress={() => {
              RandomGenerator();
            }}>
            <Text style={{color: 'black', fontWeight: 'bold'}}>Generate</Text>
            <FontAwesome5Icon name="random" size={30} color="black" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, {backgroundColor: '#acecf7', left: '15%'}]}
            onPress={() => {
              AddItem();
            }}>
            <Text style={{color: 'black', fontWeight: 'bold', bottom: 1}}>
              Save to registry
            </Text>
            <FontAwesomeIcon name="save" size={30} color="black" />
          </TouchableOpacity>
        </View>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            marginVertical: 30,
          }}>
          <TouchableOpacity
            style={[styles.button, {backgroundColor: '#BCF7C9', right: '15%'}]}
            onPress={() => {
              if (text.length > 0) {
                ShareMessage(text);
              } else Alert.alert('Warning', 'Please generate a joke first.');
            }}>
            <Text
              style={{
                color: 'black',
                fontWeight: 'bold',
                margin: 2,
                bottom: 2,
              }}>
              Share
            </Text>
            <EntypoIcon name="share" size={30} color="black" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, {backgroundColor: '#f4989c', left: '15%'}]}
            onPress={() => {
              setModalVisible(true);
            }}>
            <Text
              style={{
                color: 'black',
                fontWeight: 'bold',
                marginVertical: 5,
                bottom: 5,
              }}>
              Registry
            </Text>
            <FontAwesome5Icon name="history" size={25} color="black" />
          </TouchableOpacity>
        </View>
      </View>
      <RegistryModal style={{flex: 1}} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 75,
    width: 120,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
    marginVertical: 20,
    padding: 15,
  },
});

export default App;
