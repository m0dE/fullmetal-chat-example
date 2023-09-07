import { useState, useEffect, useRef } from 'react';
import { BiSend, BiLogoGithub } from 'react-icons/bi';
import io from 'socket.io-client';
import { FullmetalAPIURL, ChatBackendScoketUrl } from './config';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const [socket, setSocket] = useState();
  const [prompt, setPrompt] = useState('');
  const [message, setMessage] = useState('');
  const [isResponseLoading, setIsResponseLoading] = useState(false);
  const [previousChats, setPreviousChats] = useState([]);
  const [models, setModels] = useState();
  const [selectedModel, setSelectedModel] = useState();
  const [queuedNumberMessage, setQueuedNumberMessage] = useState();
  const scrollToLastItem = useRef(null);
  const textboxRef = useRef(null);

  // io connection
  const initIOConnection = () => {
    if (!socket) {
      const newSocket = io(ChatBackendScoketUrl, {
        path: '/socket.io/',
        forceNew: true,
        reconnectionAttempts: 3,
        timeout: 2000,
      });

      newSocket.on('connect', () => {
        console.log('Connected to WebSocket server', newSocket.id);
        if (newSocket) {
          // @ts-ignore
          newSocket.on('response', (response) => {
            // @ts-ignore
            scrollToLastItem.current?.lastElementChild?.scrollIntoView({
              behavior: 'smooth',
            });
            setQueuedNumberMessage('');
            //if (response && response.length) {
            if (response.completed) {
              setMessage('');
              setIsResponseLoading(false);
              setPrompt('');
              textboxRef.current.focus();
            } else {
              setMessage((prev) => prev + response.token);
            }
            //}
          });

          newSocket.on('error', (message) => {
            toast.error(message);
            setMessage('');
            setIsResponseLoading(false);
            setPrompt('');
            setQueuedNumberMessage('');
            textboxRef.current.focus();
          });

          newSocket.on('responseQueuedNumber', (queuedNumber) => {
            setQueuedNumberMessage(
              `Prompt successfully queued. There are ${queuedNumber} prompts ahead of you.`
            );
            // toast.success(
            //   `Prompt successfully queued. There are ${queuedNumber} prompts ahead of you.`
            // );
          });
        }
      });

      // @ts-ignore
      setSocket(newSocket);
    }
  };

  // fetch models from api server
  const fetchModels = () => {
    // Fetch data from the API
    fetch(`${FullmetalAPIURL}/models`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((result) => {
        // Update the state with the fetched data
        if (result && result.models) {
          setModels(Object.keys(result.models));
        }
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  };
  useEffect(() => {
    textboxRef.current.focus();
    initIOConnection();
    fetchModels();
  }, []);

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!selectedModel) {
      toast.error('Please select model');
      return;
    }
    if (!prompt) {
      toast.error('Please enter prompt');
      return;
    }

    try {
      if (socket) {
        socket.emit('prompt', { prompt, model: selectedModel });
        setIsResponseLoading(true);
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
      console.error(e);
    }
  };

  useEffect(() => {
    if (prompt && message) {
      console.log(prompt, message);
      const newOutput = previousChats;
      // @ts-ignore
      newOutput[previousChats.length - 1].content = message;
      // @ts-ignore
      setPreviousChats(newOutput);
    }
  }, [message]);

  const handleTextAreaKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // Prevent adding a new line
      submitHandler(e); // Submit the form
    }
  };

  useEffect(() => {
    if (models) {
      setSelectedModel(models[0]);
    }
  }, [models]);

  // const currentChat = previousChats.filter(
  //   (prevChat) => prevChat.title === currentTitle
  // )
  return (
    <>
      <div className='container'>
        <ToastContainer
          position='top-right'
          autoClose={2000}
          hideProgressBar={false}
          newestOnTop={true}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme='dark'
        />
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

        <section className='main'>
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
            chat demo ({' '}
            <a
              href='https://github.com/m0dE/fullmetal-chat-example'
              target='_blank'
              rel='noreferrer'
              style={{ color: 'lightblue' }}
            >
              view source <BiLogoGithub size={20} />
              {/* <FontAwesomeIcon className='mr-2' icon={faGithub} /> */}
            </a>{' '}
            )
          </h2>
          <hr style={{ width: '40vw', margin: '10px auto' }} />
          {models && (
            <div style={{ display: 'flex' }}>
              <span style={{ margin: '20px 10px' }}>Model: </span>
              <select
                onChange={(e) => setSelectedModel(e.target.value)}
                value={selectedModel}
                style={{ width: 'auto', margin: '10px 0', padding: '5px 10px' }}
              >
                {models.map((key) => (
                  <option key={key} value={key}>
                    {key}
                  </option>
                ))}
                {/* <option
                  key='Wizard-Vicuna-13B-Uncensored'
                  value='Wizard-Vicuna-13B-Uncensored'
                >
                  TEST-Wizard-Vicuna-13B-Uncensored
                </option> */}
              </select>
            </div>
          )}

          <div className='main-header'>
            {previousChats.length ? (
              <ul>
                {previousChats?.map((chatMsg, idx) => (
                  <li key={idx} ref={scrollToLastItem}>
                    <img
                      src={
                        chatMsg.role === 'user'
                          ? '/face_logo.svg'
                          : '/ChatGPT_logo.svg'
                      }
                      alt={
                        chatMsg.role === 'user' ? 'Face icon' : 'ChatGPT icon'
                      }
                      style={{
                        backgroundColor: chatMsg.role === 'user' && '#ECECF1',
                      }}
                    />
                    <div
                      style={{ wordWrap: 'break-word', whiteSpace: 'pre-wrap' }}
                    >
                      {chatMsg.content}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div style={{ width: '35vw', margin: '10vh auto' }}>
                <p>
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
              </div>
            )}
          </div>
          <div className='main-bottom'>
            <div>
              <div className='form-container'>
                <textarea
                  ref={textboxRef}
                  type='text'
                  placeholder='Send a message.'
                  spellCheck='false'
                  onChange={(e) => setPrompt(e.target.value)}
                  readOnly={isResponseLoading}
                  onKeyDown={handleTextAreaKeyPress}
                  value={
                    isResponseLoading
                      ? `Loading... ${queuedNumberMessage}`
                      : prompt.charAt(0).toUpperCase() + prompt.slice(1)
                  }
                ></textarea>
                {!isResponseLoading && (
                  <button type='button' onClick={submitHandler}>
                    <BiSend size={20} />
                  </button>
                )}
              </div>
            </div>
            <small className='footer-text'>
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
  );
}

export default App;
