import Component from '@ember/component';
import ThemeErrorsModal from '../modals/design/theme-errors';
import calculatePosition from 'ember-basic-dropdown/utils/calculate-position';
import classic from 'ember-classic-decorator';
import {action} from '@ember/object';
import {and, match} from '@ember/object/computed';
import {inject} from 'ghost-admin/decorators/inject';
import {inject as service} from '@ember/service';

@classic
export default class Footer extends Component {
    @service session;
    @service router;
    @service whatsNew;
    @service feature;
    @service modals;
    @service themeManagement;

    @inject config;

    @and('config.clientExtensions.dropdown', 'session.user.isOwnerOnly')
        showDropdownExtension;

    @match('router.currentRouteName', /^settings/)
        isSettingsRoute;

    @action
    openThemeErrors() {
        this.advancedModal = this.modals.open(ThemeErrorsModal, {
            title: 'Theme errors',
            canActivate: false,
            // Warnings will only be set for developers, otherwise it will always be empty
            warnings: this.themeManagement.activeTheme.warnings,
            errors: this.themeManagement.activeTheme.errors
        });
    }

    get hasThemeErrors() {
        return this.themeManagement.activeTheme && this.themeManagement.activeTheme.errors.length;
    }

    // equivalent to "left: auto; right: -20px"
    userDropdownPosition(trigger, dropdown) {
        let {horizontalPosition, verticalPosition, style} = calculatePosition(...arguments);
        let {width: dropdownWidth} = dropdown.firstElementChild.getBoundingClientRect();

        style.right += (dropdownWidth - 20);
        style['z-index'] = '1100';

        return {horizontalPosition, verticalPosition, style};
    }
}
