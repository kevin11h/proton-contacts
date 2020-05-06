import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
    useApi,
    useMailSettings,
    useEventManager,
    useNotifications,
    useLoading,
    Alert,
    Row,
    Label,
    Field,
    Info,
    LinkButton,
    ContentModal,
    InnerModal,
    DialogModal,
    ResetButton,
    FooterModal,
    PrimaryButton,
    Icon
} from 'react-components';
import { c } from 'ttag';

import { prepareContacts } from 'proton-shared/lib/contacts/encrypt';
import { hasCategories, reOrderByPref } from 'proton-shared/lib/contacts/properties';
import { addContacts } from 'proton-shared/lib/api/contacts';
import getPublicKeysEmailHelper from 'proton-shared/lib/api/helpers/getPublicKeysEmailHelper';
import { extractScheme } from 'proton-shared/lib/api/helpers/mailSettings';
import { sortPinnedKeys, sortApiKeys, getPublicKeyModel } from 'proton-shared/lib/keys/publicKeys';
import { uniqueBy } from 'proton-shared/lib/helpers/array';

import { VCARD_KEY_FIELDS } from 'proton-shared/lib/contacts/constants';
import { CATEGORIES } from '../constants';

import ContactMIMETypeSelect from './ContactMIMETypeSelect';
import ContactPgpSettings from './ContactPgpSettings';
import { MIME_TYPES, PGP_SCHEMES } from 'proton-shared/lib/constants';
import { getKeyInfoFromProperties, toKeyProperty } from 'proton-shared/lib/contacts/keyProperties';

const { PGP_INLINE } = PGP_SCHEMES;
const { INCLUDE, IGNORE } = CATEGORIES;

const ContactEmailSettingsModal = ({ userKeysList, contactID, properties, emailProperty, ...rest }) => {
    const api = useApi();
    const { call } = useEventManager();
    const [model, setModel] = useState({ publicKeys: { apiKeys: [], pinnedKeys: [] } });
    const [showPgpSettings, setShowPgpSettings] = useState(false);
    const [loading, withLoading] = useLoading();
    const { createNotification } = useNotifications();
    const [mailSettings, loadingMailSettings] = useMailSettings();

    const isLoading = loading || loadingMailSettings;
    const { value: Email, group: emailGroup } = emailProperty;
    const isMimeTypeFixed = model.isPGPExternal && model.sign;
    const hasPGPInline = (model.scheme || extractScheme(mailSettings.PGPScheme)) === PGP_INLINE;

    /**
     * Initialize the key model for the modal
     * @returns {Promise}
     */
    const prepare = async (api) => {
        const apiKeysConfig = await getPublicKeysEmailHelper(api, Email);
        const pinnedKeysConfig = await getKeyInfoFromProperties(properties, emailGroup);
        const publicKeyModel = await getPublicKeyModel({
            emailAddress: Email,
            apiKeysConfig,
            pinnedKeysConfig,
            mailSettings
        });
        setModel(publicKeyModel);
    };

    /**
     * Collect keys from the model to save
     * @param {String} group attached to the current email address
     * @returns {Array} key properties to save in the vCard
     */
    const getKeysProperties = (group) => {
        const allKeys = model.isPGPInternal
            ? [...model.publicKeys.apiKeys]
            : [...model.publicKeys.apiKeys, ...model.publicKeys.pinnedKeys];
        const trustedKeys = allKeys.filter((publicKey) => model.trustedFingerprints.has(publicKey.getFingerprint()));
        const uniqueTrustedKeys = uniqueBy(trustedKeys, (publicKey) => publicKey.getFingerprint());
        return uniqueTrustedKeys.map((publicKey, index) => toKeyProperty({ publicKey, group, index }));
    };

    /**
     * Save relevant key properties in the vCard
     * @returns {Promise}
     */
    const handleSubmit = async () => {
        const otherProperties = properties.filter(({ field, group }) => {
            return !['email', ...VCARD_KEY_FIELDS].includes(field) || (group && group !== emailGroup);
        });
        const emailProperties = [
            emailProperty,
            model.mimeType && { field: 'x-pm-mimetype', value: model.mimeType, group: emailGroup },
            model.isPGPExternalWithoutWKDKeys &&
                model.encrypt !== undefined && { field: 'x-pm-encrypt', value: '' + model.encrypt, group: emailGroup },
            model.isPGPExternalWithoutWKDKeys &&
                model.sign !== undefined && { field: 'x-pm-sign', value: '' + model.sign, group: emailGroup },
            model.isPGPExternalWithoutWKDKeys &&
                model.scheme && { field: 'x-pm-scheme', value: model.scheme, group: emailGroup },
            ...getKeysProperties(emailGroup) // [{ field: 'key' }, ]
        ].filter(Boolean);
        const allProperties = reOrderByPref(otherProperties.concat(emailProperties));
        const Contacts = await prepareContacts([allProperties], userKeysList[0]);
        const labels = hasCategories(allProperties) ? INCLUDE : IGNORE;
        await api(addContacts({ Contacts, Overwrite: +!!contactID, Labels: labels }));
        await call();
        rest.onClose();
        createNotification({ text: c('Success').t`Preferences saved` });
    };

    useEffect(() => {
        const abortController = new AbortController();
        const apiWithAbort = (config) => api({ ...config, signal: abortController.signal });
        // prepare the model once mail settings have been loaded
        if (!loadingMailSettings) {
            withLoading(prepare(apiWithAbort));
        }
        return () => {
            abortController.abort();
        };
    }, [loadingMailSettings]);

    useEffect(() => {
        /**
         * When the list of trusted, expired or revoked keys change,
         * * update the encrypt toggle (off if all keys are expired or no keys are pinned)
         * * re-check if the new keys can send
         * * re-order api keys (trusted take preference)
         * * move expired keys to the bottom of the list
         */
        const noPinnedKeyCanSend =
            !!model.publicKeys.pinnedKeys.length &&
            !model.publicKeys.pinnedKeys.some((publicKey) => {
                const fingerprint = publicKey.getFingerprint();
                const canSend =
                    !model.expiredFingerprints.has(fingerprint) && !model.revokedFingerprints.has(fingerprint);
                return canSend;
            });
        setModel((model) => ({
            ...model,
            encrypt: !noPinnedKeyCanSend && !!model.publicKeys.pinnedKeys.length && model.encrypt,
            publicKeys: {
                apiKeys: sortApiKeys(model.publicKeys.apiKeys, model.trustedFingerprints, model.verifyOnlyFingerprints),
                pinnedKeys: sortPinnedKeys(
                    model.publicKeys.pinnedKeys,
                    model.expiredFingerprints,
                    model.revokedFingerprints
                )
            }
        }));
    }, [model.trustedFingerprints, model.expiredFingerprints, model.revokedFingerprints, model.verifyOnlyFingerprints]);

    useEffect(() => {
        // take into account rules relating email format and cryptographic scheme
        if (!isMimeTypeFixed) {
            return;
        }
        // PGP/Inline should force the email format to plaintext
        if (hasPGPInline) {
            return setModel((model) => ({ ...model, mimeType: MIME_TYPES.PLAINTEXT }));
        }
        // If PGP/Inline is not selected, go back to automatic
        setModel((model) => ({ ...model, mimeType: undefined }));
    }, [isMimeTypeFixed, hasPGPInline]);

    return (
        // we cannot use the FormModal component because we need to introduce the class ellipsis inside the header
        <DialogModal modalTitleID="modalTitle" {...rest}>
            <header className="pm-modalHeader">
                <button
                    type="button"
                    className="pm-modalClose"
                    title={c('Action').t`Close modal`}
                    onClick={rest.onClose}
                >
                    <Icon className="pm-modalClose-icon" name="close" />
                    <span className="sr-only">{c('Action').t`Close modal`}</span>
                </button>
                <h1 id="modalTitle" className="pm-modalTitle ellipsis">
                    {c('Title').t`Email settings (${Email})`}
                </h1>
            </header>
            <ContentModal onSubmit={() => withLoading(handleSubmit())} onReset={rest.onClose} noValidate={false}>
                <InnerModal>
                    {!isMimeTypeFixed ? (
                        <Alert>
                            {c('Info')
                                .t`Select the email format you want to be used by default when sending an email to this email address.`}
                        </Alert>
                    ) : hasPGPInline ? (
                        <Alert>
                            {c('Info')
                                .t`PGP/Inline is only compatible with Plain Text format. Please note that ProtonMail always signs PGP/Inline messages.`}
                        </Alert>
                    ) : (
                        <Alert>
                            {c('Info')
                                .t`PGP/MIME automatically sends the message using the current composer mode. Please note that ProtonMail always signs PGP/MIME messages.`}
                        </Alert>
                    )}
                    <Row>
                        <Label>
                            {c('Label').t`Email format`}
                            <Info
                                className="ml0-5"
                                title={c('Tooltip')
                                    .t`Automatic indicates that the format in the composer is used to send to this user. Plain text indicates that the message will always be converted to plain text on send.`}
                            />
                        </Label>
                        <Field>
                            <ContactMIMETypeSelect
                                disabled={isLoading || isMimeTypeFixed}
                                value={model.mimeType}
                                onChange={(mimeType) => setModel({ ...model, mimeType })}
                            />
                        </Field>
                    </Row>
                    <div className="mb1">
                        <LinkButton onClick={() => setShowPgpSettings(!showPgpSettings)} disabled={isLoading}>
                            {showPgpSettings
                                ? c('Action').t`Hide advanced PGP settings`
                                : c('Action').t`Show advanced PGP settings`}
                        </LinkButton>
                    </div>
                    {showPgpSettings ? (
                        <ContactPgpSettings model={model} setModel={setModel} mailSettings={mailSettings} />
                    ) : null}
                </InnerModal>
                <FooterModal>
                    <ResetButton>{c('Action').t`Cancel`}</ResetButton>
                    <PrimaryButton loading={isLoading} type="submit">
                        {c('Action').t`Save`}
                    </PrimaryButton>
                </FooterModal>
            </ContentModal>
        </DialogModal>
    );
};

ContactEmailSettingsModal.propTypes = {
    userKeysList: PropTypes.array,
    contactID: PropTypes.string,
    properties: PropTypes.array,
    emailProperty: PropTypes.object.isRequired
};

export default ContactEmailSettingsModal;
