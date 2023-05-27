import { StyleSheet, StatusBar, Dimensions } from 'react-native';

export default StyleSheet.create({
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
    alignItems: 'flex-start',
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
    width: 60,
    paddingTop: 12,
    marginRight: 10,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
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
    transform: [{ translateY: -10 }, { translateX: -10 }]
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
    paddingTop: 14,
    marginRight: 4,
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
    transform: [{ translateX: -38 }],
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
  },

  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '112%',
    height: '110%',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1,
  },

  authorizationModal: {
    width: 300,
    backgroundColor: '#FFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 20
  },

  authorizationTitle: {
    textAlign: 'center',
    fontWeight: 600,
    fontSize: 16
  },

  formInput: {
    marginTop: 12,
  },

  textInputLight: {
    marginTop: 6,
    height: 40,
    padding: 8,
    backgroundColor: '#F1F1F1',
    borderRadius: 8,
  },

  authorizationButton: {
    marginTop: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    fontSize: 14,
    backgroundColor: '#fae69e',
    borderRadius: 8,
  },

  authorizationButtonText: {
    fontWeight: 600,
    textAlign: 'center',
  },

  modalExitButton: {
    position: 'absolute',
    width: 32,
    height: 32,
    top: 6,
    right: 6,
    alignItems: 'center',
    justifyContent: 'center'
  },

  inputError: {
    marginLeft: 6,
    color: '#DC3545',
    fontSize: 12
  },

  settingsInput: {
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    color: '#000',
    flex: 1,
    backgroundColor: 'lightgray',
    maxWidth: 200
  }
});