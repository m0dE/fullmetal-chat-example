import { useState, useEffect, useRef } from 'react';
import { BiSend } from 'react-icons/bi';
import io from 'socket.io-client';
import { FullmetalAPIURL, ChatBackendScoketUrl } from './config';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRedoAlt } from '@fortawesome/free-solid-svg-icons';
import Footer from './components/layout/Footer';
import Header from './components/layout/Header';
import fetchModelsUtility from './util/FetchModels';
import MarkDown from './components/markDown/MarkDown';
import ChatPage from './components/layout/ChatPage';
import ChatInput from './components/chat/ChatInput';
function App() {
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

        <section className='main'>
          <Header />
          <hr />
          <ChatPage />
          <Footer />
        </section>
      </div>
    </>
  );
}

export default App;
