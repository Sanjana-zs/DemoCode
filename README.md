# BitFrost
video React SDK that helps you build multi-party video experiences

## Features

### Integrating the SDK
```
   yarn add bitfrost
        OR
   npm install bitfrost
```

There are three entities which we need to be familiar of -

**useStore** - contains the complete state of the room for example, participant details, messages and track states
**useActions** - used to perform any action such as connecting to the room, muting/unmuting the audios/videos and sending messages.
**useNotifications** - this can be used to get notified on peer join/leave and new messages in order to show toast notifications to the user.

### Connecting to the Room
```
import { useActions } from 'bitfrost';

function Connect() {
  const actions = useActions();

  async function onJoinClick() {
    await actions.connect(room_name, user_name);
  }

  return <
        // form with input and join button
  />;
}
```
That's it. You have joined a room successfully 🥳.

#### Getting the Current Room State
```
import { useStore, selectIsConnectedToRoom } from 'bitfrost';

function RoomState() {
    const isConnectedToRoom = useStore(selectIsConnectedToRoom); // returns a boolean value
    return (
        // code
    );
}
```