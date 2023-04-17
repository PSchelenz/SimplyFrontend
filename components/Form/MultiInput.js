import { Text, View, TextInput, TouchableHighlight, Animated } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import Styles from '../../styles/Styles';
import { useState } from 'react';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';

const MultiInput = (props) => {
	const [animatedDots, setAnimatedDots] = useState({
		dot1: new Animated.Value(0),
		dot2: new Animated.Value(0),
		dot3: new Animated.Value(0)
	});
	const [recordingDuration, setRecordingDuration] = useState(0);

	const handleTextQuestionInput = (question) => {
		props.setTextQuestion(question);
	}

	async function startRecording() {

		if (props.recordingURI.length > 0) {
			FileSystem.deleteAsync(props.recordingURI, {
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

			props.setRecording(recording);

			runRecordingAnimations();

			console.log('Recording started');

		} catch (err) {
			console.error('Failed to start recording', err);
		}
	}

	async function stopRecording() {
		console.log('Stopping recording..');

		const { durationMillis } = await props.recording.stopAndUnloadAsync();

		await Audio.setAudioModeAsync({
			allowsRecordingIOS: false,
		});

		const uri = props.recording.getURI();

		props.setRecording(undefined);
		props.setRecordingURI(uri);
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

	const runRecordingAnimations = () => {
		updownAnimation(animatedDots.dot1);

		setTimeout(() => {
			updownAnimation(animatedDots.dot2);
		}, 100)

		setTimeout(() => {
			updownAnimation(animatedDots.dot3);
		}, 200)
	}

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
		]), { iterations: 1000 }).start();
	};

	return (
		<View style={Styles.inputContainer}>
			<TextInput
				style={Styles.textInput}
				id="text_question"
				name="text_question"
				value={props.textQuestion}
				placeholder={!props.recording ? "Zapytaj mnie o coś" : ''}
				placeholderTextColor={'hsla(0, 0%, 100%, .5)'}
				onChangeText={handleTextQuestionInput} />

			<Text style={Styles.recordingTime}>
				{!props.recording && props.recordingURI && msToTime(recordingDuration)}
			</Text>

			<View style={Styles.audioIconContainer}>
				{!props.recording && <TouchableHighlight underlayColor="transparent" style={Styles.recordButton} onPress={() => startRecording()}>
					<FontAwesome name="microphone" size={24} style={Styles.audioButton} />
				</TouchableHighlight>}
				{props.recording && <TouchableHighlight underlayColor="transparent" style={Styles.recordButton} onPress={() => stopRecording()}>
					<FontAwesome name="pause" size={24} style={Styles.audioButton} />
				</TouchableHighlight>}
			</View>

			{props.recording &&
				<View style={Styles.recordingDots}>
					<Animated.View style={[Styles.recordingDot, {
						top: animatedDots.dot1,
						left: 0,
					}]} />
					<Animated.View style={[Styles.recordingDot, {
						top: animatedDots.dot2,
						left: 10,
					}]} />
					<Animated.View style={[Styles.recordingDot, {
						top: animatedDots.dot3,
						left: 20
					}]} />
				</View>
			}

		</View>
	);
}

export default MultiInput;