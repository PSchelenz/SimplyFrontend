import { StyleSheet, Text, View, TextInput, StatusBar, TouchableHighlight, Image, Animated, Dimensions, Switch } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { FontAwesome } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';

export default function App() {
  const [textQuestion, setTextQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [recording, setRecording] = useState(null);
  const [recordingURI, setRecordingURI] = useState('');
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [animatedDots, setAnimatedDots] = useState({
    dot1: new Animated.Value(0),
    dot2: new Animated.Value(0),
    dot3: new Animated.Value(0)
  });
  const [assistantConversational, setAssistantConversational] = useState(false);
  const [optionsHeight, setOptionsHeight] = useState('auto');
  const [optionsSlide, setOptionsSlide] = useState(new Animated.Value(0));

  let touchStart, touchEnd;

  const updownAnimation = (dot) => {
    Animated.loop(Animated.sequence([
      Animated.timing(dot, {
        toValue: 12,
        duration: 1000,
        useNativeDriver: false,
      }),
      Animated.timing(dot, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: false,
      })
    ]), {iterations: 1000}).start();
  };

  const runRecordingAnimations = () => {
    updownAnimation(animatedDots.dot1);

    setTimeout(() => {
      updownAnimation(animatedDots.dot2);
    }, 100)

    setTimeout(() => {
      updownAnimation(animatedDots.dot3);
    }, 200)
  }

  const handleSendQuestion = () => {
    data = undefined;
    headers = {};

    console.log('TextQuestion', textQuestion);
    console.log('Recording', recordingURI);

    if (textQuestion.length > 0) {
      data = JSON.stringify({
        question: textQuestion,
      });

      headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      };

    } else if (recordingURI != null) {
      const filetype = recordingURI.split(".").pop();
      const filename = recordingURI.split("/").pop();
      data = new FormData();

      data.append("question", {
        uri: recordingURI,
        type: `audio/${filetype}`,
        name: filename,
      });

      headers = {
        'Accept': 'application/json',
      };
    } else {
      return;
    }

    fetch("http://192.168.0.10:8000/api/assistant/question", {
      headers: headers,
      method: 'POST',
      body: data
    })
      .then(res => res.json())
      .then(res => {
        console.log(res);

        setAnswer(res.answer);
      })
  }

  const handleTextQuestionInput = (question) => {
    setTextQuestion(question);
  }

  async function startRecording() {

    if (recordingURI.length > 0) {
      FileSystem.deleteAsync(recordingURI, {
        'idempotent': true
      });
    }

    try {
      console.log('Requesting permissions..');
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log('Starting recording..');
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);

      setRecording(recording);

      runRecordingAnimations();

      console.log('Recording started');

    } catch (err) {
      console.error('Failed to start recording', err);
    }
  }

  async function stopRecording() {
    console.log('Stopping recording..');
    
    const {durationMillis} = await recording.stopAndUnloadAsync();

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
    });

    const duration = recording.durationMillis;

    const uri = recording.getURI();

    setRecording(undefined);
    setRecordingURI(uri);
    setRecordingDuration(durationMillis);
  }

  const msToTime = (t) => {
    var ms = t % 1000;
    t = (t - ms) / 1000;
    var secs = t % 60;
    t = (t - secs) / 60;
    var mins = t % 60;

    return (mins < 10 ? '0' + mins : mins) + ':' + (secs < 10 ? '0' + secs : secs);
  }

  const handleOptionsLayout = (event) => {
    if(optionsHeight == 'auto') {
      const { height } = event.nativeEvent.layout;
      console.log(event.nativeEvent.layout);
      setOptionsHeight(height);
      setOptionsSlide(new Animated.Value(-height))
    }
  }

  const handleResponderGrant = (event) => {
    touchStart = event.nativeEvent.pageY;
    console.log(Dimensions.get('window').height, touchStart, touchEnd)
  }

  const handleResponderRelease = (event) => {
    touchEnd = event.nativeEvent.pageY;
    
    if(touchEnd < touchStart && touchEnd < touchStart - 30) {
      slideUp();
      console.log('slide up')
    } else if(touchEnd > touchStart && touchEnd - 30 > touchStart) {
      slideDown();
      console.log('slide down')
    }
  }

  const slideDown = () => {
    Animated.timing(optionsSlide, {
      toValue: -optionsHeight,
      duration: 100,
      useNativeDriver: false,
    }).start();
  }

  const slideUp = () => {
    Animated.timing(optionsSlide, {
      toValue: 0,
      duration: 100,
      useNativeDriver: false,
    }).start();
  }

  return (
    <View style={styles.container} onStartShouldSetResponder={() => true} onResponderGrant={handleResponderGrant} onResponderRelease={handleResponderRelease}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          id="text_question"
          name="text_question"
          placeholder={!recording ? "Zapytaj mnie o coś" : ''}
          placeholderTextColor={'hsla(0, 0%, 100%, .5)'}
          onChangeText={handleTextQuestionInput} />

        <Text style={styles.recordingTime}>
          { !recording && recordingURI && msToTime(recordingDuration) }
        </Text>

        <View style={styles.audioIconContainer}>
          {!recording && <TouchableHighlight underlayColor="transparent" style={styles.recordButton} onPress={() => startRecording()}>
            <FontAwesome name="microphone" size={24} style={styles.audioButton} />
          </TouchableHighlight>}
          {recording && <TouchableHighlight underlayColor="transparent" style={styles.recordButton} onPress={() => stopRecording()}>
            <FontAwesome name="pause" size={24} style={styles.audioButton} />
          </TouchableHighlight>}
        </View>

        {recording && 
          <View style={styles.recordingDots}>
            <Animated.View style={[styles.recordingDot, {
              top: animatedDots.dot1,
              left: 0,
            }]}/>
            <Animated.View style={[styles.recordingDot, {
              top: animatedDots.dot2,
              left: 10,
            }]}/>
            <Animated.View style={[styles.recordingDot, {
              top: animatedDots.dot3,
              left: 20
            }]}/>
          </View>
        }
        
      </View>

      {answer.length > 0 &&
        <View style={styles.answerContainer}>
          <View style={styles.gptLogoContainer}>
            <Image source={require('./assets/ChatGPT-logo.png')} style={styles.gptLogo} />
          </View>
          <Text style={styles.answer}>{answer}</Text>
        </View>
      }

      <TouchableHighlight style={styles.sendContainer} onPress={handleSendQuestion}>
        <Ionicons name="send" style={styles.sendIcon} size={22} />
      </TouchableHighlight>

      <Animated.View onLayout={handleOptionsLayout} style={[styles.optionsContainer, {
        height: optionsHeight,
        bottom: optionsSlide,
      }]}>
        <View style={styles.optionsTopHandler}>

        </View>
        <View style={styles.switchOption}>
          <View>
            <Text style={styles.optionMainText}>Tryb asystenta</Text>
            <Text style={styles.optionSubText}>(ON - konwersacyjny | OFF - informacyjny)</Text>
          </View>
          
          <Switch
            trackColor={{false: '#767577', true: '#81b0ff'}}
            thumbColor={assistantConversational ? '#f5dd4b' : '#f4f3f4'}
            ios_backgroundColor="#3e3e3e"
            onValueChange={(event) => setAssistantConversational(prevState => !prevState)}
            value={assistantConversational}
          />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    flex: 1,
    backgroundColor: 'rgb(52, 53, 65)',
    alignItems: 'center',
    paddingTop: StatusBar.currentHeight + 40,
    paddingHorizontal: 20,
  },

  inputContainer: {
    position: 'relative',
    backgroundColor: 'rgb(64, 65, 79)',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row',
  },

  textInput: {
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    color: '#FFF',
    flex: 1,
  },

  audioIconContainer: {
    width: 40,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },

  audioButton: {
    color: 'hsla(0, 0%, 100%, .5)',
  },

  sendContainer: {
    flex: 1,
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 50,
    height: 50,
    borderRadius: 50 / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgb(64, 65, 79)',
  },

  sendIcon: {
    transform: [{ rotate: '-40deg' }],
    color: '#DDD',
    marginLeft: 4,
    marginBottom: 2,
  },

  answerContainer: {
    padding: 12,
    marginTop: 16,
    backgroundColor: 'rgb(64, 65, 79)',
    borderRadius: 10,
    width: '100%',
  },

  answer: {
    marginTop: 16,
    color: 'rgb(209, 213, 219)',
  },

  gptLogoContainer: {
    alignItems: 'center',
  },

  gptLogo: {
    width: 52,
    height: 52,
  },

  margin: {
    marginTop: 12,
  },

  recordingDots: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    transform: [{translateY: -10}, {translateX: -10}]
  },

  recordingDot: {
    width: 4,
    height: 4,
    backgroundColor: 'hsla(0, 0%, 100%, .5)',
    borderRadius: 2,
    position: 'absolute',
    top: '50%',
  },

  recordingTime: {
    color: 'hsla(0, 0%, 100%, .5)',
  },

  optionsContainer: {
    backgroundColor: 'rgb(247,247,248)',
    position: 'absolute',
    width: Dimensions.get('window').width,
    bottom: 0,
    left: 0,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },

  optionsTopHandler: {
    position: 'absolute',
    left: '50%',
    top: -10,
    height: 6,
    width: 76,
    backgroundColor: 'rgb(247,247,248)',
    transform: [{translateX: -38}],
    borderRadius: 3,
  },

  switchOption: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },

  optionMainText: {
    fontSize: 14,
    fontWeight: 600,
  },

  optionSubText: {
    fontSize: 12,
    fontWeight: 400
  }
});
