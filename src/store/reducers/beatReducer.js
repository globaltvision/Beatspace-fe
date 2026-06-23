import { BEAT_CONSTANTS } from '../constants/beatConstants';

const initialState = {
  beats: [],
  currentBeat: null,
  isLoading: false,
  isCreating: false,
  error: null,
  beatsLoaded: false,
};

const beatReducer = (state = initialState, action) => {
  switch (action.type) {
    case BEAT_CONSTANTS.GET_BEATS_REQUEST:
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case BEAT_CONSTANTS.GET_BEATS_SUCCESS:
      return {
        ...state,
        isLoading: false,
        beats: action.payload,
        beatsLoaded: true,
      };
    case BEAT_CONSTANTS.GET_BEATS_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };

    case BEAT_CONSTANTS.GET_BEAT_BY_ID_REQUEST:
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case BEAT_CONSTANTS.GET_BEAT_BY_ID_SUCCESS:
      return {
        ...state,
        isLoading: false,
        currentBeat: action.payload,
      };
    case BEAT_CONSTANTS.GET_BEAT_BY_ID_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };

    case BEAT_CONSTANTS.CREATE_BEAT_REQUEST:
      return {
        ...state,
        isCreating: true,
        error: null,
      };
    case BEAT_CONSTANTS.CREATE_BEAT_SUCCESS:
      return {
        ...state,
        isCreating: false,
        beats: [...state.beats, action.payload],
      };
    case BEAT_CONSTANTS.CREATE_BEAT_FAILURE:
      return {
        ...state,
        isCreating: false,
        error: action.payload,
      };

    case BEAT_CONSTANTS.DELETE_BEAT_REQUEST:
      return {
        ...state,
        isLoading: true,
      };
    case BEAT_CONSTANTS.DELETE_BEAT_SUCCESS:
      return {
        ...state,
        isLoading: false,
        beats: state.beats.filter(beat => (beat._id || beat.id) !== action.payload),
      };
    case BEAT_CONSTANTS.DELETE_BEAT_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };

    case BEAT_CONSTANTS.UPDATE_BEAT_REQUEST:
      return {
        ...state,
        isLoading: true,
      };
    case BEAT_CONSTANTS.UPDATE_BEAT_SUCCESS:
      return {
        ...state,
        isLoading: false,
        beats: state.beats.map(beat => 
          (beat._id || beat.id) === (action.payload._id || action.payload.id) ? action.payload : beat
        ),
      };
    case BEAT_CONSTANTS.UPDATE_BEAT_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };

    default:
      return state;
  }
};

export default beatReducer;
