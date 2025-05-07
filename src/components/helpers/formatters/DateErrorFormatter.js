import i18n from 'i18next';

// eslint-disable-next-line sonarjs/cognitive-complexity
const _DateErrorFormatter = (message, propertyName = '') => {
  const dateRegExp = /(\d*-\d*-\d*)/;
  const matchedDates = message.match(dateRegExp);
  const originalDate = matchedDates?.length > 0 ? matchedDates[0] : null;
  const targets = [];
  // TODO: refactor under US-19023
  const notAValidDateMessageString = 'is not a valid date';

  if (originalDate) {
    const [year, month, day] = originalDate.split('-');

    // When some 'parts' are missing
    let missingPartMessage = '';
    if (day === '') {
      missingPartMessage += ` ${i18n.t('A_DAY')}`;
      targets.push('day');
    }
    if (month === '') {
      if (missingPartMessage.length > 0) missingPartMessage += i18n.t('AND_MONTH');
      else missingPartMessage += i18n.t('A_MONTH');
      targets.push('month');
    }
    if (year === '') {
      if (missingPartMessage.length > 0) missingPartMessage += ` ${i18n.t('AND_YEAR')}`;
      else missingPartMessage += ` ${i18n.t('A_YEAR')}`;
      targets.push('year');
    }
    const shortPropertyName = i18n.t('DATE');

    propertyName = propertyName.toUpperCase();

    if (missingPartMessage.length > 0) {
      if (propertyName) {
        return {
          message: `${i18n.t(propertyName)} ${i18n.t('MUST_INCLUDE')} ${missingPartMessage}`,
          targets
        };
      } else {
        return {
          message: `${shortPropertyName} ${i18n.t('MUST_INCLUDE')} ${missingPartMessage}`,
          targets
        };
      }
    }

    // TODO: refactor under US-19023
    if (message.search(notAValidDateMessageString)) {
      if (propertyName) {
        return {
          message: `${i18n.t(propertyName)} ${i18n.t('MUST_BE_A_REAL_DATE')} `,
          targets
        };
      } else {
        return { message: `${shortPropertyName} ${i18n.t('MUST_BE_A_REAL_DATE')} `, targets };
      }
    }
  }
  return { message, targets };
};

export const DateErrorFormatter = (message, propertyName) => {
  if (propertyName === ' ') propertyName = i18n.t('DATE_OF_BIRTH');
  return _DateErrorFormatter(message, propertyName).message;
};

export const DateErrorTargetFields = message => {
  return _DateErrorFormatter(message).targets;
};
