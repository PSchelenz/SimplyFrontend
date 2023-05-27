import { Text, View, TextInput, Animated, Switch, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Styles from '../../styles/Styles';
import { useState } from 'react';

const Settings = (props) => {
  const [showAuthorizationModal, setShowAuthorizationModal] = useState(false);
  const [authorizationSecret, setAuthorizationSecret] = useState('');
  const [authorizationError, setAuthorizationError] = useState('');
  const [canFillServerIpInput, setCanFillServerIpInput] = useState(false);

  const handleOptionsLayout = (event) => {
    if (props.optionsHeight == 'auto') {
      const { height } = event.nativeEvent.layout;

      props.setOptionsHeight(height);
      props.setOptionsSlide(new Animated.Value(-height))
    }
  }

  const handleRememberContextSwitch = async (isChecked) => {
    if (isChecked) {
      const userApiToken = await AsyncStorage.getItem('apiToken');

      if (!userApiToken) {
        setShowAuthorizationModal(true);
      } else {
        props.setShouldRememberContext(true);
      }
    } else {
      props.setShouldRememberContext(false);
    }
  }

  const handleAuthorizationSubmit = () => {
    if (authorizationSecret) {
      fetch(`http://${props.serverIp}/api/authorization`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({ secret: authorizationSecret })
      })
        .then(res => res.json())
        .then(async res => {
          if (res.status == 'success') {
            await AsyncStorage.setItem('apiToken', res.token)
            setShowAuthorizationModal(false);
            props.setShouldRememberContext(true);
            setAuthorizationError('');
          } else if (res.status == 'error') {
            setAuthorizationError('Niepoprawny klucz dostępu.')
          }
        })
    }
  }

  const handleAuthorizationSecretChange = (secret) => {
    setAuthorizationSecret(secret);
  }

  const handleAuthorizationModalClose = () => {
    setShowAuthorizationModal(false);
    props.setShouldRememberContext(false);
  }

  const handleAllowServerIpFill = () => {
    setCanFillServerIpInput(prevState => !prevState);
  }

  const handleServerIpChange = (value) => {
    props.setServerIp(value);
  }

  return (
    <>
      <Animated.View onLayout={handleOptionsLayout} style={[Styles.optionsContainer, {
        height: props.optionsHeight,
        bottom: props.optionsSlide,
      }]}>
        <View style={Styles.optionsTopHandler} />
        <View style={Styles.switchOption}>
          <View>
            <Text style={Styles.optionMainText}>Tryb asystenta</Text>
            <Text style={Styles.optionSubText}>(OFF - informacyjny | ON - konwersacyjny)</Text>
          </View>

          <Switch
            trackColor={{ false: '#767577', true: '#202123' }}
            thumbColor={props.assistantConversational ? '#fae69e' : '#f4f3f4'}
            ios_backgroundColor="#3e3e3e"
            onValueChange={(event) => props.setAssistantConversational(prevState => !prevState)}
            value={props.assistantConversational}
          />
        </View>
        <View style={Styles.switchOption}>
          <View>
            <Text style={Styles.optionMainText}>Pamiętanie kontekstu rozmowy</Text>
          </View>

          <Switch
            trackColor={{ false: '#767577', true: '#202123' }}
            thumbColor={props.shouldRememberContext ? '#fae69e' : '#f4f3f4'}
            ios_backgroundColor="#3e3e3e"
            onValueChange={handleRememberContextSwitch}
            value={props.shouldRememberContext}
          />
        </View>
        <View style={Styles.switchOption}>
          {canFillServerIpInput ? 
            <TextInput
              style={Styles.settingsInput}
              id="server_ip"
              name="server_ip"
              value={props.serverIp}
              placeholder={'IP serwera'}
              placeholderTextColor={'hsla(0, 0%, 100%, .5)'}
              onChangeText={handleServerIpChange} 
              editable={canFillServerIpInput} /> 
            : 
            <View>
              <Text style={Styles.optionMainText}>IP serwera</Text>
              <Text style={Styles.optionSubText}>{props.serverIp ?? "Nieznane"}</Text>
            </View>
          }
          
          
          <Switch
            trackColor={{ false: '#767577', true: '#202123' }}
            thumbColor={canFillServerIpInput ? '#fae69e' : '#f4f3f4'}
            ios_backgroundColor="#3e3e3e"
            onValueChange={handleAllowServerIpFill}
            value={canFillServerIpInput}
          />
        </View>
      </Animated.View>

      {showAuthorizationModal &&
        <View style={Styles.backdrop}>
          <View style={Styles.authorizationModal}>
            <TouchableOpacity style={Styles.modalExitButton} onPress={handleAuthorizationModalClose}>
              <FontAwesome name="close" size={16} color="lightgray" />
            </TouchableOpacity>

            <Text style={Styles.authorizationTitle}>Autoryzacja</Text>

            <View style={Styles.formInput}>
              <TextInput
                style={Styles.textInputLight}
                placeholder={'Klucz dostępu'}
                value={authorizationSecret}
                onChangeText={handleAuthorizationSecretChange} />

              {authorizationError.length > 0 && <Text style={Styles.inputError}>{authorizationError}</Text>}

            </View>

            <TouchableOpacity style={Styles.authorizationButton} onPress={handleAuthorizationSubmit}>
              <Text style={Styles.authorizationButtonText}>Zapisz</Text>
            </TouchableOpacity>
          </View>
        </View>
      }
    </>
  );
}

export default Settings;