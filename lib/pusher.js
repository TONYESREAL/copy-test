import Pusher from 'pusher-js';

const pusher = new Pusher('', {
  cluster: 'eu',
});

export const subscribeToChannel = (channelName, eventName, callback) => {
  const channel = pusher.subscribe(channelName);
  channel.bind(eventName, callback);
};
