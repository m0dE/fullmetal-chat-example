import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Footer from './components/layout/Footer';
import Header from './components/layout/Header';
import ChatPage from './components/layout/ChatPage';
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
