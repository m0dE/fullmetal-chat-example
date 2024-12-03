import { useState, useEffect, useRef } from 'react';
import { BiSend, BiLogoGithub, BiLogIn } from 'react-icons/bi';
import io from 'socket.io-client';
import {
  FullmetalAPIURL,
  ChatBackendSocketUrl,
  FullmetalApiKey,
} from '../config';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Markdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRedoAlt, faThumbsDown } from '@fortawesome/free-solid-svg-icons';
import Header from '../components/header';
import fetchWithAuth from '../utils/api';

function Chat({ npc = false }) {
  const [prompt, setPrompt] = useState('');
  const [message, setMessage] = useState('');
  const [isResponseLoading, setIsResponseLoading] = useState(false);
  const [previousChats, setPreviousChats] = useState([]);
  const [summaryDetail, setSummaryDetail] = useState();
  const [models, setModels] = useState();
  const [npcs, setNpcs] = useState();
  const [selectedModel, setSelectedModel] = useState();
  const [selectedNpc, setSelectedNpc] = useState();
  const [queuedNumberMessage, setQueuedNumberMessage] = useState('');
  const [clickedButtons, setClickedButtons] = useState({});
  const [resRefId, setResRefId] = useState('');
  const scrollToLastItem = useRef(null);
  const textboxRef = useRef(null);
  const socketRef = useRef(null);
  const regenerateClicked = useRef(false);
  const loadingPlaceholder = 'Typing...';
  let socketId;

  useEffect(() => {
    console.log(selectedNpc);
  }, [selectedNpc]);

  const fetchNpcs = async () => {
    const response = await fetchWithAuth(`/api/npc/all?limit=8&mine=true`, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    if (response && response.data && response.status === 200) {
      setNpcs(response.data);
      setModels(response.data.map((m) => m.model));
    }
  };

  // fetch models from api server
  const fetchModels = () => {
    // Fetch data from the API
    fetch(`${FullmetalAPIURL}/models`, { headers: { apiKey: FullmetalApiKey } })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((result) => {
        // Update the state with the fetched data
        console.log(result);
        if (result && result.models) {
          setModels(result.models);
        }
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  };
  useEffect(() => {
    textboxRef.current.focus();
    if (npc) {
      // load npcs and model accordingly
      fetchNpcs();
    } else {
      fetchModels();
    }
  }, []);
  const submitHandler = async (e, regenerate = false) => {
    e.preventDefault();
    if (!selectedModel) {
      toast.error('Please select model');
      return;
    }

    if (!prompt && !regenerate) {
      toast.error('Please enter prompt');
      return;
    }

    try {
      SendPrompt(regenerate);
    } catch (e) {
      console.error(e);
    }
  };
  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io(ChatBackendSocketUrl, {
        path: '/socket.io/',
        forceNew: true,
        reconnectionAttempts: 3,
        timeout: 2000,
      });
      socketRef.current.on('connect', () => {
        console.log('Connected to WebSocket server', socketRef.current.id);
        socketId = socketRef.current.id;
        // @ts-ignore
        socketRef.current.on('response', (response) => {
          // @ts-ignore
          scrollToLastItem.current?.lastElementChild?.scrollIntoView({
            behavior: 'smooth',
          });

          if (regenerateClicked.current) {
            setMessage('');

            // Handle regeneration - update the content of the last assistant message
            setPreviousChats((prevChats) => {
              const clonedChats = [...prevChats];
              const lastAssistantChatIndex = clonedChats
                .map((chat) => chat.role)
                .lastIndexOf('assistant');
              if (lastAssistantChatIndex >= 0 && response.token) {
                clonedChats[lastAssistantChatIndex].content = clonedChats[
                  lastAssistantChatIndex
                ].content.replace(loadingPlaceholder, '');
                clonedChats[
                  lastAssistantChatIndex
                ].content += `${response.token}`;
              }
              return clonedChats;
            });
          }

          setQueuedNumberMessage('');
          //if (response && response.length) {
          if (response.completed) {
            regenerateClicked.current = false;

            setSummaryDetail(response);
            setMessage('');
            setIsResponseLoading(false);
            setPrompt('');
            textboxRef.current.focus();
          } else {
            setMessage((prev) => prev + response.token);
          }
        });
        socketRef.current.on('error', (message) => {
          toast.error(message);
          setMessage('');
          setIsResponseLoading(false);
          setPrompt('');
          setQueuedNumberMessage('');
          textboxRef.current.focus();
          // disconnect after response is over
          socketRef.current.disconnect();
        });

        socketRef.current.on('responseQueuedNumber', (queuedNumber) => {
          if (queuedNumber) {
            setQueuedNumberMessage(
              `Prompt successfully queued. There are ${queuedNumber} prompts ahead of you.`
            );
          }
        });
        socketRef.current.on('disconnect', () => {
          console.log('Disconnected', socketId);
        });
      });
    }
    // Clean up the socket connection when the component unmounts
    return () => {
      if (socketRef.current) {
        socketRef.current.off('response');
        socketRef.current.disconnect();
      }
    };
  }, []);

  const SendPrompt = (regenerate) => {
    if (socketRef.current) {
      let tempPrompt = prompt;
      //if regenerate is true, set current prompt
      if (regenerate) {
        regenerateClicked.current = true;
        tempPrompt = previousChats
          .filter((item) => item.role === 'user')
          .pop()?.content;
      }

      socketRef.current.emit('prompt', {
        prompt: tempPrompt,
        model: selectedModel,
        npc: JSON.stringify(selectedNpc),
      });

      setIsResponseLoading(true);

      // if (!regenerate) {
      setPreviousChats((prevChats) => [
        ...prevChats,
        {
          role: 'user',
          content: tempPrompt,
        },
        {
          role: 'assistant',
          content: loadingPlaceholder,
        },
      ]);
    } else {
      console.error('Socket connection not established.');
    }
  };

  useEffect(() => {
    if (prompt && message) {
      const newOutput = previousChats;
      // @ts-ignore
      newOutput[previousChats.length - 1].content = message;
      // @ts-ignore
      setPreviousChats(newOutput);
    }
  }, [message]);

  useEffect(() => {
    if (summaryDetail) {
      console.log(summaryDetail);
      const newOutput = [...previousChats];

      // @ts-ignore
      newOutput[previousChats.length - 1].model = summaryDetail.model;
      newOutput[
        previousChats.length - 1
      ].speed = `${summaryDetail.speed} token/s`;
      newOutput[
        previousChats.length - 1
      ].elapsedTime = `${summaryDetail.elapsedTime}s`;
      setResRefId(summaryDetail.responseRefId);
      newOutput[
        previousChats.length - 1
      ].responseRefId = `${summaryDetail.responseRefId}`;
      newOutput[
        previousChats.length - 1
      ].completed = `${summaryDetail.completed}`;
      newOutput[previousChats.length - 1].coins = `${summaryDetail.coins}`;

      // @ts-ignore
      setPreviousChats(newOutput);
    }
  }, [summaryDetail]);

  const handleTextAreaKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // Prevent adding a new line
      submitHandler(e); // Submit the form
    }
  };
  const handleRegenerate = async (e) => {
    submitHandler(e, true);
    if (resRefId) {
      await fetch(
        `${FullmetalAPIURL}/reportResponse?responseRefId=${resRefId}&regenerate=${true}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }
  };

  useEffect(() => {
    if (models) {
      setSelectedModel(models[0]);
    }
  }, [models]);

  const handleReportClick = async (chatMsg) => {
    try {
      if (chatMsg && chatMsg.responseRefId) {
        const response = await fetch(
          `${FullmetalAPIURL}/reportResponse?responseRefId=${chatMsg.responseRefId}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        const data = await response.json();

        if (data.status === true) {
          toast.success(data.message);
          setClickedButtons((prevClickedButtons) => ({
            ...prevClickedButtons,
            [chatMsg.responseRefId]: true,
          }));
        }
      } else {
        console.error('Request failed');
      }
    } catch (error) {
      console.error('Fetch error:', error);
    }
  };
  // const currentChat = previousChats.filter(
  //   (prevChat) => prevChat.title === currentTitle
  // )

  const currentTime = new Date();
  return (
    <>
      <div className="container">
        {/* <section className="sidebar">
            <div className="sidebar-header" role="button">
              <BiPlus size={20} />
              <button>New Chat</button>
            </div>
            <div className="sidebar-history">
              {uniqueTitles.length > 0 && <p>Today</p>}
              <ul>
                {uniqueTitles?.map((uniqueTitle, idx) => (
                  <li
                    key={idx}
                    onClick={() => backToHistoryPrompt(uniqueTitle)}
                  >
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
        <section className="main ">
          <Header />
          <h2 className="text-3xl font-bold mb-5 w-full">
            This is{' '}
            <a
              href="http://fullmetal.ai/"
              target="_blank"
              rel="noreferrer"
              style={{ color: 'lightblue' }}
            >
              Fullmetal.Ai
            </a>{' '}
            chat demo (
            <a
              href="https://github.com/m0dE/fullmetal-chat-example"
              target="_blank"
              rel="noreferrer"
              style={{ color: 'lightblue' }}
            >
              view source <BiLogoGithub size={20} className="inline-block" />
              {/* <FontAwesomeIcon className='mr-2' icon={faGithub} /> */}
            </a>
            )
          </h2>
          <small className="footer-text">
            <span>
              Free Research Preview.{' '}
              <a
                href="http://fullmetal.ai/"
                target="_blank"
                rel="noreferrer"
                style={{ color: 'lightblue' }}
              >
                Fullmetal
              </a>{' '}
              may produce inaccurate information about people, places, or facts.{' '}
              <a
                href="http://fullmetal.ai/"
                target="_blank"
                rel="noreferrer"
                style={{ color: 'lightblue' }}
              >
                Fullmetal
              </a>{' '}
              {currentTime.getFullYear()} Version
            </span>
          </small>

          <hr />
          {models && !npcs && (
            <div style={{ display: 'flex' }}>
              {/* <span style={{ margin: '20px 10px' }}>Model: </span> */}
              <select
                onChange={(e) => setSelectedModel(e.target.value)}
                value={selectedModel}
                style={{
                  margin: '15px 0',
                  padding: '5px 15px',
                  borderRadius: '10px',
                }}
              >
                {models.map((key) => (
                  <option key={key} value={key}>
                    {key}
                  </option>
                ))}
              </select>
            </div>
          )}

          {npcs && (
            <>
              <div className="flex w-1/4">
                <span className="mt-6 mr-2  w-1/4">My NPC: </span>
                <select
                  onChange={(e) => {
                    setSelectedModel(e.target.value);
                    setSelectedNpc(
                      JSON.parse(
                        e.target.options[e.target.selectedIndex].getAttribute(
                          'data-npc'
                        )
                      )
                    );
                  }}
                  value={selectedModel}
                  style={{
                    margin: '15px 0',
                    padding: '5px 15px',
                    borderRadius: '10px',
                  }}
                >
                  {npcs.map((npc, index) => (
                    <option
                      key={index}
                      value={npc.model}
                      data-npc={JSON.stringify(npc)}
                    >
                      {npc.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-center">
                <a
                  href="https://app.fullmetal.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-500 hover:underline"
                >
                  Create More NPCs
                </a>
              </div>
            </>
          )}

          <div className="main-header">
            {previousChats.length ? (
              <ul>
                {previousChats?.map((chatMsg, idx) => (
                  <div key={idx}>
                    <li
                      className="fullmetal-chat-li"
                      ref={scrollToLastItem}
                      style={
                        chatMsg.role === 'user'
                          ? { backgroundColor: 'unset' }
                          : {}
                      }
                    >
                      <img
                        src={
                          chatMsg.role === 'user'
                            ? '/face_logo.svg'
                            : '/fullmetal.png'
                        }
                        alt={
                          chatMsg.role === 'user' ? 'Face icon' : 'ChatGPT icon'
                        }
                        style={{
                          backgroundColor: chatMsg.role === 'user' && '#ECECF1',
                        }}
                      />
                      <div
                        style={{
                          wordWrap: 'break-word',
                          whiteSpace: 'pre-wrap',
                          width: '-webkit-fill-available',
                        }}
                      >
                        <Markdown
                          components={{
                            code({
                              node,
                              inline,
                              className,
                              children,
                              ...props
                            }) {
                              const match = /language-(\w+)/.exec(
                                className || ''
                              );

                              return (
                                <SyntaxHighlighter
                                  style={dracula}
                                  PreTag="div"
                                  language={'javascript'}
                                  children={String(children).replace(/\n$/, '')}
                                  {...props}
                                />
                              );
                            },
                          }}
                        >
                          {chatMsg.content}
                        </Markdown>
                      </div>
                      <span>
                        {!clickedButtons[chatMsg.responseRefId] &&
                        chatMsg.completed &&
                        chatMsg.role === 'assistant' ? (
                          <button
                            className="tooltip"
                            onClick={() => handleReportClick(chatMsg)}
                          >
                            <span className="tooltiptext">
                              Report this response
                            </span>

                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              height="1.5em"
                              viewBox="0 0 512 512"
                              fill="#b3b3b3"
                            >
                              <path d="M323.8 477.2c-38.2 10.9-78.1-11.2-89-49.4l-5.7-20c-3.7-13-10.4-25-19.5-35l-51.3-56.4c-8.9-9.8-8.2-25 1.6-33.9s25-8.2 33.9 1.6l51.3 56.4c14.1 15.5 24.4 34 30.1 54.1l5.7 20c3.6 12.7 16.9 20.1 29.7 16.5s20.1-16.9 16.5-29.7l-5.7-20c-5.7-19.9-14.7-38.7-26.6-55.5c-5.2-7.3-5.8-16.9-1.7-24.9s12.3-13 21.3-13L448 288c8.8 0 16-7.2 16-16c0-6.8-4.3-12.7-10.4-15c-7.4-2.8-13-9-14.9-16.7s.1-15.8 5.3-21.7c2.5-2.8 4-6.5 4-10.6c0-7.8-5.6-14.3-13-15.7c-8.2-1.6-15.1-7.3-18-15.2s-1.6-16.7 3.6-23.3c2.1-2.7 3.4-6.1 3.4-9.9c0-6.7-4.2-12.6-10.2-14.9c-11.5-4.5-17.7-16.9-14.4-28.8c.4-1.3 .6-2.8 .6-4.3c0-8.8-7.2-16-16-16H286.5c-12.6 0-25 3.7-35.5 10.7l-61.7 41.1c-11 7.4-25.9 4.4-33.3-6.7s-4.4-25.9 6.7-33.3l61.7-41.1c18.4-12.3 40-18.8 62.1-18.8H384c34.7 0 62.9 27.6 64 62c14.6 11.7 24 29.7 24 50c0 4.5-.5 8.8-1.3 13c15.4 11.7 25.3 30.2 25.3 51c0 6.5-1 12.8-2.8 18.7C504.8 238.3 512 254.3 512 272c0 35.3-28.6 64-64 64l-92.3 0c4.7 10.4 8.7 21.2 11.8 32.2l5.7 20c10.9 38.2-11.2 78.1-49.4 89zM32 384c-17.7 0-32-14.3-32-32V128c0-17.7 14.3-32 32-32H96c17.7 0 32 14.3 32 32V352c0 17.7-14.3 32-32 32H32z" />
                            </svg>
                          </button>
                        ) : (
                          clickedButtons[chatMsg.responseRefId] && (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              height="1.5em"
                              viewBox="0 0 512 512"
                              style={{ fill: '#b3b3b3' }}
                            >
                              <path d="M313.4 479.1c26-5.2 42.9-30.5 37.7-56.5l-2.3-11.4c-5.3-26.7-15.1-52.1-28.8-75.2H464c26.5 0 48-21.5 48-48c0-18.5-10.5-34.6-25.9-42.6C497 236.6 504 223.1 504 208c0-23.4-16.8-42.9-38.9-47.1c4.4-7.3 6.9-15.8 6.9-24.9c0-21.3-13.9-39.4-33.1-45.6c.7-3.3 1.1-6.8 1.1-10.4c0-26.5-21.5-48-48-48H294.5c-19 0-37.5 5.6-53.3 16.1L202.7 73.8C176 91.6 160 121.6 160 153.7V192v48 24.9c0 29.2 13.3 56.7 36 75l7.4 5.9c26.5 21.2 44.6 51 51.2 84.2l2.3 11.4c5.2 26 30.5 42.9 56.5 37.7zM32 384H96c17.7 0 32-14.3 32-32V128c0-17.7-14.3-32-32-32H32C14.3 96 0 110.3 0 128V352c0 17.7 14.3 32 32 32z" />
                            </svg>
                          )
                        )}
                      </span>
                    </li>
                    {chatMsg.role !== 'user' &&
                      chatMsg.model &&
                      chatMsg.speed &&
                      chatMsg.elapsedTime && (
                        <li
                          className="fullmetal-chat-li"
                          style={{
                            textAlign: 'right',
                            display: 'block',
                            padding: '2px',
                            backgroundColor: 'transparent',
                          }}
                        >
                          <small style={{ color: '#1acb1a' }}>
                            Served by {chatMsg.model} for {chatMsg.coins} coins
                            in {chatMsg.elapsedTime}, Speed={chatMsg.speed}
                          </small>
                        </li>
                      )}
                  </div>
                ))}
              </ul>
            ) : (
              <div className="info">
                <p>
                  <a
                    href="http://fullmetal.ai/"
                    target="_blank"
                    rel="noreferrer"
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

          <div>
            <div className="main-bottom">
              {!isResponseLoading && previousChats.length ? (
                <>
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRegenerate(e);
                    }}
                    className="regenerate-button"
                  >
                    <button className="tooltip">
                      <FontAwesomeIcon className="" icon={faRedoAlt} />{' '}
                      <span className="tooltiptext">Regenerate text</span>
                    </button>
                  </span>
                </>
              ) : (
                isResponseLoading &&
                regenerateClicked.current && (
                  <button className="regenerate-button ">
                    <div className="loading">...</div>
                  </button>
                )
              )}
              <div className="form-container">
                <textarea
                  ref={textboxRef}
                  type="text"
                  placeholder="Send a message."
                  spellCheck="false"
                  onChange={(e) => {
                    setPrompt(e.target.value);
                  }}
                  readOnly={isResponseLoading}
                  onKeyDown={handleTextAreaKeyPress}
                  value={
                    isResponseLoading
                      ? ` ${queuedNumberMessage}`
                      : prompt.charAt(0).toUpperCase() + prompt.slice(1)
                  }
                ></textarea>
                {!isResponseLoading ? (
                  <button type="button" onClick={submitHandler}>
                    <BiSend size={20} />
                  </button>
                ) : (
                  !regenerateClicked.current && (
                    <div className="loading">...</div>
                  )
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

export default Chat;
