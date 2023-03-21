import { StyleSheet, Text, View, TextInput, Button, StatusBar, TouchableHighlight, Image } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Audio } from 'expo-av';

export default function App() {
  const [textQuestion, setTextQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [recording, setRecording] = useState(null);
  const [recordingURI, setRecordingURI] = useState('');

  const handleSendQuestion = () => {
    data = undefined;
    headers = {};

    console.log('TextQuestion', textQuestion);
    console.log('Recording', recordingURI);

    if(textQuestion.length > 0) {
      data = JSON.stringify({
        question: textQuestion,
      });

      headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      };

    } else if(recordingURI != null) {
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
    try {
      console.log('Requesting permissions..');
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log('Starting recording..');
      const { recording } = await Audio.Recording.createAsync( Audio.RecordingOptionsPresets.HIGH_QUALITY);
      setRecording(recording);
      console.log('Recording started');
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  }

  async function stopRecording() {
    console.log('Stopping recording..');
    setRecording(undefined);
    await recording.stopAndUnloadAsync();
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
    });
    const uri = recording.getURI();
    
    setRecordingURI(uri);
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.textInput} 
        id="text_question" 
        name="text_question" 
        placeholder="Zapytaj mnie o coś" 
        placeholderTextColor={'hsla(0, 0%, 100%, .5)'} 
        onChangeText={handleTextQuestionInput}/>

      <Button title="Record" style={styles.margin} onPress={() => startRecording()}/>
      <Button title="Stop" style={styles.margin} onPress={() => stopRecording()}/>

      {answer.length > 0 && 
        <View style={styles.answerContainer}>
          <View style={styles.gptLogoContainer}>
            <Image source={require('./assets/ChatGPT-logo.png')} style={styles.gptLogo}/>
          </View>
          <Text style={styles.answer}>{answer}</Text>
        </View>
      }

      <TouchableHighlight style={styles.sendContainer} onPress={handleSendQuestion}>
        <Ionicons name="send" style={styles.sendIcon} size={22}/>
      </TouchableHighlight>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgb(52, 53, 65)',
    alignItems: 'center',
    paddingTop: StatusBar.currentHeight + 40,
    paddingHorizontal: 20,
  },

  textInput: {
    backgroundColor: 'rgb(64, 65, 79)',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    color: '#FFF',
    width: '100%',
  },

  sendContainer: {
    flex: 1,
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 50,
    height: 50,
    borderRadius: 50/2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgb(64, 65, 79)',
  },

  sendIcon: {
    transform: [{rotate: '-40deg'}],
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
  }
});
