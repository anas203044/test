import AppContext from 'AppContext';
import {useContext} from 'react';
import {hasCommentsEnabled, hasMultipleNewsletters, isEmailSuppressed} from 'utils/helpers';

import PaidAccountActions from './PaidAccountActions';
import EmailNewsletterAction from './EmailNewsletterAction';
import EmailPreferencesAction from './EmailPreferencesAction';

const AccountActions = () => {
    const {member, onAction, site} = useContext(AppContext);
    const {name, email} = member;

    const openEditProfile = () => {
        onAction('switchPage', {
            page: 'accountProfile',
            lastPage: 'accountHome'
        });
    };

    const showEmailPreferences = hasMultipleNewsletters({site}) || hasCommentsEnabled({site}) || isEmailSuppressed({member});

    return (
        <div>
            <div className='gh-portal-list'>
                <section>
                    <div className='gh-portal-list-detail'>
                        <h3>{(name ? name : 'Account')}</h3>
                        <p>{email}</p>
                    </div>
                    <button
                        data-test-button='edit-profile'
                        className='gh-portal-btn gh-portal-btn-list'
                        onClick={e => openEditProfile(e)}
                    >
                        Edit
                    </button>
                </section>

                <PaidAccountActions />
                {
                    showEmailPreferences
                        ? <EmailPreferencesAction />
                        : <EmailNewsletterAction />
                }

            </div>
            {/* <ProductList openUpdatePlan={openUpdatePlan}></ProductList> */}
        </div>
    );
};

export default AccountActions;
