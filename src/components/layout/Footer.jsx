import React from 'react';

const Footer = () => {
  return (
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
        may produce inaccurate information about people, places, or facts.{' '}
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
  );
};

export default Footer;
