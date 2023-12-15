import React from 'react';
import { BiLogoGithub } from 'react-icons/bi';

const Header = () => {
  return (
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
  );
};

export default Header;
