import React, { useState } from 'react';
import MarkDown from '../markDown/MarkDown';
import { FullmetalAPIURL } from '../../config';
import { toast } from 'react-toastify';

const ChatHistory = ({ previousChats, scrollToLastItem }) => {
  const [clickedButtons, setClickedButtons] = useState({});

  /**
   * The function `handleReportClick` sends a report of particular prompt if user doesn't likes response
   */
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
  return (
    <div className='main-header'>
      {previousChats.length ? (
        <ul>
          {previousChats?.map((chatMsg, idx) => (
            <React.Fragment key={idx}>
              <div>
                <li
                  className='fullmetal-chat-li'
                  ref={scrollToLastItem}
                  style={
                    chatMsg.role === 'user' ? { backgroundColor: 'unset' } : {}
                  }
                >
                  <img
                    src={
                      chatMsg.role === 'user'
                        ? '/face_logo.svg'
                        : '/fullmetal.png'
                    }
                    alt={chatMsg.role === 'user' ? 'Face icon' : 'ChatGPT icon'}
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
                    <MarkDown chatMsgContent={chatMsg.content} />
                  </div>
                  <span>
                    {!clickedButtons[chatMsg.responseRefId] &&
                    chatMsg.completed &&
                    chatMsg.role === 'assistant' ? (
                      <button
                        className='tooltip'
                        onClick={() => handleReportClick(chatMsg)}
                      >
                        <span className='tooltiptext'>
                          Report this response
                        </span>
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          height='2em'
                          viewBox='0 0 512 512'
                          fill='#b3b3b3'
                        >
                          <path d='M323.8 477.2c-38.2 10.9-78.1-11.2-89-49.4l-5.7-20c-3.7-13-10.4-25-19.5-35l-51.3-56.4c-8.9-9.8-8.2-25 1.6-33.9s25-8.2 33.9 1.6l51.3 56.4c14.1 15.5 24.4 34 30.1 54.1l5.7 20c3.6 12.7 16.9 20.1 29.7 16.5s20.1-16.9 16.5-29.7l-5.7-20c-5.7-19.9-14.7-38.7-26.6-55.5c-5.2-7.3-5.8-16.9-1.7-24.9s12.3-13 21.3-13L448 288c8.8 0 16-7.2 16-16c0-6.8-4.3-12.7-10.4-15c-7.4-2.8-13-9-14.9-16.7s.1-15.8 5.3-21.7c2.5-2.8 4-6.5 4-10.6c0-7.8-5.6-14.3-13-15.7c-8.2-1.6-15.1-7.3-18-15.2s-1.6-16.7 3.6-23.3c2.1-2.7 3.4-6.1 3.4-9.9c0-6.7-4.2-12.6-10.2-14.9c-11.5-4.5-17.7-16.9-14.4-28.8c.4-1.3 .6-2.8 .6-4.3c0-8.8-7.2-16-16-16H286.5c-12.6 0-25 3.7-35.5 10.7l-61.7 41.1c-11 7.4-25.9 4.4-33.3-6.7s-4.4-25.9 6.7-33.3l61.7-41.1c18.4-12.3 40-18.8 62.1-18.8H384c34.7 0 62.9 27.6 64 62c14.6 11.7 24 29.7 24 50c0 4.5-.5 8.8-1.3 13c15.4 11.7 25.3 30.2 25.3 51c0 6.5-1 12.8-2.8 18.7C504.8 238.3 512 254.3 512 272c0 35.3-28.6 64-64 64l-92.3 0c4.7 10.4 8.7 21.2 11.8 32.2l5.7 20c10.9 38.2-11.2 78.1-49.4 89zM32 384c-17.7 0-32-14.3-32-32V128c0-17.7 14.3-32 32-32H96c17.7 0 32 14.3 32 32V352c0 17.7-14.3 32-32 32H32z' />{' '}
                        </svg>
                      </button>
                    ) : (
                      clickedButtons[chatMsg.responseRefId] && (
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          height='2em'
                          viewBox='0 0 512 512'
                          style={{ fill: '#b3b3b3' }}
                        >
                          <path d='M313.4 479.1c26-5.2 42.9-30.5 37.7-56.5l-2.3-11.4c-5.3-26.7-15.1-52.1-28.8-75.2H464c26.5 0 48-21.5 48-48c0-18.5-10.5-34.6-25.9-42.6C497 236.6 504 223.1 504 208c0-23.4-16.8-42.9-38.9-47.1c4.4-7.3 6.9-15.8 6.9-24.9c0-21.3-13.9-39.4-33.1-45.6c.7-3.3 1.1-6.8 1.1-10.4c0-26.5-21.5-48-48-48H294.5c-19 0-37.5 5.6-53.3 16.1L202.7 73.8C176 91.6 160 121.6 160 153.7V192v48 24.9c0 29.2 13.3 56.7 36 75l7.4 5.9c26.5 21.2 44.6 51 51.2 84.2l2.3 11.4c5.2 26 30.5 42.9 56.5 37.7zM32 384H96c17.7 0 32-14.3 32-32V128c0-17.7-14.3-32-32-32H32C14.3 96 0 110.3 0 128V352c0 17.7 14.3 32 32 32z' />
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
                      className='fullmetal-chat-li'
                      style={{
                        textAlign: 'right',
                        display: 'block',
                        padding: '2px',
                        backgroundColor: 'transparent',
                      }}
                    >
                      <small style={{ color: '#1acb1a' }}>
                        Model={chatMsg.model}, Speed={chatMsg.speed}, Elapsed
                        Time={chatMsg.elapsedTime}
                      </small>
                    </li>
                  )}
              </div>
            </React.Fragment>
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
            is a distributed network of publicly-powered, self-hosted Large
            Language Models (LLMs). Our mission is to provide enhanced usability
            of open-source LLMs in terms of quality, performance, and
            accessibility.
          </p>
        </div>
      )}
    </div>
  );
};

export default ChatHistory;
