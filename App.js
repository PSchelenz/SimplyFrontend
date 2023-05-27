import { View, TouchableHighlight, Animated } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Styles from './styles/Styles';
import MultiInput from './components/Form/MultiInput';
import Settings from './components/Settings/Settings';
import MessagesList from './components/Messages/MessagesList';
import { StatusBar } from 'react-native';

questionLifecycle = {
  starting: 'starting',
  asked: 'asked',
  answered: 'answered'
}

export default function App() {
  const [textQuestion, setTextQuestion] = useState('');
  const [assistantConversational, setAssistantConversational] = useState(false);
  const [shouldRememberContext, setShouldRememberContext] = useState(false);
  const [recording, setRecording] = useState(null);
  const [recordingURI, setRecordingURI] = useState('');
  const [answer, setAnswer] = useState('');
  const [optionsHeight, setOptionsHeight] = useState('auto');
  const [optionsSlide, setOptionsSlide] = useState(new Animated.Value(0));
  const [waitingAnimation, setWaitingAnimation] = useState(new Animated.Value(0));
  const [questionStatus, setQuestionStatus] = useState(questionLifecycle.starting)
  const [serverIp, setServerIp] = useState(null);

  let touchStart, touchEnd;

  useEffect(() => {
    async function setCurrentServerIp() {
      const currentServerIp = await AsyncStorage.getItem('serverIp') ?? null;
      setServerIp(currentServerIp);
    }
    
    setCurrentServerIp();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem('serverIp', serverIp);
  }, [serverIp])

  const waitingRotateAnimation = () => {
    Animated.loop(Animated.sequence([
      Animated.timing(waitingAnimation, {
        toValue: 0.1667,
        duration: 1000,
        useNativeDriver: false,
      }),
      Animated.timing(waitingAnimation, {
        toValue: 0.333,
        duration: 1000,
        useNativeDriver: false,
      }),
      Animated.timing(waitingAnimation, {
        toValue: 0.5,
        duration: 1000,
        useNativeDriver: false,
      }),
      Animated.timing(waitingAnimation, {
        toValue: 0.667,
        duration: 1000,
        useNativeDriver: false,
      }),
      Animated.timing(waitingAnimation, {
        toValue: 0.83333,
        duration: 1000,
        useNativeDriver: false,
      }),
      Animated.timing(waitingAnimation, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: false,
      })
    ]), { iterations: 1000 }).start();
  }

  const handleSendQuestion = async () => {
    if(!serverIp) {
      return;
    }

    data = undefined;
    headers = {};

    console.log('TextQuestion', textQuestion);
    console.log('Recording', recordingURI);

    if (textQuestion.length > 0) {
      data = JSON.stringify({
        question: textQuestion,
        assistant_mode: assistantConversational ? 'conversational' : 'informative',
        should_remember_context: shouldRememberContext ? true : false,
        api_token: shouldRememberContext ? await AsyncStorage.getItem('apiToken') : null,
      });

      headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      };

    } else if (recordingURI != null) {
      console.log("Sends recording");
      const filetype = recordingURI.split(".").pop();
      const filename = recordingURI.split("/").pop();
      data = new FormData();

      data.append("question", {
        uri: recordingURI,
        type: `audio/${filetype}`,
        name: filename,
      });

      data.append('assistant_mode', assistantConversational ? 'conversational' : 'informative');

      data.append('should_remember_context', shouldRememberContext ? true : false);

      data.append('api_token', shouldRememberContext ? await AsyncStorage.getItem('apiToken') : null);

      headers = {
        'Accept': 'application/json',
      };
    } else {
      return;
    }

    setQuestionStatus(questionLifecycle.asked);
    waitingRotateAnimation();

    fetch(`http://${serverIp}/api/assistant/question`, {
      headers: headers,
      method: 'POST',
      body: data
    })
      .then(res => res.json())
      .then(res => {
        console.log(res);

        setAnswer(res.answer);
        setTextQuestion('');
        setQuestionStatus(questionLifecycle.answered)
      })
  }


  const handleResponderGrant = (event) => {
    touchStart = event.nativeEvent.pageY;
  }

  const handleResponderRelease = (event) => {
    touchEnd = event.nativeEvent.pageY;

    if (touchEnd < touchStart && touchEnd < touchStart - 30) {
      slideUp();
    } else if (touchEnd > touchStart && touchEnd - 30 > touchStart) {
      slideDown();
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
    <View style={Styles.container} onStartShouldSetResponder={() => true} onResponderGrant={handleResponderGrant} onResponderRelease={handleResponderRelease}>
      <StatusBar backgroundColor={'transparent'} translucent />
      <MultiInput 
        setTextQuestion={setTextQuestion} 
        textQuestion={textQuestion} 
        recording={recording} 
        setRecording={setRecording} 
        setRecordingURI={setRecordingURI} 
        recordingURI={recordingURI} />

      <MessagesList questionStatus={questionStatus} questionLifecycle={questionLifecycle} waitingAnimation={waitingAnimation} answer={answer}/>

      <TouchableHighlight style={Styles.sendContainer} onPress={handleSendQuestion}>
        <Ionicons name="send" style={Styles.sendIcon} size={22} />
      </TouchableHighlight>

      <Settings
        setAssistantConversational={setAssistantConversational}
        assistantConversational={assistantConversational}
        setShouldRememberContext={setShouldRememberContext}
        shouldRememberContext={shouldRememberContext}
        setOptionsSlide={setOptionsSlide}
        optionsSlide={optionsSlide}
        setOptionsHeight={setOptionsHeight}
        optionsHeight={optionsHeight}
        setServerIp={setServerIp}
        serverIp={serverIp}/>
    </View>
  );
}
