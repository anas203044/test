import AppContext from 'AppContext';
import ActionButton from 'components/common/ActionButton';
import {hasOnlyFreePlan} from 'utils/helpers';
import {useContext} from 'react';

const SubscribeButton = () => {
    const {site, action, brandColor, onAction} = useContext(AppContext);
    const {is_stripe_configured: isStripeConfigured} = site;

    if (!isStripeConfigured || hasOnlyFreePlan({site})) {
        return null;
    }
    const isRunning = ['checkoutPlan:running'].includes(action);

    const openPlanPage = () => {
        onAction('switchPage', {
            page: 'accountPlan',
            lastPage: 'accountHome'
        });
    };
    return (
        <ActionButton
            dataTestId={'view-plans'}
            isRunning={isRunning}
            label="View plans"
            onClick={() => openPlanPage()}
            brandColor={brandColor}
            style={{width: '100%'}}
        />
    );
};

export default SubscribeButton;
