import React from 'react';
import { useTranslation } from 'react-i18next';
import { CookieDetail } from './interface';

export default function CookiePageTable({
  cookies,
  tableCaption
}: {
  cookies?: CookieDetail[];
  tableCaption?: string;
}) {
  const { t } = useTranslation();
  return (
    <table className='govuk-table'>
      <caption className='govuk-table__caption govuk-table__caption--m'>{tableCaption}</caption>
      <thead className='govuk-table__head'>
        <tr className='govuk-table__row'>
          <th scope='col' className='govuk-table__header'>
            {t('COOKIE_NAME')}
          </th>
          <th scope='col' className='govuk-table__header'>
            {t('COOKIE_PURPOSE')}
          </th>
          <th scope='col' className='govuk-table__header'>
            {t('COOKIE_EXPIRES')}
          </th>
        </tr>
      </thead>
      <tbody className='govuk-table__body'>
        {cookies.map(cookie => (
          <tr key={cookie.name} className='govuk-table__row'>
            <td className='govuk-table__cell'>{cookie.name}</td>
            <td className='govuk-table__cell'>{t(cookie.description)}</td>
            <td className='govuk-table__cell'>{t(cookie.expires)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
