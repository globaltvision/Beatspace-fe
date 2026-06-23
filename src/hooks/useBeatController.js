import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getBeats, createBeat, deleteBeat, updateBeat } from '../store/actions/beatActions';

export const useBeatController = () => {
  const dispatch = useDispatch();
  const { beats, isLoading, isCreating, error, beatsLoaded } = useSelector((state) => state.beat);

  const fetchBeats = useCallback((category) => {
    return dispatch(getBeats(category));
  }, [dispatch]);

  const addBeat = useCallback((formData) => {
    return dispatch(createBeat(formData));
  }, [dispatch]);

  const removeBeat = useCallback((id) => {
    return dispatch(deleteBeat(id));
  }, [dispatch]);

  const editBeat = useCallback((id, formData) => {
    return dispatch(updateBeat(id, formData));
  }, [dispatch]);

  return {
    beats,
    isLoading,
    isCreating,
    error,
    beatsLoaded,
    fetchBeats,
    addBeat,
    removeBeat,
    editBeat,
  };
};
