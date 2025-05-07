import React, { useEffect, useCallback, useReducer } from 'react';
import Modal from '../../BaseComponents/Modal/Modal';
import Button from '../../BaseComponents/Button/Button';
import { useTranslation } from 'react-i18next';

interface TimeoutState {
  countdownStart: boolean;
  timeRemaining: number;
  screenReaderCountdown: string;
}

type TimeoutAction =
  | { type: 'START_COUNTDOWN'; payload: boolean }
  | { type: 'UPDATE_TIME_REMAINING'; payload: number }
  | { type: 'UPDATE_SCREEN_READER_COUNTDOWN'; payload: string };

const COUNTDOWN_START_OFFSET = 60000;
const INITIAL_TIME_REMAINING = 60;
const UPDATE_INTERVAL = 1000;
const SIGNOUT_DELAY = 1000;
const SCREEN_READER_UPDATE_INTERVAL = 20;

export default function TimeoutPopup(props: TimeoutPopupPropTypes) {
  const {
    show,
    millisecondsTillSignout,
    staySignedinHandler,
    signoutHandler,
    autoSignoutHandler,
    isAuthorised,
    isConfirmationPage,
    staySignedInButtonText,
    signoutButtonText,
    children
  } = props;

  const staySignedInCallback = useCallback(
    event => {
      if (event.key === 'Escape') staySignedinHandler();
    },
    [staySignedinHandler]
  );

  const { t } = useTranslation();

  const initialTimeoutState: TimeoutState = {
    countdownStart: false,
    timeRemaining: INITIAL_TIME_REMAINING,
    screenReaderCountdown: ''
  };

  const reducer = (state: TimeoutState, action: TimeoutAction) => {
    switch (action.type) {
      case 'START_COUNTDOWN':
        return { ...state, countdownStart: action.payload };
      case 'UPDATE_TIME_REMAINING':
        return { ...state, timeRemaining: action.payload };
      case 'UPDATE_SCREEN_READER_COUNTDOWN':
        return { ...state, screenReaderCountdown: action.payload };
      default:
        return state;
    }
  };

  const [timeoutState, dispatch] = useReducer(reducer, initialTimeoutState);

  useEffect(() => {
    if (!show) {
      // Reset countdown and related states if show is false
      dispatch({ type: 'UPDATE_TIME_REMAINING', payload: INITIAL_TIME_REMAINING });
      dispatch({ type: 'UPDATE_SCREEN_READER_COUNTDOWN', payload: '' });
      dispatch({ type: 'START_COUNTDOWN', payload: false });
    } else {
      // Start the countdown only if show is true
      const milisecondsTilCountdown = millisecondsTillSignout - COUNTDOWN_START_OFFSET;
      const countdownTimeout = setTimeout(() => {
        dispatch({ type: 'START_COUNTDOWN', payload: true });
      }, milisecondsTilCountdown);

      return () => {
        clearTimeout(countdownTimeout);
      };
    }
  }, [show]);
  function screenReaderContentDisplay() {
    if (!isConfirmationPage) {
      return isAuthorised
        ? t('FOR_YOUR_SECURITY_WE_WILL_SIGN_YOU_OUT')
        : t('FOR_YOUR_SECURITY_WE_WILL_DELETE_YOUR_ANSWER');
    } else {
      return t('FOR_YOUR_SECURITY_WE_WILL_AUTOMATICALLY_CLOSE_IN');
    }
  }
  useEffect(() => {
    if (timeoutState.countdownStart) {
      if (timeoutState.timeRemaining === INITIAL_TIME_REMAINING) {
        dispatch({
          type: 'UPDATE_SCREEN_READER_COUNTDOWN',
          payload: `${screenReaderContentDisplay()} ${t('1_MINUTE')}`
        });
      }

      if (timeoutState.timeRemaining === 0) return;

      const timeRemainingInterval = setInterval(() => {
        dispatch({ type: 'UPDATE_TIME_REMAINING', payload: timeoutState.timeRemaining - 1 });
      }, UPDATE_INTERVAL);

      return () => clearInterval(timeRemainingInterval);
    }
  }, [timeoutState.countdownStart, timeoutState.timeRemaining]);

  useEffect(() => {
    if (
      timeoutState.timeRemaining < INITIAL_TIME_REMAINING &&
      timeoutState.timeRemaining % SCREEN_READER_UPDATE_INTERVAL === 0
    ) {
      dispatch({
        type: 'UPDATE_SCREEN_READER_COUNTDOWN',
        payload: `${screenReaderContentDisplay()} ${timeoutState.timeRemaining} ${t('SECONDS')}`
      });
    }
  }, [timeoutState.timeRemaining]);

  useEffect(() => {
    if (timeoutState.timeRemaining === 0) {
      const signoutHandlerTimeout = setTimeout(() => {
        autoSignoutHandler();
      }, SIGNOUT_DELAY);

      return () => {
        clearTimeout(signoutHandlerTimeout);
      };
    }
  }, [timeoutState.timeRemaining]);

  useEffect(() => {
    if (show) {
      window.addEventListener('keydown', staySignedInCallback);
    } else {
      window.removeEventListener('keydown', staySignedInCallback);
    }
    return () => {
      window.removeEventListener('keydown', staySignedInCallback);
    };
  }, [show]);

  const timeoutText = () => {
    const { countdownStart, timeRemaining } = timeoutState;

    if (countdownStart) {
      if (timeRemaining === 60) {
        return `${t('1_MINUTE')}.`;
      } else if (timeRemaining === 1) {
        return `${timeRemaining} ${t('SECOND')}.`;
      } else if (timeRemaining < 60 || timeRemaining === 0) {
        return `${timeRemaining} ${t('SECONDS')}.`;
      }
    }

    return `${t('2_MINUTES')}.`;
  };

  if (children) {
    return (
      <Modal show={show} id='timeout-popup'>
        <div>
          {children}
          <div className='govuk-button-group govuk-!-padding-top-4'>
            <Button type='button' onClick={staySignedinHandler}>
              {staySignedInButtonText}
            </Button>

            <a id='modal-signout-btn' className='govuk-link' href='#' onClick={signoutHandler}>
              {signoutButtonText}
            </a>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal show={show} id='timeout-popup'>
      <div>
        <h1 id='hmrc-timeout-heading' className='govuk-heading-m push--top'>
          {t('YOURE_ABOUT_TO_BE_SIGNED_OUT')}
        </h1>

        <p className='govuk-body hmrc-timeout-dialog__message' aria-hidden='true'>
          {`${t('FOR_YOUR_SECURITY_WE_WILL_SIGN_YOU_OUT')} `}
          <span className='hmrc-timeout-dialog__countdown'>{timeoutText()}</span>
        </p>
        <p className='govuk-visually-hidden screenreader-content' aria-live='assertive'>
          {timeoutState.countdownStart
            ? `${timeoutState.screenReaderCountdown}`
            : `${t('FOR_YOUR_SECURITY_WE_WILL_SIGN_YOU_OUT')} ${t('2_MINUTES')}.`}
        </p>

        <div className='govuk-button-group govuk-!-padding-top-4'>
          <Button type='button' onClick={staySignedinHandler}>
            {t('STAY_SIGNED_IN')}
          </Button>

          <a id='modal-staysignin-btn' className='govuk-link' href='#' onClick={signoutHandler}>
            {t('SIGN-OUT')}
          </a>
        </div>
      </div>
    </Modal>
  );
}

interface TimeoutPopupPropTypes {
  show: boolean;
  millisecondsTillSignout?: number;
  staySignedinHandler: () => void;
  signoutHandler: () => void;
  autoSignoutHandler: () => void;
  isAuthorised: boolean;
  staySignedInButtonText: string;
  signoutButtonText: string;
  children?: any;
  isConfirmationPage?: boolean;
}
