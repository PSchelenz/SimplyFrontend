import Styles from '../../styles/Styles';
import { View, Animated, Text } from 'react-native';

const MessagesList = (props) => {
  const spin = props.waitingAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  })

  return (
    <>
      {props.questionStatus == props.questionLifecycle.asked &&
        <View style={Styles.answerContainer}>
          <View style={Styles.gptLogoContainer}>
            <Animated.Image source={require('../../assets/ChatGPT-logo.png')} style={[Styles.gptLogo, {
              transform: [{ rotate: spin }]
            }]} />
          </View>
        </View>
      }

      {props.questionStatus == props.questionLifecycle.answered &&
        <View style={Styles.answerContainer}>
          <Text style={Styles.answer}>{props.answer}</Text>
        </View>
      }
    </>
  );
}

export default MessagesList;