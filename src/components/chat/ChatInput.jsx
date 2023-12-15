import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRedoAlt } from '@fortawesome/free-solid-svg-icons';
import { BiSend } from 'react-icons/bi';

const ChatInput = ({
  prompt,
  isResponseLoading,
  previousChats,
  handleRegenerate,
  regenerateClicked,
  textboxRef,
  setPrompt,
  handleTextAreaKeyPress,
  submitHandler,
  queuedNumberMessage,
}) => {
  return (
    <div>
      <div className='main-bottom'>
        {!isResponseLoading && previousChats.length ? (
          <span
            onClick={(e) => {
              e.stopPropagation();
              handleRegenerate(e);
            }}
            className='regenerate-button'
          >
            <span className='icon'>
              <FontAwesomeIcon icon={faRedoAlt} />
            </span>
            Regenerate
          </span>
        ) : (
          isResponseLoading &&
          regenerateClicked && (
            <button className='regenerate-button '>
              <div
                className='loading-spinner'
                style={{ marginRight: '4px' }}
              ></div>
              Regenerating
            </button>
          )
        )}
        <div className='form-container'>
          <textarea
            ref={textboxRef}
            type='text'
            placeholder='Send a message.'
            spellCheck='false'
            onChange={(e) => {
              setPrompt(e.target.value);
            }}
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
    </div>
  );
};

export default ChatInput;
