import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import {
  setActiveChannel,
  setActiveServer,
} from "../features/active/activeSlice";
import { store } from "../app/store";
import { useNewChannelMutation } from "../services/endpoints/channels";

/**
 * Custom hook that provides a function to handle navigation to a channel.
 * If the channel with the specified participant does not exist, it creates a new channel.
 *
 * @returns {Function} - A function that takes an object with participantName and participantId,
 * and navigates to the corresponding channel.
 *
 * @example
 * const handleNavigation = useChannelNavigate();
 * handleNavigation({ participantName: 'John Doe', participantId: '12345' });
 *
 * @function handleNavigation
 * @param {Object} params - The parameters for navigation.
 * @param {string} params.participantName - The name of the participant.
 * @param {string} params.participantId - The ID of the participant.
 */
const useChannelNavigate = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);
  const [newChannel] = useNewChannelMutation();

  const handleNavigation = ({
    participantName,
    participantId,
  }: {
    participantName: string;
    participantId: string;
  }) => {
    const state = store.getState();
    const channel = state.channels.channels.find(
      (channel) =>
        channel.participants.filter(
          (participant) => participant.name === participantName
        ).length > 0
    );
    if (!channel) {
      newChannel({
        profile_id: user.id,
        participant_id: participantId,
      })
        .unwrap()
        .then((data) => {
          console.log(`New channel created, id: ${data.id}`);
          dispatch(setActiveChannel(data.id));
          dispatch(setActiveServer("0"));
          navigate(`/channel/${data.id}`);
        })
        .catch((error) => console.error(error));
      return;
    } else {
      dispatch(setActiveChannel(channel.id));
      dispatch(setActiveServer("0"));
      navigate(`/channel/${channel.id}`);
    }
  };

  return handleNavigation;
};

export default useChannelNavigate;
