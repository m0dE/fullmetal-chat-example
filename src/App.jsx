import { useState, useEffect, useRef } from 'react'
import { BiPlus, BiComment, BiUser, BiFace, BiSend } from 'react-icons/bi'
import io from 'socket.io-client';

function App() {
  
  const [socket, setSocket] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [message, setMessage] = useState('');
  const [isResponseLoading, setIsResponseLoading] = useState(false);
  const [previousChats, setPreviousChats] = useState([]);
  const scrollToLastItem = useRef(null);
  
  useEffect(() => {
    const newSocket = io('https://chat.fullmetal.ai/', {
      path: '/socket.io/',
      forceNew: true,
      reconnectionAttempts: 3,
      timeout: 2000, 
    });

    newSocket.on('connect', () => {
      console.log('Connected to WebSocket server', newSocket.id);
      if (newSocket) {
        // @ts-ignore
        newSocket.on('response', (result) => {
          console.log(result);
          const response = result.response;
          // @ts-ignore
          scrollToLastItem.current?.lastElementChild?.scrollIntoView({
            behavior: 'smooth',
          })
          //if (response && response.length) {
          if (result.completed) {
            setMessage('');
            setIsResponseLoading(false)
            setPrompt('')
          } else {
            setMessage((prev) => prev + response);
          }
          //}
        });
      }
    });

    // @ts-ignore
    setSocket(newSocket);
    return () => {
      // socket.disconnect();
    };
  }, []);


  const submitHandler = async (e) => {
    e.preventDefault()
    if (!prompt) return    

    try {
      
      if(socket){
        socket.emit('prompt', prompt);        
        setIsResponseLoading(true)
        setPreviousChats((prevChats) => [
          ...prevChats,
          {
            role: 'user',
            content: prompt,
          },
          {
            role: 'assistant',
            content: '',
          },
        ]);
      }
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {    
    if (prompt && message) {
      console.log(prompt, message);
      const newOutput = previousChats;
      // @ts-ignore
      newOutput[previousChats.length - 1].content = message;
      // @ts-ignore
      setPreviousChats(newOutput);
    }
  }, [message])

  // const currentChat = previousChats.filter(
  //   (prevChat) => prevChat.title === currentTitle
  // )
  return (
    <>
      <div className="container">
        {/* <section className="sidebar">
          <div className="sidebar-header" onClick={createNewChat} role="button">
            <BiPlus size={20} />
            <button>New Chat</button>
          </div>
          <div className="sidebar-history">
            {uniqueTitles.length > 0 && <p>Today</p>}
            <ul>
              {uniqueTitles?.map((uniqueTitle, idx) => (
                <li key={idx} onClick={() => backToHistoryPrompt(uniqueTitle)}>
                  <BiComment />
                  {uniqueTitle.slice(0, 18)}
                </li>
              ))}
            </ul>
          </div>
          <div className="sidebar-info">
            <div className="sidebar-info-upgrade">
              <BiUser />
              <p>Upgrade to Plus</p>
            </div>
            <div className="sidebar-info-user">
              <BiFace />
              <p>vgerun97@gmail.com</p>
            </div>
          </div>
        </section> */}

        <section className="main">
        <h2 className='text-xl w-full mb-5'>
              This is{' '}
              <a
                href='http://fullmetal.ai/'
                target='_blank'
                rel='noreferrer'
                style={{ color: 'lightblue' }}
              >
                Fullmetal.Ai
              </a>{' '}
              chat demo using{' '}
              <a
                href='https://huggingface.co/localmodels/Wizard-Vicuna-7B-Uncensored-ggml/tree/main'
                target='_blank'
                rel='noreferrer'
                style={{ color: 'lightblue' }}
              >
                {' '}
                Wizard-Vicuna-7B-Uncensored-ggml
              </a>
            </h2>
          <div className="main-header">
          {previousChats.length ? (<ul>
              {previousChats?.map((chatMsg, idx) => (
                <li key={idx} ref={scrollToLastItem}>
                  <img
                    src={
                      chatMsg.role === 'user'
                        ? '../public/face_logo.svg'
                        : '../public/ChatGPT_logo.svg'
                    }
                    alt={chatMsg.role === 'user' ? 'Face icon' : 'ChatGPT icon'}
                    style={{
                      backgroundColor: chatMsg.role === 'user' && '#ECECF1',
                    }}
                  />
                  <p>{chatMsg.content}</p>
                </li>
              ))}
            </ul>) : <div style={{ width: '35vw', margin: '10vh auto' }}>
                <p>
                  This Chat Demo is powered by Fullmetal.{' '}
                  <a
                    href='https://github.com/m0dE/fullmetal-chat-example'
                    target='_blank'
                    rel='noreferrer'
                    style={{ color: 'lightblue' }}
                  >
                    View Source{' '}
                    {/* <FontAwesomeIcon className='mr-2' icon={faGithub} /> */}
                  </a>
                  <br />
                  <br />
                  <br />
                  <a
                    href='http://fullmetal.ai/'
                    target='_blank'
                    rel='noreferrer'
                    style={{ color: 'lightblue' }}
                  >
                    Fullmetal.Ai
                  </a>{' '}
                  is a distributed network of publicly-powered, self-hosted
                  Large Language Models (LLMs). Our mission is to provide
                  enhanced usability of open-source LLMs in terms of quality,
                  performance, and accessibility.
                </p>
              </div>}
          </div>
          <div className="main-bottom">
            
            <form className="form-container" onSubmit={submitHandler}>
              <input
                type="text"
                placeholder="Send a message."
                spellCheck="false"
                value={
                  isResponseLoading
                    ? 'Loading...'
                    : prompt.charAt(0).toUpperCase() + prompt.slice(1)
                }
                onChange={(e) => setPrompt(e.target.value)}
                readOnly={isResponseLoading}
              />
              {!isResponseLoading && (
                <button type="submit">
                  <BiSend size={20} />
                </button>
              )}
            </form>
            <small className='px-3 pb-3 pt-2 text-center text-xs text-gray-600 dark:text-gray-300 md:px-4 md:pb-6 md:pt-3'>
                <span>
                  Free Research Preview.{' '}
                  <a
                    href='http://fullmetal.ai/'
                    target='_blank'
                    rel='noreferrer'
                    style={{ color: 'lightblue' }}
                  >
                    Fullmetal
                  </a>{' '}
                  may produce inaccurate information about people, places, or
                  facts.{' '}
                  <a
                    href='http://fullmetal.ai/'
                    target='_blank'
                    rel='noreferrer'
                    style={{ color: 'lightblue' }}
                  >
                    Fullmetal
                  </a>{' '}
                  2023 Version
                </span>
              </small>
          </div>
        </section>
      </div>
    </>
  )
}

export default App
