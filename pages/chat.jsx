import { useFirebase } from "../context/firebaseContext";


export default function Chat() {
  const { chatWithOwner, getChatsOfUser } = useFirebase();
  const submitHander = (e) => {
    e.preventDefault();
    const message = e.target.message.value;
    chatWithOwner(message);
    e.target.message.value = "";
  }
  return (
    <div className="container">
    <div className="messageSection">
      {
        getChatsOfUser.map((chat, index) => {
          return (
            <div className="message" key={index}>
              <div className="message__header">
                <h3>{chat.name}</h3>
                <p>{chat.time}</p>
              </div>
              <div className="message__body">
                <p>{chat.message}</p>
              </div>
            </div>
          )
        }
        )
      }
    </div>
    <div className="input">
      <input type="text" name="message" id="message" />
      <input type="submit" value="" onClick={(event) => {
        submitHander(event);
      }}/>
    </div>
  </div>
  )
}